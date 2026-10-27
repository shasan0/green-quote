import './db-setup';
import type { NextRequest } from 'next/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  connection: async () => {},
}));
import { GET as health } from '@/app/api/health/route';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as createQuoteHandler } from '@/app/api/quotes/route';
import { GET as getQuote } from '@/app/api/quotes/[id]/route';
import { jsonRequest, sessionCookie, validQuote } from './helpers';

const byId = (id: string) => ({ params: Promise.resolve({ id }) });

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any> | any;

const noParams = (handler: Handler) => (req: NextRequest) =>
  handler(req, { params: Promise.resolve({}) });

const register = noParams(registerRoute);
const login = noParams(loginRoute);
const createQuoteRoute = noParams(createQuoteHandler);

async function signUp(name: string, email: string) {
  const res = await register(
    jsonRequest('/api/auth/register', {
      body: { fullName: name, email, password: 'password-123' },
    }),
  );

  expect(res.status).toBe(201);
  return sessionCookie(res);
}

async function postQuote(cookie: string, overrides = {}) {
  const res = await createQuoteRoute(
    jsonRequest('/api/quotes', { body: { ...validQuote, ...overrides }, cookie }),
  );
  return { res, body: await res.json() };
}

let alice: string;
let bob: string;
let admin: string;

beforeAll(async () => {
  alice = await signUp('Alice Archer', 'alice@example.com');
  bob = await signUp('Bob Baker', 'bob@example.com');
  const res = await login(
    jsonRequest('/api/auth/login', { body: { email: 'admin@test.com', password: 'Admin123!' } }),
  );
  admin = sessionCookie(res);
});

describe('GET /api/health', () => {
  it('reports liveness', async () => {
    const res = await health();
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('ok');
  });
});

describe('auth', () => {
  it('rejects duplicate registration (case-insensitive)', async () => {
    const res = await register(
      jsonRequest('/api/auth/register', {
        body: { fullName: 'Alice Again', email: 'ALICE@example.com', password: 'password-123' },
      }),
    );
    expect(res.status).toBe(409);
  });

  it('returns field errors for invalid registration', async () => {
    const res = await register(
      jsonRequest('/api/auth/register', { body: { fullName: 'A', email: 'bad', password: '123' } }),
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(Object.keys(body.details.properties)).toEqual(['fullName', 'email', 'password']);
  });

  it('gives a generic 401 for wrong password and unknown email', async () => {
    for (const email of ['alice@example.com', 'ghost@example.com']) {
      const res = await login(
        jsonRequest('/api/auth/login', { body: { email, password: 'wrong-password' } }),
      );
      const body = await res.json();
      expect(res.status).toBe(401);
      expect(body.error).toBe('Incorrect email or password');
    }
  });
});

describe('POST /api/quotes', () => {
  it('requires authentication', async () => {
    const res = await createQuoteRoute(jsonRequest('/api/quotes', { body: validQuote }));
    expect(res.status).toBe(401);
  });

  it('validates input', async () => {
    const { res, body } = await postQuote(alice, {
      systemSizeKw: -1,
      monthlyConsumptionKw: 'lots',
    });

    expect(res.status).toBe(400);
    expect(body.error).toBe('Validation failed');
    expect(body.details.properties).toHaveProperty('systemSizeKw');
    expect(body.details.properties).toHaveProperty('monthlyConsumptionKw');
  });

  it('rejects malformed JSON', async () => {
    const res = await createQuoteRoute(
      jsonRequest('/api/quotes', { rawBody: '{nope', cookie: alice }),
    );
    expect(res.status).toBe(400);
  });

  it('prices, persists and returns a normalized quote', async () => {
    const { res, body } = await postQuote(alice);

    expect(res.status).toBe(201);
    expect(body.quote.inputs).toMatchObject({ systemSizeKw: 5, downPayment: '1000.00' });
    expect(body.quote.derived).toMatchObject({
      systemPrice: '6000.00',
      principalAmount: '5000.00',
      riskBand: 'A',
      baseApr: '6.90',
    });
    expect(body.quote.offers).toHaveLength(3);
    expect(body.quote.offers[0]).toEqual({
      termYears: 5,
      apr: 6.9,
      principalUsed: 5000,
      monthlyPayment: 98.77,
    });
    expect(res.headers.get('location')).toBe(`/api/quotes/${body.quote.id}`);
  });
});

describe('GET /api/quotes/:id (ownership)', () => {
  it('lets the owner and admins read, and forbids other users', async () => {
    const { body } = await postQuote(alice);
    const id = body.quote.id as string;
    const read = (cookie: string) =>
      getQuote(jsonRequest(`/api/quotes/${id}`, { cookie }), byId(id));

    expect((await read(alice)).status).toBe(200);
    expect((await read(admin)).status).toBe(200);
    expect((await getQuote(jsonRequest(`/api/quotes/${id}`), byId(id))).status).toBe(401);
  });
});
