import { clearSession } from '@/src/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST() {
  const res = new NextResponse(null, { status: 204 });
  clearSession(res);
  return res;
}
