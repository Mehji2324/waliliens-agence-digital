import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import * as schema from './schema';

// Neon CLI writes its pulled connection variables to the repository root.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function runMigrations() {
  console.log('🔄 Running PostgreSQL migrations via Drizzle ORM...');

  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL_UNPOOLED or DATABASE_URL is required.');
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  const migrationDb = drizzle(pool, { schema });

  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  console.log(`📁 Applying migrations from: ${migrationsFolder}`);

  try {
    await pool.query('SELECT 1');
    await migrate(migrationDb, { migrationsFolder });
    console.log('✨ All migrations applied successfully!');
  } catch {
    // Avoid printing driver errors that can include connection details.
    console.error('❌ Migration failed. Error details suppressed to protect credentials.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations().catch(() => {
  console.error('❌ Uncaught migration error. Error details suppressed to protect credentials.');
  process.exitCode = 1;
});
