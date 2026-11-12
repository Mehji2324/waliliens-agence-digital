import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'path';

// Neon env pull writes project-level credentials to the repository root.
// Fall back to server/.env for existing local setups.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Neon recommends direct connections for migration tooling; runtime app
    // traffic continues to use the pooled DATABASE_URL.
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/waliliens',
  },
  verbose: true,
  strict: true,
});
