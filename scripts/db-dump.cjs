// scripts/db-dump.cjs
const { execSync } = require('child_process');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}
const file = process.argv[2] || `dump_${new Date().toISOString().replace(/[:.]/g,'-')}.sql`;
execSync(`pg_dump --no-owner --no-acl "${url}" > "${file}"`, { stdio: 'inherit', shell: true });
console.log('Dump saved to', file);
