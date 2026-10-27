import { z } from 'zod';
import { SESSION_COOKIE } from './config';
import { loginSchema, createQuoteSchema, registerSchema } from './schemas';
import { generateQuote } from './pricing';
import { BASE_APR_BY_BAND, CURRENCY, OFFER_TERMS_YEARS, PRICE_PER_KW } from './constants';

type JsonSchema = { properties?: Record<string, JsonSchema>; [key: string]: unknown };

function fromZod(schema: z.ZodType): JsonSchema {
  const json = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }) as JsonSchema;
  delete json.$schema;
  if (json.properties?.email) json.properties.email = { ...json.properties.email, format: 'email' };
  return json;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const response = (name: string) => ({ $ref: `#/components/responses/${name}` });
const json = (schema: object, example?: unknown) => ({
  'application/json': { schema, ...(example === undefined ? {} : { example }) },
});

const protectedOp = { security: [{ cookieAuth: [] }] };

const exampleQuote = (() => {
  const input = {
    fullName: 'Priya Nair',
    email: 'priya@example.com',
    address: '14 Lake Road, Bengaluru',
    monthlyConsumptionKw: 420,
    systemSizeKw: 5.5,
    downPayment: 1500,
  };
  const { offers, ...derived } = generateQuote(input);
  return {
    id: '7c0f0c7e-5d1b-4e0a-9d63-2f1b8c6a1e11',
    userId: '2b1d5a43-8f4e-4b53-9a1c-6d2e7f3b9c10',
    createdAt: '2026-10-27T07:52:10.123Z',
    owner: { fullName: input.fullName, email: input.email },
    inputs: input,
    derived,
    offers,
  };
})();

const exampleUser = {
  id: '2b1d5a43-8f4e-4b53-9a1c-6d2e7f3b9c10',
  fullName: 'Priya Nair',
  email: 'priya@example.com',
  role: 'user',
  createdAt: '2026-10-27T07:50:00.000Z',
};

const bandRules = Object.entries(BASE_APR_BY_BAND)
  .map(([band, apr]) => `${band} = ${apr}% APR`)
  .join(', ');

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'GreenQuote API',
    version: '0.1.0',
    description: [
      'Solar financing pre-qualification.',
      '',
      '**Authentication:** sign in with `POST /api/auth/login` (or register). The server sets an httpOnly ' +
        `\`${SESSION_COOKIE}\` cookie and the browser sends it automatically, so in this page just run ` +
        'login once with "Try it out" and the protected endpoints will work.',
      '',
      `**Pricing:** system price = system size (kW) x ${PRICE_PER_KW} ${CURRENCY}; principal = price - ` +
        `down payment. Risk band A needs >= 400 kWh/month and a system <= 6 kW; B needs >= 250 kWh/month; ` +
        `otherwise C. Base APR by band: ${bandRules}. Offers are returned for ${OFFER_TERMS_YEARS.join('/')} ` +
        'year terms.',
    ].join('\n'),
  },
  servers: [{ url: '/', description: 'This server' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Quotes', description: 'Requires a signed-in user.' },
    { name: 'Admin', description: 'Requires the admin role.' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        operationId: 'healthCheck',
        summary: 'Liveness check',
        responses: {
          '200': {
            description: 'The service is up.',
            content: json(ref('Health'), { status: 'ok', uptimeSeconds: 42 }),
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        operationId: 'registerUser',
        summary: 'Create an account and sign in',
        requestBody: {
          required: true,
          content: json(ref('RegisterRequest'), {
            fullName: 'Priya Nair',
            email: 'priya@example.com',
            password: 'password-123',
          }),
        },
        responses: {
          '201': {
            description: 'Account created. The session cookie is set.',
            headers: {
              'Set-Cookie': {
                description: `${SESSION_COOKIE} session cookie`,
                schema: { type: 'string' },
              },
            },
            content: json(
              { type: 'object', properties: { user: ref('User') } },
              { user: exampleUser },
            ),
          },
          '400': response('ValidationError'),
          '409': {
            description: 'An account with this email already exists.',
            content: json(ref('Error'), {
              error: { code: 'CONFLICT', message: 'An account with this email already exists' },
            }),
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        operationId: 'loginUser',
        summary: 'Sign in',
        requestBody: {
          required: true,
          content: json(ref('LoginRequest'), { email: 'admin@test.com', password: 'Admin123!' }),
        },
        responses: {
          '200': {
            description: 'Signed in. The session cookie is set.',
            headers: {
              'Set-Cookie': {
                description: `${SESSION_COOKIE} session cookie`,
                schema: { type: 'string' },
              },
            },
            content: json(
              { type: 'object', properties: { user: ref('User') } },
              { user: exampleUser },
            ),
          },
          '400': response('ValidationError'),
          '401': {
            description: 'Wrong email or password (the same message for unknown emails).',
            content: json(ref('Error'), {
              error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' },
            }),
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        operationId: 'logoutUser',
        summary: 'Sign out (clears the session cookie)',
        responses: { '204': { description: 'Signed out.' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        operationId: 'getCurrentUser',
        summary: 'The signed-in user',
        ...protectedOp,
        responses: {
          '200': {
            description: 'The current user.',
            content: json(
              { type: 'object', properties: { user: ref('User') } },
              { user: exampleUser },
            ),
          },
          '401': response('Unauthorized'),
        },
      },
    },
    '/api/quotes': {
      post: {
        tags: ['Quotes'],
        operationId: 'createQuote',
        summary: 'Request a pre-qualification quote',
        description:
          'Validates the input, prices the system, stores the request with its result and returns it. ' +
          'The down payment cannot exceed the system price.',
        ...protectedOp,
        requestBody: {
          required: true,
          content: json(ref('QuoteRequest'), exampleQuote.inputs),
        },
        responses: {
          '201': {
            description: 'Quote created.',
            headers: {
              Location: { description: 'URL of the new quote', schema: { type: 'string' } },
            },
            content: json(
              { type: 'object', properties: { quote: ref('Quote') } },
              { quote: exampleQuote },
            ),
          },
          '400': response('ValidationError'),
          '401': response('Unauthorized'),
        },
      },
      get: {
        tags: ['Quotes'],
        operationId: 'listMyQuotes',
        summary: "List the signed-in user's quotes (newest first)",
        ...protectedOp,
        responses: {
          '200': {
            description: 'Your quotes.',
            content: json(
              { type: 'object', properties: { quotes: { type: 'array', items: ref('Quote') } } },
              { quotes: [exampleQuote] },
            ),
          },
          '401': response('Unauthorized'),
        },
      },
    },
    '/api/quotes/{id}': {
      get: {
        tags: ['Quotes'],
        operationId: 'getQuote',
        summary: 'Fetch one quote',
        description: 'Allowed for the quote owner and for admins.',
        ...protectedOp,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'The quote.',
            content: json(
              { type: 'object', properties: { quote: ref('Quote') } },
              { quote: exampleQuote },
            ),
          },
          '401': response('Unauthorized'),
          '403': response('Forbidden'),
          '404': response('NotFound'),
        },
      },
    },
    '/api/admin/quotes': {
      get: {
        tags: ['Admin'],
        operationId: 'listAllQuotes',
        summary: 'List all quotes, optionally filtered by customer',
        ...protectedOp,
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Case-insensitive substring of the owner name or email.',
            schema: { type: 'string', maxLength: 100 },
          },
          {
            name: 'userId',
            in: 'query',
            description: 'Only quotes owned by this user.',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Matching quotes, newest first.',
            content: json(
              { type: 'object', properties: { quotes: { type: 'array', items: ref('Quote') } } },
              { quotes: [exampleQuote] },
            ),
          },
          '400': response('ValidationError'),
          '401': response('Unauthorized'),
          '403': response('Forbidden'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: SESSION_COOKIE,
        description: 'Set by /api/auth/login and /api/auth/register.',
      },
    },
    responses: {
      ValidationError: {
        description:
          'Malformed JSON or invalid input. `details.fieldErrors` maps field names to messages.',
        content: json(ref('Error'), {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: {
              formErrors: [],
              fieldErrors: { systemSizeKw: ['System size must be greater than 0'] },
            },
          },
        }),
      },
      Unauthorized: {
        description: 'No valid session.',
        content: json(ref('Error'), {
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        }),
      },
      Forbidden: {
        description: 'Signed in, but not allowed to access this resource.',
        content: json(ref('Error'), {
          error: { code: 'FORBIDDEN', message: 'You do not have access to this resource' },
        }),
      },
      NotFound: {
        description: 'No such resource.',
        content: json(ref('Error'), { error: { code: 'NOT_FOUND', message: 'Quote not found' } }),
      },
    },
    schemas: {
      Health: {
        type: 'object',
        required: ['status', 'uptimeSeconds'],
        properties: {
          status: { type: 'string', enum: ['ok'] },
          uptimeSeconds: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                enum: [
                  'VALIDATION_ERROR',
                  'UNAUTHORIZED',
                  'INVALID_CREDENTIALS',
                  'FORBIDDEN',
                  'NOT_FOUND',
                  'CONFLICT',
                  'INTERNAL_ERROR',
                ],
              },
              message: { type: 'string' },
              details: {
                type: 'object',
                properties: {
                  formErrors: { type: 'array', items: { type: 'string' } },
                  fieldErrors: {
                    type: 'object',
                    additionalProperties: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
      RegisterRequest: fromZod(registerSchema),
      LoginRequest: fromZod(loginSchema),
      QuoteRequest: fromZod(createQuoteSchema),
      User: {
        type: 'object',
        required: ['id', 'fullName', 'email', 'role', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RiskBand: { type: 'string', enum: ['A', 'B', 'C'] },
      Offer: {
        type: 'object',
        required: ['termYears', 'apr', 'principalUsed', 'monthlyPayment'],
        properties: {
          termYears: { type: 'integer', enum: [...OFFER_TERMS_YEARS] },
          apr: {
            type: 'number',
            description: 'Annual percentage rate as a percentage (6.9 = 6.9%).',
          },
          principalUsed: { type: 'number', description: `Amount financed, in ${CURRENCY}.` },
          monthlyPayment: {
            type: 'number',
            description: `Monthly payment, in ${CURRENCY}, rounded to cents.`,
          },
        },
      },
      Quote: {
        type: 'object',
        required: ['id', 'userId', 'createdAt', 'owner', 'inputs', 'derived', 'offers'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          owner: {
            type: 'object',
            required: ['fullName', 'email'],
            properties: {
              fullName: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
          inputs: {
            type: 'object',
            required: [
              'fullName',
              'email',
              'address',
              'monthlyConsumptionKwh',
              'systemSizeKw',
              'downPayment',
            ],
            properties: {
              fullName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              address: { type: 'string' },
              monthlyConsumptionKwh: { type: 'number' },
              systemSizeKw: { type: 'number' },
              downPayment: { type: 'number' },
            },
          },
          derived: {
            type: 'object',
            required: ['currency', 'systemPrice', 'principalAmount', 'riskBand', 'baseApr'],
            properties: {
              currency: { type: 'string', example: CURRENCY },
              systemPrice: { type: 'number' },
              principalAmount: { type: 'number' },
              riskBand: ref('RiskBand'),
              baseApr: { type: 'number', description: 'Percentage (6.9 = 6.9%).' },
            },
          },
          offers: {
            type: 'array',
            items: ref('Offer'),
            minItems: OFFER_TERMS_YEARS.length,
            maxItems: OFFER_TERMS_YEARS.length,
          },
        },
      },
    },
  },
};
