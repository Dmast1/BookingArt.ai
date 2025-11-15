import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/leads/:id/status  { "status": "contacted" | "converted" | "rejected" | "new" }
type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({} as any));
    const status = String(body?.status || "");

    const allowed = ["new", "contacted", "converted", "rejected"];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        status: true,
        source: true,
        city: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}