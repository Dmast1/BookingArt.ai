import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ ok: false, error: "Neautentificat" }, { status: 401 });
    }

    const { name, email, city } = await req.json();

    await prisma.user.update({
      where: { id: me.id },
      data: {
        name: name?.trim() || me.name,
        email: email ? String(email).trim().toLowerCase() : me.email,
        city: city?.trim() || me.city,
        role: "USER",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[onboarding/client]", e);
    return NextResponse.json(
      { ok: false, error: "Eroare de server" },
      { status: 500 },
    );
  }
}
