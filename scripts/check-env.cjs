// scripts/check-env.cjs
const required = [
  "DATABASE_URL",
  // добавь сюда Stripe, S3, NEXTAUTH_SECRET и т.д. по мере необходимости
];

let ok = true;
for (const k of required) {
  if (!process.env[k] || String(process.env[k]).trim() === "") {
    console.error(`❌ Missing env: ${k}`);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log("✅ Env OK");
