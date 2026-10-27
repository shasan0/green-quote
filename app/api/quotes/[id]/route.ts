import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/src/lib/auth/session';
import { getQuotesForUser } from '@/src/services/quote';
import { handleApiError } from '@/src/utils/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await params;

    return NextResponse.json({ quote: getQuotesForUser(user, id) });
  } catch (error) {
    return handleApiError(error);
  }
}
