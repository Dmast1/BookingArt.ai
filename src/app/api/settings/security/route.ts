// src/app/api/settings/security/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Neautentificat" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Payload invalid" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = body ?? {};

  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "Parola nouă este obligatorie." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      {
        error:
          "Parola nouă trebuie să aibă cel puțin 8 caractere.",
      },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "Utilizator inexistent." },
      { status: 404 }
    );
  }

  // если пароль уже есть – проверяем текущий
  if (dbUser.passwordHash) {
    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "Parola curentă este obligatorie." },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(
      currentPassword,
      dbUser.passwordHash
    );

    if (!ok) {
      return NextResponse.json(
        { error: "Parola curentă este greșită." },
        { status: 400 }
      );
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ success: true });
}