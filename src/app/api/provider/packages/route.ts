import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET  /api/provider/packages   — список пакетов текущего провайдера
 * POST /api/provider/packages   — создать
 * PATCH /api/provider/packages  — обновить
 * DELETE /api/provider/packages — удалить
 */

async function requireProvider() {
  const user = await getCurrentUser();
  if (!user) return { user: null, provider: null };

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return { user, provider };
}

export async function GET() {
  const { user, provider } = await requireProvider();
  if (!user || !provider) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const packages = await prisma.providerPackage.findMany({
    where: { providerId: provider.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ packages });
}

export async function POST(req: Request) {
  const { user, provider } = await requireProvider();
  if (!user || !provider) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    title,
    description,
    price,
    currency,
    isPublic,
    sortOrder,
    imageUrl,
    tag,
    durationHours,
    maxPeople,
    isHighlight,
  } = body;

  if (!title || typeof price !== "number") {
    return NextResponse.json(
      { error: "Missing title or price" },
      { status: 400 }
    );
  }

  const pkg = await prisma.providerPackage.create({
    data: {
      providerId: provider.id,
      title,
      description: description ?? null,
      price,
      currency: currency || "EUR",
      isPublic: Boolean(isPublic),
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,

      imageUrl: imageUrl ?? null,
      tag: tag ?? null,
      durationHours: durationHours ?? null,
      maxPeople: maxPeople ?? null,
      isHighlight: Boolean(isHighlight),
    },
  });

  return NextResponse.json({ package: pkg }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { user, provider } = await requireProvider();
  if (!user || !provider) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    id,
    title,
    description,
    price,
    currency,
    isPublic,
    sortOrder,
    imageUrl,
    tag,
    durationHours,
    maxPeople,
    isHighlight,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = await prisma.providerPackage.findFirst({
    where: { id, providerId: provider.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pkg = await prisma.providerPackage.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(currency !== undefined && { currency }),
      ...(isPublic !== undefined && { isPublic }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(tag !== undefined && { tag }),
      ...(durationHours !== undefined && { durationHours }),
      ...(maxPeople !== undefined && { maxPeople }),
      ...(isHighlight !== undefined && { isHighlight }),
    },
  });

  return NextResponse.json({ package: pkg });
}

export async function DELETE(req: Request) {
  const { user, provider } = await requireProvider();
  if (!user || !provider) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = await prisma.providerPackage.findFirst({
    where: { id, providerId: provider.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.providerPackage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
