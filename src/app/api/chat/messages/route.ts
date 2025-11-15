// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    );
  }

  // проверяем, что юзер участник беседы
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userOneId: true, userTwoId: true },
  });

  if (
    !conv ||
    (conv.userOneId !== user.id && conv.userTwoId !== user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msgs = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    messages: msgs.map((m) => ({
      id: m.id,
      text: m.text,
      senderId: m.senderId,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as
    | { conversationId?: string; text?: string }
    | null;

  if (!body?.conversationId || !body?.text?.trim()) {
    return NextResponse.json(
      { error: "conversationId and text are required" },
      { status: 400 }
    );
  }

  const conversationId = body.conversationId;
  const text = body.text.trim();

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userOneId: true, userTwoId: true },
  });

  if (
    !conv ||
    (conv.userOneId !== user.id && conv.userTwoId !== user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      text,
    },
  });

  // обновим updatedAt беседы
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    message: {
      id: msg.id,
      text: msg.text,
      senderId: msg.senderId,
      createdAt: msg.createdAt.toISOString(),
    },
  });
}
