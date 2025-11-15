// src/app/api/chat/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const convs = await prisma.conversation.findMany({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      userOne: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      userTwo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  const data = convs.map((c) => {
    const other =
      c.userOneId === user.id ? c.userTwo : c.userOne;

    return {
      id: c.id,
      updatedAt: c.updatedAt.toISOString(),
      lastMessage: c.messages[0]
        ? {
            id: c.messages[0].id,
            text: c.messages[0].text,
            createdAt: c.messages[0].createdAt.toISOString(),
            senderId: c.messages[0].senderId,
          }
        : null,
      otherUser: {
        id: other?.id ?? "",
        name: other?.name ?? null,
        email: other?.email ?? null,
        avatarUrl: other?.avatarUrl ?? null,
      },
    };
  });

  return NextResponse.json({ conversations: data });
}
