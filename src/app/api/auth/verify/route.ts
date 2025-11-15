// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeEmailVerificationToken } from "@/lib/auth-tokens";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token lipsă" },
        { status: 400 }
      );
    }

    const userId = await consumeEmailVerificationToken(token);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Token invalid sau expirat" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.json(
      { ok: false, error: "Eroare server la verificarea emailului" },
      { status: 500 }
    );
  }
}
