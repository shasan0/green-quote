import z from 'zod';
import { requireUser } from '@/src/lib/auth/session';
import { logger } from '@/src/lib/logger';
import { createQuoteSchema } from '@/src/lib/schemas';
import { createQuote } from '@/src/services/quote';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/src/utils/api-error-handler';

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid or missing JSON payload' }, { status: 400 });
  }

  try {
    const [user, validationResult] = await Promise.all([
      requireUser(req),
      Promise.resolve(createQuoteSchema.safeParse(body)),
    ]);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const quote = await createQuote(user, validationResult.data);

    if (quote) {
      logger.info('Quote created');
      return NextResponse.json(
        { quote },
        { status: 201, headers: { Location: `/api/quotes/${quote.id}` } },
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
