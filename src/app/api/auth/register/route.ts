// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail: string = body.email ?? "";
    const password: string = body.password ?? "";
    const name: string | undefined = body.name;

    const email = rawEmail.trim().toLowerCase();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email și parolă obligatorii" },
        { status: 400 }
      );
    }

    // уже есть юзер с таким email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Există deja un cont cu acest email" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name?.trim() || null,
        passwordHash: hash,
        role: "USER",
      },
    });

    // создаём токен и отправляем письмо
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail({ to: email, token });

    return NextResponse.json(
      { ok: true, userId: user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { ok: false, error: "Eroare server la înregistrare" },
      { status: 500 }
    );
  }
}
