// src/app/api/provider/activities/slots/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function toIso(date: string, time: string) {
  // date: YYYY-MM-DD, time: HH:MM
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0));
}

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.redirect(new URL("/auth?next=/provider/activities", req.url));

  const form = await req.formData();
  const activityId = (form.get("activityId") || "").toString();
  const date = (form.get("date") || "").toString().slice(0, 10);
  const timeFrom = (form.get("timeFrom") || "").toString();
  const timeTo = (form.get("timeTo") || "").toString();
  const capacity = Number(form.get("capacity") || 1);
  const status = (form.get("status") || "open").toString();
  const note = (form.get("note") || "").toString();

  if (!activityId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.redirect(new URL(`/provider/activities/${activityId}/slots`, req.url));
  }

  // проверка владельца
  const own = await prisma.activity.findFirst({
    where: { id: activityId, provider: { userId: me.id } },
    select: { id: true },
  });
  if (!own) return NextResponse.redirect(new URL("/provider/activities", req.url));

  const startAt = toIso(date, timeFrom);
  const endAt = toIso(date, timeTo);

  await prisma.activitySlot.upsert({
    where: {
      activityId_startAt_endAt: {
        activityId,
        startAt,
        endAt,
      },
    },
    create: {
      activityId,
      startAt,
      endAt,
      capacityTotal: capacity > 0 ? capacity : 1,
      status: ["open", "closed", "sold_out"].includes(status) ? status : "open",
      note: note || null,
    },
    update: {
      capacityTotal: capacity > 0 ? capacity : 1,
      status: ["open", "closed", "sold_out"].includes(status) ? status : "open",
      note: note || null,
    },
  });

  return NextResponse.redirect(new URL(`/provider/activities/${activityId}/slots`, req.url));
}
