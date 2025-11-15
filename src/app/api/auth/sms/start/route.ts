// src/app/api/auth/sms/start/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { twilioClient, TWILIO_VERIFY_SID } from "@/lib/twilio";
import { z } from "zod";

const BodySchema = z.object({
  phone: z.string().min(6, "Telefon invalid"),
});

export async function POST(req: Request) {
  try {
    if (!twilioClient || !TWILIO_VERIFY_SID) {
      console.error("[sms/start] Twilio nu este configurat corect");
      return NextResponse.json(
        { ok: false, error: "SMS indisponibil momentan" },
        { status: 500 },
      );
    }

    const { phone } = BodySchema.parse(await req.json());
    const raw = phone.trim();

    // лёгкая нормализация, под себя поправишь
    const normalized = raw.startsWith("+")
      ? raw
      : `+4${raw.replace(/^0+/, "")}`;

    // есть ли юзер с таким телефоном
    const existing = await prisma.user.findUnique({
      where: { phone: normalized },
      select: { id: true },
    });

    const mode: "existing" | "new" = existing ? "existing" : "new";

    // отправляем код через Twilio Verify
    await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verifications.create({
        to: normalized,
        channel: "sms",
      });

    return NextResponse.json({ ok: true, mode, phone: normalized });
  } catch (err) {
    console.error("[sms/start] error", err);
    return NextResponse.json(
      { ok: false, error: "Eroare de server. Încearcă din nou." },
      { status: 500 },
    );
  }
}
