import z from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/src/lib/schemas';
import { logger } from '@/src/lib/logger';
import { registerUser } from '@/src/services/auth';
import { attachSession } from '@/src/lib/auth/session';
import { ApiError } from '@/src/utils/api-errors';
import { handleApiError } from '@/src/utils/api-error-handler';

export async function POST(req: NextRequest) {
  let json: unknown;

  try {
    json = await req.json();
  } catch (error) {
    logger.error('Request body must be valid JSON', { error });
    throw ApiError.badRequest('Request body must be valid JSON');
  }

  const { success, error, data } = registerSchema.safeParse(json);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: z.treeifyError(error),
      },
      { status: 400 },
    );
  }

  try {
    const user = await registerUser(data);
    logger.info(`user registered - ${user.id}`);

    const res = NextResponse.json({ user }, { status: 201 });
    await attachSession(res, user.id);

    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
