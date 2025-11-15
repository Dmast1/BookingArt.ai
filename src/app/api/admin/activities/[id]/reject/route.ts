// src/app/api/admin/activities/[id]/reject/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.activity.update({
    where: { id },
    data: { status: "rejected" },
  });

  return NextResponse.json({ ok: true });
}
