import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      displayName,
      city,
      country,
      categories = [],
      bio,
      youtubeUrl,
      instagramUrl,
      facebookUrl,
      websiteUrl,
    } = (body ?? {}) as Record<string, unknown>;

    if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
      return NextResponse.json({ error: "Display name required" }, { status: 400 });
    }

    // Normalize categories -> string[]
    let normalizedCategories: string[] = [];
    if (Array.isArray(categories)) {
      normalizedCategories = categories
        .filter(Boolean)
        .map((c) => String(c).trim())
        .filter((c) => c.length > 0);
    } else if (typeof categories === "string" && categories.trim()) {
      normalizedCategories = [categories.trim()];
    }

    // если у пользователя уже есть провайдер — вернём ошибку
    const existing = await prisma.provider.findFirst({
      where: { userId: user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Provider already exists" }, { status: 409 });
    }

    // Создаём провайдера используя только поля, которые присутствуют в схеме
    const provider = await prisma.provider.create({
      data: {
        userId: user.id,
        displayName: displayName.trim(),
        city: city ? String(city) : null,
        country: country ? String(country) : null,
        categories: normalizedCategories,
        bio: bio ? String(bio) : null,
        youtubeUrl: youtubeUrl ? String(youtubeUrl) : null,
        instagramUrl: instagramUrl ? String(instagramUrl) : null,
        facebookUrl: facebookUrl ? String(facebookUrl) : null,
        websiteUrl: websiteUrl ? String(websiteUrl) : null,
      },
      select: { id: true, displayName: true },
    });

    // Формируем slug клиентски (не сохраняем в БД, так как поля slug нет)
    const slug = slugify(String(provider.displayName ?? provider.id)) || String(provider.id);

    return NextResponse.json({ ok: true, id: provider.id, slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}