// src/app/api/admin/availability/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, ctx: Context) {
  const { id } = await ctx.params; // вместо params.id

  const jar = await cookies(); // ок, можно и без await
  if (jar.get("admin")?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const form = await req.formData();
  const method = String(form.get("_method") || "PATCH").toUpperCase();

  if (method === "DELETE") {
    await prisma.availability.delete({ where: { id } });

    return NextResponse.redirect(
      new URL(req.headers.get("referer") || "/admin/providers", req.url)
    );
  }

  const status = String(form.get("status") || "free");
  const note = (String(form.get("note") || "").trim() || null) as string | null;

  await prisma.availability.update({
    where: { id },
    data: { status, note },
  });

  return NextResponse.redirect(
    new URL(req.headers.get("referer") || "/admin/providers", req.url)
  );
}