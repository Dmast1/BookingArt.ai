// src/app/api/admin/events/[eventId]/tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_req: NextRequest, ctx: Context) {
  const { eventId } = await ctx.params;

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      city: true,
      date: true,
      ticketTypes: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function POST(req: NextRequest, ctx: Context) {
  const { eventId } = await ctx.params;

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; price?: number; currency?: string; total?: number }
    | null;

  if (
    !body?.name ||
    typeof body.price !== "number" ||
    !body.currency ||
    typeof body.total !== "number"
  ) {
    return NextResponse.json(
      { error: "name, price, currency, total required" },
      { status: 400 }
    );
  }

  const ticketType = await prisma.ticketType.create({
    data: {
      eventId,
      name: body.name,
      price: body.price,
      currency: body.currency,
      total: body.total,
    },
  });

  return NextResponse.json({ ticketType });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: string; name?: string; price?: number; currency?: string; total?: number }
    | null;

  if (!body?.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.price === "number") data.price = body.price;
  if (typeof body.currency === "string") data.currency = body.currency;
  if (typeof body.total === "number") data.total = body.total;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  const ticketType = await prisma.ticketType.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json({ ticketType });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.ticketOrderItem.deleteMany({
    where: { ticketTypeId: body.id },
  });

  await prisma.ticketType.delete({
    where: { id: body.id },
  });

  return NextResponse.json({ ok: true });
}