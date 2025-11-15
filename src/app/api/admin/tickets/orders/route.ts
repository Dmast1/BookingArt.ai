import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_STATUSES = ["pending", "paid", "canceled"] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.ticketOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          city: true,
          date: true,
        },
      },
      items: {
        include: { ticketType: true },
      },
    },
  });

  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as
    | { orderId?: string; status?: string }
    | null;

  if (!body?.orderId || !body.status) {
    return NextResponse.json(
      { error: "orderId & status required" },
      { status: 400 }
    );
  }

  const status = body.status as OrderStatus;
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const order = await prisma.ticketOrder.update({
    where: { id: body.orderId },
    data: { status },
  });

  return NextResponse.json({ ok: true, order });
}
