import { NextResponse } from 'next/server';
import { ApiError } from './api-errors';
import { logger } from '../lib/logger';

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  logger.error('Unhandled API Error:', { error });

  return NextResponse.json(
    { success: false, error: 'An unexpected error occurred' },
    { status: 500 },
  );
}
