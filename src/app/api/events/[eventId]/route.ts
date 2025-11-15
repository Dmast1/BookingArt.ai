// src/app/api/events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ eventId: string }>;
};

export async function POST(req: NextRequest, ctx: Context) {
  const { eventId } = await ctx.params;

  // поддерживаем form method override: _method=PATCH
  const formData = await req.formData();
  const method = formData.get("_method");

  if (method !== "PATCH") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      provider: { select: { userId: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = event.provider?.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();
  const image = (String(formData.get("image") ?? "").trim() || null) as string | null;
  const status = (String(formData.get("status") ?? "").trim() || null) as string | null;
  const ticketsUrl =
    (String(formData.get("ticketsUrl") ?? "").trim() || null) as string | null;

  if (!title || !city || !dateStr) {
    return NextResponse.json(
      { error: "Title, city and date are required" },
      { status: 400 }
    );
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      city,
      date,
      image,
      status,
      ticketsUrl,
    },
  });

  // возвращаемся на страницу редактирования / подтверждаем апдейт
  return NextResponse.redirect(
    new URL(`/events/${updated.slug}/edit`, req.url)
  );
}