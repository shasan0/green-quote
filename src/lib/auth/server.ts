import { cache } from 'react';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '../config';
import { userFromToken } from './session';

export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  return userFromToken(jar.get(SESSION_COOKIE)?.value);
});
