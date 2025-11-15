// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding…");

  const password = "test1234";
  const hash = await bcrypt.hash(password, 10);

  // ===== USERS (пароль: test1234) =====

  // обычный пользователь
  const user = await prisma.user.upsert({
    where: { email: "user@bookingart.ai" },
    update: {
      name: "Demo User",
      role: "USER",
      passwordHash: hash,
      city: "București",
      country: "RO",
      language: "ro",
      avatarUrl: null,
      bio: "Client demo pe BookingArt.ai",
      birthDate: new Date("1990-01-01"),
    },
    create: {
      email: "user@bookingart.ai",
      name: "Demo User",
      role: "USER",
      passwordHash: hash,
      city: "București",
      country: "RO",
      language: "ro",
      avatarUrl: null,
      bio: "Client demo pe BookingArt.ai",
      birthDate: new Date("1990-01-01"),
    },
  });

  // админ
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookingart.ai" },
    update: {
      name: "Admin",
      role: "ADMIN",
      passwordHash: hash,
      city: "București",
      country: "RO",
      language: "ro",
      avatarUrl: null,
      bio: "Admin BookingArt.ai",
      birthDate: new Date("1988-05-05"),
    },
    create: {
      email: "admin@bookingart.ai",
      name: "Admin",
      role: "ADMIN",
      passwordHash: hash,
      city: "București",
      country: "RO",
      language: "ro",
      avatarUrl: null,
      bio: "Admin BookingArt.ai",
      birthDate: new Date("1988-05-05"),
    },
  });

  // провайдер (юзер)
  const providerUser = await prisma.user.upsert({
    where: { email: "provider@bookingart.ai" },
    update: {
      name: "Demo Provider",
      role: "PROVIDER",
      passwordHash: hash,
      city: "București",
      country: "RO",
      language: "ro",
      avatarUrl: null,
      bio: "Artist demo / provider pe BookingArt.ai",
      birthDate: new Date("1992-03-10"),
    },
    create: {
      email: "provider@bookingart.ai",
      name: "Demo Provider",
      role: "PROVIDER",
      passwordHash: hash,
      city: "București",
      country: "RO",
      language: "ro",
      avatarUrl: null,
      bio: "Artist demo / provider pe BookingArt.ai",
      birthDate: new Date("1992-03-10"),
    },
  });

  // Provider-запись (чтобы личный кабинет провайдера не падал)
  await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      displayName: "Artist Demo Band",
      city: "București",
      country: "RO",
      categories: [],
      rating: null,
    },
  });

  console.log(
    "✅ Seed complete. Login: user/admin/provider@bookingart.ai / test1234"
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
