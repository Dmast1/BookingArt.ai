// src/app/api/provider/activities/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
// ВАЖНО: у тебя slugify — ИМЕНОВАННЫЙ экспорт
import { slugify } from "@/lib/slugify";

export async function GET() {
  // список моих активностей
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const provider = await prisma.provider.findUnique({
    where: { userId: me.id },
    select: { id: true },
  });
  if (!provider) return NextResponse.json({ ok: false }, { status: 403 });

  const items = await prisma.activity.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, city: true,
      priceFrom: true, currency: true, coverImage: true, status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const provider = await prisma.provider.findUnique({
    where: { userId: me.id },
    select: { id: true, city: true, country: true },
  });
  if (!provider) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json().catch(() => ({} as any));
  const {
    title,
    subtitle,
    city,
    country,
    address,
    coverImage,
    gallery,
    category,
    description,
    priceFrom,
    currency = "EUR",
    durationMin,
    minPeople,
    maxPeople,
    status = "active",
  } = body ?? {};

  if (!title) {
    return NextResponse.json({ ok: false, error: "Titlul e obligatoriu" }, { status: 400 });
  }

  const slug = slugify(`${title}-${Date.now().toString(36)}`);

  const created = await prisma.activity.create({
    data: {
      providerId: provider.id,
      slug,
      title,
      subtitle: subtitle ?? null,
      city: city || provider.city || "București",
      country: country || provider.country || "RO",
      address: address ?? null,
      coverImage: coverImage ?? null,
      gallery: Array.isArray(gallery) ? gallery : [],
      category: category ?? null,
      description: description ?? null,
      priceFrom: Number(priceFrom) || null,
      currency,
      durationMin: durationMin ?? null,
      minPeople: minPeople ?? null,
      maxPeople: maxPeople ?? null,
      status,
    },
    select: { id: true, slug: true, title: true },
  });

  return NextResponse.json({ ok: true, activity: created });
}

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const { id, ...rest } = body ?? {};
  if (!id) return NextResponse.json({ ok: false, error: "id lipsă" }, { status: 400 });

  // простая защита владения
  const own = await prisma.activity.findFirst({
    where: { id, provider: { userId: me.id } },
    select: { id: true },
  });
  if (!own) return NextResponse.json({ ok: false }, { status: 403 });

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      title: rest.title ?? undefined,
      subtitle: rest.subtitle ?? undefined,
      city: rest.city ?? undefined,
      country: rest.country ?? undefined,
      address: rest.address ?? undefined,
      coverImage: rest.coverImage ?? undefined,
      gallery: Array.isArray(rest.gallery) ? rest.gallery : undefined,
      category: rest.category ?? undefined,
      description: rest.description ?? undefined,
      priceFrom: typeof rest.priceFrom === "number" ? rest.priceFrom : undefined,
      currency: rest.currency ?? undefined,
      durationMin: rest.durationMin ?? undefined,
      minPeople: rest.minPeople ?? undefined,
      maxPeople: rest.maxPeople ?? undefined,
      status: rest.status ?? undefined,
    },
    select: { id: true, slug: true, title: true },
  });

  return NextResponse.json({ ok: true, activity: updated });
}
