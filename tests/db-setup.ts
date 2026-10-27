import { Db } from '@/src/lib/db';
import { createPgliteDb } from './pglite';

(globalThis as unknown as { __pgPool: Db }).__pgPool = await createPgliteDb();
