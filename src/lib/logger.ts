import { getConfig } from './config';

type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SENSITIVE = /password|secret|token|authorization|cookie/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (value instanceof Error)
    return { name: value.name, message: value.message, stack: value.stack };
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      SENSITIVE.test(k) ? '[REDACTED]' : redact(v, depth + 1),
    ]),
  );
}

function write(level: Level, msg: string, fields: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV === 'test' && !process.env.LOG_IN_TESTS) return;
  if (ORDER[level] < ORDER[getConfig().logLevel]) return;
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...(redact(fields) as object),
  });
  (level === 'error' ? console.error : console.log)(line);
}

export type Logger = ReturnType<typeof createLogger>;

/** Minimal structured JSON logger (one line per event, stdout), no dependencies. */
export function createLogger(base: Record<string, unknown> = {}) {
  return {
    debug: (msg: string, f?: Record<string, unknown>) => write('debug', msg, { ...base, ...f }),
    info: (msg: string, f?: Record<string, unknown>) => write('info', msg, { ...base, ...f }),
    warn: (msg: string, f?: Record<string, unknown>) => write('warn', msg, { ...base, ...f }),
    error: (msg: string, f?: Record<string, unknown>) => write('error', msg, { ...base, ...f }),
    child: (extra: Record<string, unknown>) => createLogger({ ...base, ...extra }),
  };
}

export const logger = createLogger();
