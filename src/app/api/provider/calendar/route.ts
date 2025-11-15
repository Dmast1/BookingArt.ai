import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    // относительный redirect + 303 после POST
    return NextResponse.redirect("/auth?next=/profile", 303);
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!provider) {
    return NextResponse.redirect("/providers/new", 303);
  }

  const form = await req.formData();

  const rawDate = (form.get("date") || "").toString().slice(0, 10);
  const statusRaw = (form.get("status") || "free").toString();
  const timeFrom = (form.get("timeFrom") || "").toString();
  const timeTo = (form.get("timeTo") || "").toString();
  const noteRaw = (form.get("note") || "").toString();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return NextResponse.redirect("/profile", 303);
  }

  const [y, m, d] = rawDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  let status: "free" | "partial" | "busy" = "free";
  if (statusRaw === "partial" || statusRaw === "busy") status = statusRaw;

  let note = noteRaw.trim();
  if (timeFrom || timeTo) {
    const line = `Interval: ${timeFrom || "?"}-${timeTo || "?"}`;
    note = note ? `${line}\n${note}` : line;
  }

  await prisma.availability.upsert({
    where: { providerId_date: { providerId: provider.id, date } },
    create: { providerId: provider.id, date, status, note },
    update: { status, note },
  });

  return NextResponse.redirect("/profile", 303);
}
