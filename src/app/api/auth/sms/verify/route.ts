// src/app/api/auth/sms/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { twilioClient, TWILIO_VERIFY_SID } from "@/lib/twilio";
import { AUTH_COOKIE } from "@/lib/auth";
import { z } from "zod";

const BodySchema = z.object({
  phone: z.string().min(6, "Telefon invalid"),
  code: z.string().min(3, "Cod invalid"),
});

export async function POST(req: Request) {
  try {
    const { phone, code } = BodySchema.parse(await req.json());
    const to = phone.trim();

    // 1) проверяем код у Twilio Verify
    const check = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verificationChecks.create({ to, code });

    if (check.status !== "approved") {
      return NextResponse.json(
        { ok: false, error: "Cod incorect sau expirat." },
        { status: 400 },
      );
    }

    // 2) находим юзера по телефону (он уже должен быть создан в /sms/start)
    let user = await prisma.user.findUnique({ where: { phone: to } });

    // fallback на всякий случай – если каким-то образом /sms/start не создал юзера
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: to,
          role: "USER",
          phoneVerified: new Date(),
        },
      });
    } else if (!user.phoneVerified) {
      // проставляем дату верификации, если ещё не была
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: new Date() },
      });
    }

    // 3) логиним через куку
    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        role: user.role,
        phone: user.phone,
      },
    });

    res.cookies.set(AUTH_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 zile
    });

    return res;
  } catch (err) {
    console.error("[sms/verify] error", err);
    return NextResponse.json(
      { ok: false, error: "Eroare de server. Încearcă din nou." },
      { status: 500 },
    );
  }
}
