// src/app/api/settings/provider/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (user.role !== "PROVIDER" && user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();

  const {
    displayName,
    city,
    country,
    categories,
    bio,
    youtubeUrl,
    instagramUrl,
    facebookUrl,
    websiteUrl,
  } = body as {
    displayName?: string | null;
    city?: string | null;
    country?: string | null;
    categories?: string[] | null;
    bio?: string | null;
    youtubeUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    websiteUrl?: string | null;
  };

  // обязательное поле – всегда строка
  const finalDisplayName =
    (typeof displayName === "string" && displayName.trim().length > 0
      ? displayName.trim()
      : user.name ||
        user.email ||
        "Artist");

  const safeCategories = Array.isArray(categories)
    ? categories.filter((c): c is string => typeof c === "string")
    : [];

  const provider = await prisma.provider.upsert({
    where: { userId: user.id },
    update: {
      displayName: finalDisplayName,
      city: city ?? null,
      country: country ?? null,
      categories: safeCategories,
      bio: bio ?? null,
      youtubeUrl: youtubeUrl ?? null,
      instagramUrl: instagramUrl ?? null,
      facebookUrl: facebookUrl ?? null,
      websiteUrl: websiteUrl ?? null,
    },
    create: {
      userId: user.id,
      displayName: finalDisplayName,
      city: city ?? null,
      country: country ?? null,
      categories: safeCategories,
      bio: bio ?? null,
      youtubeUrl: youtubeUrl ?? null,
      instagramUrl: instagramUrl ?? null,
      facebookUrl: facebookUrl ?? null,
      websiteUrl: websiteUrl ?? null,
    },
  });

  return NextResponse.json({ ok: true, provider });
}