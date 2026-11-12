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
      // Serverless instances are short lived and may scale horizontally. Keep
      // each instance's pool small so total PostgreSQL connections stay bounded.
      max: isProd ? 3 : 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: true,
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
