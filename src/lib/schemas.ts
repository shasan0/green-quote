import { z } from 'zod';
import { PRICE_PER_KW } from './constants';

export const createQuoteSchema = z
    .object({
        fullName: z.string().min(2, 'Name must be at least 2 characters long'),
        email: z.email('Invalid email address'),
        address: z.string().min(5, 'Address must be at least 5 characters long'),
        monthlyConsumptionKw: z
            .coerce
            .number('Monthly consumption must be a number')
            .positive('Consumption must be greater than 0')
            .max(100_000, 'Monthly consumption must be at most 100,000 kWh'),
        systemSizeKw: z
            .coerce
            .number('System size must be a number')
            .positive('System size must be greater than 0')
            .max(50, 'Residential systems are limited to 50 kW'),
        downPayment: z
            .coerce
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