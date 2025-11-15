// prisma/seed.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding…");

  const password = "test1234"; // общий пароль для всех тестовых аккаунтов
  const hash = await bcrypt.hash(password, 10);

  // === обычный пользователь ===
  const user = await prisma.user.upsert({
    where: { email: "user@bookingart.ai" },
    update: { passwordHash: hash, role: "USER" },
    create: {
      email: "user@bookingart.ai",
      name: "Demo User",
      role: "USER",
      passwordHash: hash,
    },
  });

  // === админ ===
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookingart.ai" },
    update: { passwordHash: hash, role: "ADMIN" },
    create: {
      email: "admin@bookingart.ai",
      name: "Admin",
      role: "ADMIN",
      passwordHash: hash,
    },
  });

  // === провайдер + связанный Provider ===
  const providerUser = await prisma.user.upsert({
    where: { email: "provider@bookingart.ai" },
    update: { passwordHash: hash, role: "PROVIDER" },
    create: {
      email: "provider@bookingart.ai",
      name: "Demo Provider",
      role: "PROVIDER",
      passwordHash: hash,
    },
  });

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      displayName: "DJ Demo",
      city: "București",
      country: "RO",
      categories: ["DJ", "Party"],
      rating: 4.7,
    },
  });

  const venue = await prisma.venue.upsert({
    where: { name: "Sala Allegro" },
    update: {},
    create: {
      name: "Sala Allegro",
      city: "București",
      country: "RO",
      capacityMin: 80,
      capacityMax: 220,
      priceFrom: 800,
      priceTo: 2400,
      currency: "EUR",
      rating: 4.6,
      images: [
        "https://picsum.photos/seed/allegro1/1200/700",
        "https://picsum.photos/seed/allegro2/1200/700",
      ],
      features: ["Scenă", "Sunet", "Lumini", "Backstage"],
    },
  });

  await prisma.event.createMany({
    data: [
      {
        slug: "dj-demo-allegro",
        title: "DJ Demo @ Sala Allegro",
        city: "București",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        image: "https://picsum.photos/seed/event1/1200/700",
        venueId: venue.id,
        providerId: provider.id,
      },
      {
        slug: "dj-demo-allegro-2",
        title: "DJ Demo Night 2",
        city: "București",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        image: "https://picsum.photos/seed/event2/1200/700",
        venueId: venue.id,
        providerId: provider.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
