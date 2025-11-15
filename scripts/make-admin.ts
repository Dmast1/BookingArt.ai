// scripts/make-admin.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const ident = process.argv[2];
  if (!ident) {
    console.error("Usage: npx ts-node scripts/make-admin.ts <email|userId>");
    process.exit(1);
  }

  const user = ident.includes("@")
    ? await prisma.user.findUnique({ where: { email: ident } })
    : await prisma.user.findUnique({ where: { id: ident } });

  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log("User promoted to ADMIN:", user.id, user.email);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
