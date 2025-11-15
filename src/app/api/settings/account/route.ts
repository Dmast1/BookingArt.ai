// src/app/api/settings/account/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/auth?next=/settings/account", request.url),
    );
  }

  const form = await request.formData();

  const name = form.get("name")?.toString().trim() || null;
  const phone = form.get("phone")?.toString().trim() || null;
  const city = form.get("city")?.toString().trim() || null;
  const country = form.get("country")?.toString().trim() || null;
  const bio = form.get("bio")?.toString().trim() || null;
  const language = form.get("language")?.toString().trim() || null;

  const birthDateStr = form.get("birthDate")?.toString();
  const birthDate = birthDateStr ? new Date(birthDateStr) : null;

  let avatarUrl = user.avatarUrl ?? null;
  const avatarFile = form.get("avatar") as File | null;

  if (avatarFile && avatarFile.size > 0) {
    // кладём аватарку в /public/uploads
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = avatarFile.name.split(".").pop() || "jpg";
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    avatarUrl = `/uploads/${fileName}`;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone,
      city,
      country,
      bio,
      language,
      birthDate,
      avatarUrl,
    },
  });

  return NextResponse.redirect(
    new URL("/settings/account?updated=1", request.url),
  );
}
