// src/app/api/admin/activities/[id]/approve/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 теперь ждём промис

  // тут можешь добавить проверку роли ADMIN, если нужно

  await prisma.activity.update({
    where: { id },
    data: { status: "active" },
  });

  return NextResponse.json({ ok: true });
}
