// src/app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

type BookingAction = "accept" | "decline" | "cancel" | "done";

function canTransition(oldStatus: string, action: BookingAction) {
  switch (action) {
    case "accept":
      return oldStatus === "pending";
    case "decline":
      return oldStatus === "pending";
    case "cancel":
      return oldStatus === "pending" || oldStatus === "accepted";
    case "done":
      return oldStatus === "accepted";
    default:
      return false;
  }
}

export async function POST(req: NextRequest, ctx: Context) {
  const { id } = await ctx.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true } },
      provider: { select: { id: true, userId: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // читаем action (поддерживаем и JSON, и form POST)
  const contentType = req.headers.get("content-type") ?? "";
  let actionStr: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as any;
    actionStr = body?.action ?? null;
  } else {
    const formData = (await req.formData().catch(() => null)) as FormData | null;
    actionStr = formData?.get("action")?.toString() ?? null;
  }

  const action = actionStr as BookingAction | null;
  if (!action || !["accept", "decline", "cancel", "done"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const isClient = booking.userId === user.id;
  const isProvider = booking.provider?.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isClient && !isProvider && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // права по ролям
  if (isClient && !isAdmin) {
    if (action !== "cancel") {
      return NextResponse.json(
        { error: "Client can only cancel booking" },
        { status: 403 }
      );
    }
  }

  if (isProvider && !isAdmin) {
    if (!["accept", "decline", "done"].includes(action)) {
      return NextResponse.json(
        { error: "Provider cannot perform this action" },
        { status: 403 }
      );
    }
  }

  if (!canTransition(booking.status, action)) {
    return NextResponse.json(
      { error: `Cannot ${action} from status ${booking.status}` },
      { status: 400 }
    );
  }

  let newStatus: string = booking.status;
  if (action === "accept") newStatus = "accepted";
  if (action === "decline") newStatus = "declined";
  if (action === "cancel") newStatus = "canceled";
  if (action === "done") newStatus = "done";

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: newStatus },
  });

  // редирект обратно на страницу бронирования
  return NextResponse.redirect(
    new URL(`/bookings/${booking.id}`, req.url),
    303
  );
}