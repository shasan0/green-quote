import z from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/src/lib/logger';
import { loginSchema } from '@/src/lib/schemas';
import { authenticate } from '@/src/services/auth';
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

  const { success, error, data } = loginSchema.safeParse(json);

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
    const user = await authenticate(data);
    logger.info(`user signed in - ${user.id}`);

    const res = NextResponse.json({ user });
    await attachSession(res, user.id);

    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
