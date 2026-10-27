import { SignJWT, jwtVerify } from 'jose';
import { getConfig } from '../config';

export interface SessionClaims {
  sub: string;
}

const key = () => new TextEncoder().encode(getConfig().authSecret);

export async function signSession(userId: string): Promise<string> {
  const { sessionTtlSeconds } = getConfig();
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${sessionTtlSeconds}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    return payload.sub ? { sub: payload.sub } : null;
  } catch {
    return null;
  }
}
