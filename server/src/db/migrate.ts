import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import { db, getPool, checkDatabaseConnection } from './index';

async function runMigrations() {
  console.log('🔄 Running PostgreSQL migrations via Drizzle ORM...');

  const dbStatus = await checkDatabaseConnection();
  if (!dbStatus.connected) {
    console.error('❌ Database connection failed:', dbStatus.error);
    process.exit(1);
  }

  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  console.log(`📁 Applying migrations from: ${migrationsFolder}`);

  try {
    await migrate(db, { migrationsFolder });
    console.log('✨ All migrations applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await getPool().end();
  }

  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Uncaught migration error:', err);
  process.exit(1);
});
