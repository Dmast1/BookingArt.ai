// GET /api/leads  => список лидов (последние 50)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        venue: { select: { id: true, name: true, city: true } },
        provider: { select: { id: true, displayName: true, city: true } },
      },
    });
    return NextResponse.json({ ok: true, leads });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
