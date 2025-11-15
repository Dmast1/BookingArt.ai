// src/app/api/bookings/new/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
// import { prisma } from "@/lib/prisma"; // подключишь, когда будешь писать реальную запись

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Neautorizat" }, { status: 401 });
    }

    const body = await req.json();

    // TODO: здесь реальное создание booking в базе через prisma.booking.create(...)
    // Пока просто логируем, чтобы фронт работал и не падал.
    console.log("NEW BOOKING REQUEST", {
      userId: user.id,
      email: user.email,
      payload: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("bookings/new error", err);
    return NextResponse.json(
      { message: "Eroare server" },
      { status: 500 }
    );
  }
}