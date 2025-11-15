// src/app/api/onboarding/role/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const BodySchema = z.object({
  role: z.enum(["client", "provider", "venue"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Neautentificat." }, { status: 401 });
  }

  try {
    const { role } = BodySchema.parse(await req.json());

    // пока просто выставим role в таблице user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role === "client" ? "USER" : "PROVIDER",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[onboarding/role]", err);
    return NextResponse.json(
      { ok: false, error: "Nu am putut salva rolul." },
      { status: 500 },
    );
  }
}
