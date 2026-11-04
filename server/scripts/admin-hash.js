#!/usr/bin/env node
/**
 * admin-hash.js — Generate a bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 * Usage (from /server):
 *   npm run admin:hash -- "MySecurePassword123!"
 *
 * Then copy the output into server/.env:
 *   ADMIN_PASSWORD_HASH=<paste hash here>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password || password.trim() === '') {
  console.error('\nUsage: npm run admin:hash -- "<your-password>"\n');
  console.error('Example: npm run admin:hash -- "MySecure$Password2026!"\n');
  process.exit(1);
}

if (password.length < 12) {
  console.warn('\n⚠  WARNING: Password is shorter than 12 characters. Use a stronger password for production.\n');
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n✓ bcrypt hash generated. Copy the line below into your server/.env:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
}).catch((err) => {
  console.error('Error generating hash:', err.message);
  process.exit(1);
});
