import { Pool, QueryResultRow } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

export interface Db {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not set');
  }

  return new Pool({ connectionString, max: 10 });
}

export const getDb = () => {
  const db = globalThis.__pgPool ?? createPool();
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__pgPool = db;
  }
  return db;
};
