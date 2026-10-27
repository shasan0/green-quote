import { describe, expect, it } from 'vitest';
import { loginSchema, createQuoteSchema, registerSchema } from '@/src/lib/schemas';
import { validQuote } from './helpers';

describe('quoteInputSchema', () => {
  it('accepts valid input and defaults the down payment to 0', () => {
    const { downPayment: _omit, ...withoutDown } = validQuote;
    void _omit;
    const parsed = createQuoteSchema.parse(withoutDown);
    expect(parsed.downPayment).toBe(0);
  });

  it.each([
    ['monthlyConsumptionKw', 0],
    ['monthlyConsumptionKw', -5],
    ['systemSizeKw', 0],
    ['systemSizeKw', 51],
    ['downPayment', -1],
  ])('rejects %s = %j', (field, value) => {
    const result = createQuoteSchema.safeParse({ ...validQuote, [field]: value });
    expect(result.success).toBe(false);
  });

  it('rejects a down payment larger than the system price', () => {
    const result = createQuoteSchema.safeParse({
      ...validQuote,
      systemSizeKw: 1,
      downPayment: 5000,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['downPayment']);
  });
});

describe('auth schemas', () => {
  it('requires an 8+ character password on registration', () => {
    const base = { fullName: 'Ada Lovelace', email: 'ada@example.com' };
    expect(registerSchema.safeParse({ ...base, password: 'short' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'long-enough-1' }).success).toBe(true);
  });
  it('requires a valid email on login', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});
