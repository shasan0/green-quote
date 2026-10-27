const DEV_SECRET = 'dev-only-secret-0123456789';

export const SESSION_COOKIE = 'gq_session';

export function getConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.AUTH_SECRET ?? (isProd ? '' : DEV_SECRET);
  if (secret.length < 32) {
    throw new Error('AUTH_SECRET must be set to a string of at least 32 characters');
  }
  return {
    isProd,
    authSecret: secret,
    databasePath: process.env.DATABASE_PATH ?? './data/greenquote.db',
    sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7),
    logLevel: (process.env.LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
  };
}
