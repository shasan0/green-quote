import { Db } from '@/src/lib/db';
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

const INIT_DIR = path.join(process.cwd(), 'db', 'init');

export async function createPgliteDb(): Promise<Db> {
  const pg = new PGlite();
  for (const file of fs
    .readdirSync(INIT_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    await pg.exec(fs.readFileSync(path.join(INIT_DIR, file), 'utf8'));
  }
  return {
    async query<T>(text: string, params?: unknown[]) {
      const res = await pg.query<T>(text, params);
      return { rows: res.rows };
    },
  } as Db;
}
