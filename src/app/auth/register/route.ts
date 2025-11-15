// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { name, email, password } = BodySchema.parse(json);

    // 1) Проверяем, что юзер не существует
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Există deja un cont cu acest email." },
        { status: 400 }
      );
    }

    // 2) Хэш пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Можно сразу логинить здесь, если есть createSession(user.id)
    // но мы залогинимся на фронте вторым запросом /api/auth/login

    return NextResponse.json(
      { ok: true, user },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[register]", err);
    const msg =
      err?.issues?.[0]?.message ||
      err?.message ||
      "Eroare la înregistrare";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
