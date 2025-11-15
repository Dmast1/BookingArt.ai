// src/app/api/onboarding/venue/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json(
        { ok: false, error: "Neautentificat" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      name,
      venueType,
      city,
      country,
      address,
      capacityMin,
      capacityMax,
      priceFrom,
      priceTo,
      website,
      contactEmail,
      notes,
    } = body ?? {};

    if (!name?.trim() || !city?.trim() || !address?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Numele locației, orașul și adresa completă sunt obligatorii.",
        },
        { status: 400 },
      );
    }

    const capMin = toIntOrNull(capacityMin);
    const capMax = toIntOrNull(capacityMax);
    const priceMin = toIntOrNull(priceFrom);
    const priceMax = toIntOrNull(priceTo);

    if (capMin !== null && capMax !== null && capMax < capMin) {
      return NextResponse.json(
        {
          ok: false,
          error: "Capacitatea maximă trebuie să fie mai mare decât minimă.",
        },
        { status: 400 },
      );
    }

    // подрежем заметку, чтобы не улетело эссе
    const safeNotes =
      typeof notes === "string" ? notes.slice(0, 1000) : undefined;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: me.id },
        data: {
          // считаем владельца venue тоже PROVIDER
          role: "PROVIDER",
        },
      }),
      prisma.venue.create({
        data: {
          ownerId: me.id,
          name: name.trim(),
          city: city.trim(),
          country: (country || "RO").trim(),
          address: address.trim(),          // <- новое поле в Venue
          venueType: venueType || "hall",   // <- новое поле в Venue
          capacityMin: capMin,
          capacityMax: capMax,
          priceFrom: priceMin,
          priceTo: priceMax,
          currency: "EUR",
          website: website || null,         // <- новое поле в Venue
          contactEmail: contactEmail || null, // <- новое поле в Venue
          notes: safeNotes || null,         // <- новое поле в Venue
          images: [],
          features: [],
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[onboarding/venue] error", e);
    return NextResponse.json(
      { ok: false, error: "Eroare de server" },
      { status: 500 },
    );
  }
}
