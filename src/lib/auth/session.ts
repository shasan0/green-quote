import type { NextResponse } from 'next/server';
import { SESSION_COOKIE, getConfig } from '../config';
import { findUserById, type User } from '../repositories/users';
import { signSession, verifySession } from './token';
import { ApiError } from '@/src/utils/api-errors';

export async function userFromToken(token: string | undefined): Promise<User | null> {
  const claims = await verifySession(token);
  if (claims === null) return null;
  const user = await findUserById(claims.sub);
  return user ? user : null;
}

export async function attachSession(res: NextResponse, userId: string) {
  const { sessionTtlSeconds, isProd } = getConfig();
  res.cookies.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: sessionTtlSeconds,
  });
}

export function clearSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function requireUser(req: {
  cookies: { get(n: string): { value: string } | undefined };
}) {
  const user = await userFromToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) throw ApiError.unauthorized();
  return user;
}

export async function requireAdmin(req: Parameters<typeof requireUser>[0]) {
  const user = await requireUser(req);
  if (user.role !== 'admin') throw ApiError.forbidden('Admin access required');
  return user;
}
