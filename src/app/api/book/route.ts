import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const ctype = req.headers.get("content-type") ?? "";
    let providerId = "";
    let dateStr = "";
    let city = "";
    let userEmail = "";

    if (ctype.includes("application/json")) {
      const body = await req.json();
      providerId = String(body.providerId || "");
      dateStr    = String(body.date || "");
      city       = String(body.city || "");
      userEmail  = String(body.userEmail || "");
    } else {
      // поддержка form-data / x-www-form-urlencoded
      const form = await req.formData();
      providerId = String(form.get("providerId") || "");
      dateStr    = String(form.get("date") || "");
      city       = String(form.get("city") || "");
      userEmail  = String(form.get("userEmail") || "");
    }

    if (!providerId || !dateStr) {
      return NextResponse.json({ error: "providerId and date are required" }, { status: 400 });
    }

    // Нормализуем дату к полуночи UTC
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const utcMidnight = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    // Найти/создать пользователя по email (MVP)
    let userId: string | null = null;
    if (userEmail) {
      const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: { email: userEmail, role: "USER" },
        select: { id: true },
      });
      userId = user.id;
    }

    // Создаём бронь (pending). Если нет userId — сделаем гостевую запись с временным пользователем
    if (!userId) {
      const guest = await prisma.user.create({
        data: { role: "GUEST" },
        select: { id: true },
      });
      userId = guest.id;
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        providerId,
        date: utcMidnight,
        city: city || null,
        status: "pending",
        priceGross: null,
        fee: null,
      },
    });

    // Помечаем доступность как busy (у нас @@unique([providerId, date]) — используем upsert)
    await prisma.availability.upsert({
      where: { providerId_date: { providerId, date: utcMidnight } },
      update: { status: "busy" },
      create: { providerId, date: utcMidnight, status: "busy" },
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
