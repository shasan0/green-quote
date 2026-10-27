import { z } from 'zod';
import { PRICE_PER_KW } from './constants';

const fullName = z.string().trim().min(2, 'Name must be at least 2 characters long');
const email = z.email('Invalid email address');

export const createQuoteSchema = z
  .object({
    fullName,
    email,
    address: z.string().min(5, 'Address must be at least 5 characters long'),
    monthlyConsumptionKw: z.coerce
      .number('Monthly consumption must be a number')
      .positive('Consumption must be greater than 0')
      .max(100_000, 'Monthly consumption must be at most 100,000 kWh'),
    systemSizeKw: z.coerce
      .number('System size must be a number')
      .positive('System size must be greater than 0')
      .max(50, 'Residential systems are limited to 50 kW'),
    downPayment: z.coerce
      .number('Down payment must be a number')
      .min(0, 'Down payment cannot be negative')
      .optional()
      .default(0),
  })
  .superRefine((value, ctx) => {
    const { systemSizeKw, downPayment } = value;
    const price = systemSizeKw * PRICE_PER_KW;
    if (downPayment > price) {
      ctx.addIssue({
        code: 'custom',
        path: ['downPayment'],
        message: 'Down payment cannot exceed the system price',
      });
    }
  });

export const adminQuoteFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  userId: z.string().trim().max(64).optional(),
});

export const registerSchema = z.object({
  fullName,
  email,
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type CreateQuote = z.infer<typeof createQuoteSchema>;
