// scripts/anonymize-emails.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function mask(email: string, i: number) {
  const at = email.indexOf("@");
  const name = email.slice(0, Math.max(1, Math.min(3, at)));
  const domain = email.slice(at + 1);
  return `${name}+dev${i}@${domain || "example.com"}`;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { id: true, email: true }
  });

  let i = 1;
  for (const u of users) {
    const email = u.email!;
    const newEmail = mask(email, i++);
    if (newEmail !== email) {
      await prisma.user.update({
        where: { id: u.id },
        data: { email: newEmail }
      });
      console.log(email, "=>", newEmail);
    }
  }
  console.log("Done.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
