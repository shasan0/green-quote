import { NextRequest } from 'next/server';

export function jsonRequest(
  path: string,
  opts: { method?: string; body?: unknown; rawBody?: string; cookie?: string } = {},
) {
  return new NextRequest(`http://localhost${path}`, {
    method: opts.method ?? (opts.body === undefined && opts.rawBody === undefined ? 'GET' : 'POST'),
    headers: {
      'content-type': 'application/json',
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
    },
    body: opts.rawBody ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body)),
  });
}

export function sessionCookie(res: Response): string {
  const header = res.headers.get('set-cookie') ?? '';
  const match = header.match(/gq_session=[^;]*/);
  if (!match) throw new Error('no session cookie in response');
  return match[0];
}

export const validQuote = {
  fullName: 'John Doe',
  email: 'ada@example.com',
  address: '12 Analytical Way, Bengaluru',
  monthlyConsumptionKw: 450,
  systemSizeKw: 5,
  downPayment: 1000,
};
