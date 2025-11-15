// src/app/api/messages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json(
      { error: "Mesaj invalid" },
      { status: 400 }
    );
  }

  const { conversationId } = body as {
    conversationId?: string;
    text: string;
  };

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId lipsă (crearea de conversații noi o facem din alt flux)" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userOneId: true, userTwoId: true },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversație inexistentă" },
      { status: 404 }
    );
  }

  // Права: текущий юзер должен быть участником
  if (
    conversation.userOneId !== user.id &&
    conversation.userTwoId !== user.id
  ) {
    return NextResponse.json(
      { error: "Nu ai acces la această conversație" },
      { status: 403 }
    );
  }

  const text = body.text.trim();

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      text,
    },
  });

  // Обновляем updatedAt, чтобы чат поднимался наверх списка
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    id: message.id,
    text: message.text,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
  });
}
