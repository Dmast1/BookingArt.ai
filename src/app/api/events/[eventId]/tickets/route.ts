// src/app/api/events/[eventId]/tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = { params: Promise<{ eventId: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  const { eventId } = await ctx.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const role = user.role ?? "GUEST";
  if (role !== "PROVIDER" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Doar providerii sau adminii pot gestiona biletele." },
      { status: 403 }
    );
  }

  const form = await req.formData();
  const action = String(form.get("_action") ?? "create");

  // проверяем, что событие существует и принадлежит провайдеру (если не админ)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      slug: true,
      provider: { select: { userId: true } },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evenimentul nu există." },
      { status: 404 }
    );
  }

  if (role === "PROVIDER" && event.provider?.userId !== user.id) {
    return NextResponse.json(
      { error: "Nu ai dreptul să modifici biletele acestui eveniment." },
      { status: 403 }
    );
  }

  if (action === "delete") {
    const ticketTypeId = String(form.get("ticketTypeId") ?? "");
    if (!ticketTypeId) {
      return NextResponse.json(
        { error: "Lipseste ID-ul tipului de bilet." },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      select: { eventId: true },
    });

    if (!ticket || ticket.eventId !== event.id) {
      return NextResponse.json(
        { error: "Tip de bilet invalid pentru acest eveniment." },
        { status: 400 }
      );
    }

    await prisma.ticketType.delete({ where: { id: ticketTypeId } });

    return NextResponse.redirect(
      new URL(`/events/${event.slug}/tickets`, req.url),
      { status: 303 }
    );
  }

  // create (по умолчанию)
  const name = String(form.get("name") ?? "").trim();
  const priceStr = String(form.get("price") ?? "").trim();
  const currency = String(form.get("currency") ?? "RON").trim() || "RON";
  const totalStr = String(form.get("total") ?? "").trim();

  if (!name || !priceStr || !totalStr) {
    return NextResponse.json(
      { error: "Nume, preț și număr total sunt obligatorii." },
      { status: 400 }
    );
  }

  const price = Number(priceStr);
  const total = Number(totalStr);

  if (Number.isNaN(price) || Number.isNaN(total) || total <= 0 || price < 0) {
    return NextResponse.json(
      { error: "Valorile pentru preț / număr trebuie să fie numerice valide." },
      { status: 400 }
    );
  }

  await prisma.ticketType.create({
    data: {
      eventId: event.id,
      name,
      price,
      currency,
      total,
    },
  });

  return NextResponse.redirect(
    new URL(`/events/${event.slug}/tickets`, req.url),
    { status: 303 }
  );
}