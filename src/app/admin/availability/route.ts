import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const jar = await cookies(); // Next 16: async
  if (jar.get("admin")?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const providerId = String(form.get("providerId") || "");
  const date = String(form.get("date") || "");
  const status = String(form.get("status") || "free");
  const note = (String(form.get("note") || "").trim() || null);

  if (!providerId || !date) {
    return NextResponse.redirect(new URL("/admin/providers?e=1", req.url));
  }

  const d = new Date(`${date}T00:00:00`);
  await prisma.availability.upsert({
    where: { providerId_date: { providerId, date: d } },
    create: { providerId, date: d, status, note },
    update: { status, note },
  });

  return NextResponse.redirect(new URL(`/admin/providers/${providerId}/availability`, req.url));
}
