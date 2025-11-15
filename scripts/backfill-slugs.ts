// scripts/backfill-slugs.ts
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
const prisma = new PrismaClient();

function s(input: string) {
  return slugify(input, { lower: true, strict: true, locale: "ro" }).replace(/-+/g, "-");
}

async function main() {
  // Providers
  const providers = await prisma.provider.findMany({ where: { slug: null } });
  for (const p of providers) {
    const base = s(p.displayName || "provider");
    let slug = base;
    let i = 1;
    while (true) {
      const hit = await prisma.provider.findUnique({ where: { slug } });
      if (!hit) break;
      i++;
      slug = `${base}-${i}`;
    }
    await prisma.provider.update({ where: { id: p.id }, data: { slug } });
    console.log("Provider slug:", p.id, slug);
  }

  // Events
  const events = await prisma.event.findMany();
  for (const e of events) {
    if (!e.slug) {
      const base = s(`${e.title}-${e.city}-${e.date.toISOString().slice(0,10)}`);
      let slug = base;
      let i = 1;
      while (true) {
        const hit = await prisma.event.findUnique({ where: { slug } });
        if (!hit) break;
        i++;
        slug = `${base}-${i}`;
      }
      await prisma.event.update({ where: { id: e.id }, data: { slug } });
      console.log("Event slug:", e.id, slug);
    }
  }

  // Activities
  const acts = await prisma.activity.findMany();
  for (const a of acts) {
    if (!a.slug) {
      const base = s(`${a.title}-${a.city}`);
      let slug = base;
      let i = 1;
      while (true) {
        const hit = await prisma.activity.findUnique({ where: { slug } });
        if (!hit) break;
        i++;
        slug = `${base}-${i}`;
      }
      await prisma.activity.update({ where: { id: a.id }, data: { slug } });
      console.log("Activity slug:", a.id, slug);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
