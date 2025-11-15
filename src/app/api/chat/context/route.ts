import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userOne: true,
      userTwo: true,
    },
  });

  if (
    !conversation ||
    (conversation.userOneId !== user.id && conversation.userTwoId !== user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userIds = [conversation.userOneId, conversation.userTwoId];

  const providers = await prisma.provider.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true, displayName: true },
  });

  let booking = null as
    | {
        id: string;
        city: string | null;
        date: string;
        status: string;
        priceGross: number | null;
        providerName: string | null;
        clientEmail: string | null;
      }
    | null;

  for (const p of providers) {
    const clientUserId =
      p.userId === conversation.userOneId
        ? conversation.userTwoId
        : conversation.userOneId;

    const lastBooking = await prisma.booking.findFirst({
      where: {
        userId: clientUserId,
        providerId: p.id,
      },
      orderBy: { date: "desc" },
      include: {
        user: { select: { email: true } },
      },
    });

    if (lastBooking) {
      booking = {
        id: lastBooking.id,
        city: lastBooking.city ?? null,
        date: lastBooking.date.toISOString(),
        status: lastBooking.status,
        priceGross: lastBooking.priceGross ?? null,
        providerName: p.displayName,
        clientEmail: lastBooking.user.email ?? null,
      };
      break;
    }
  }

  return NextResponse.json({ booking });
}
