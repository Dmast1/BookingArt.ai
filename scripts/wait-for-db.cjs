// scripts/wait-for-db.cjs
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

(async () => {
  const start = Date.now();
  while (true) {
    try {
      const client = new Client({ connectionString: url });
      await client.connect();
      await client.end();
      console.log('DB is ready in', Date.now() - start, 'ms');
      process.exit(0);
    } catch (e) {
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, 1000));
    }
  }
})();
