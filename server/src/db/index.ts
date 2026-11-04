import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env, isProd } from '../config/env';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = env.databaseUrl || 'postgresql://postgres:postgres@localhost:5432/waliliens';
    pool = new Pool({
      connectionString,
      max: isProd ? 20 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      logger.error({ err }, '[Database Pool Error]');
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { schema });

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  if (!env.databaseUrl && isProd) {
    return {
      connected: false,
      error: 'DATABASE_URL is not configured in production.',
    };
  }

  const start = Date.now();
  try {
    const client = await getPool().connect();
    try {
      await client.query('SELECT 1');
      const latencyMs = Date.now() - start;
      return { connected: true, latencyMs };
    } finally {
      client.release();
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Database connection failed';
    return { connected: false, error: msg };
  }
}
