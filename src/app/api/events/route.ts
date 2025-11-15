// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ăâîșțéèüöç\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth?next=/events/new", req.url));
  }

  if (user.role !== "PROVIDER" && user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const form = await req.formData();

  const title = String(form.get("title") || "").trim();
  const city = String(form.get("city") || "").trim();
  const dateTime = String(form.get("dateTime") || "").trim(); // datetime-local
  const image = String(form.get("image") || "").trim() || null;
  const priceFromRaw = String(form.get("priceFrom") || "").trim();
  const currency = (String(form.get("currency") || "EUR").trim() || "EUR").toUpperCase();
  const status = String(form.get("status") || "active").trim() || "active";

  if (!title || !city || !dateTime) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) {
    return new NextResponse("Invalid date", { status: 400 });
  }

  const priceFrom = priceFromRaw ? Number(priceFromRaw) : null;

  // находим provider для текущего пользователя (если есть)
  let providerId: string | null = null;
  if (user.role === "PROVIDER") {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    providerId = provider?.id ?? null;
  } else {
    // ADMIN может явно передать providerId (опционально)
    const fromForm = String(form.get("providerId") || "").trim();
    providerId = fromForm || null;
  }

  const baseSlug = slugify(title) || "eveniment";
  const slugCandidate = `${baseSlug}-${Date.now().toString(36)}`;

  const event = await prisma.event.create({
    data: {
      slug: slugCandidate,
      title,
      city,
      date,
      image,
      priceFrom: priceFrom ?? undefined,
      currency,
      status,
      providerId: providerId ?? undefined,
    },
  });

  // после создания — редирект на страницу события
  return NextResponse.redirect(new URL(`/events/${event.slug}`, req.url));
}
