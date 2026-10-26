import { generateQuote } from '@/src/lib/pricing';
import { createQuoteSchema } from '@/src/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        const { success, error, data } = createQuoteSchema.safeParse(body);

        if (!success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: z.treeifyError(error)
                },
                { status: 400 }
            );
        }

        const { fullName, email, monthlyConsumptionKw, systemSizeKw, downPayment } = data;
        const result = generateQuote({ monthlyConsumptionKw, systemSizeKw, downPayment });

        return NextResponse.json({
            success: true,
            data: { ...result, fullName, email, id: 123 },
            message: 'Data processed successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid or missing JSON payload' },
            { status: 400 }
        );
    }
}
