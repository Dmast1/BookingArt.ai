// src/app/api/request-venue/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { LeadSource } from '@prisma/client';

// enum LeadSource { venue, provider, unknown } — берём 'venue'
const VENUE_SOURCE: LeadSource = 'venue';

const BodySchema = z.object({
  venueName: z.string().min(2, 'venueName too short'),
  city: z.string().min(1, 'city is required'),
  contactEmail: z.string().email('valid contactEmail required'),
  // опционально, потому что в вашей модели Lead есть time/date
  time: z.string().optional(),
  date: z.string().datetime().optional(), // ISO-строка
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = BodySchema.parse(body);

    // 1) находим Venue по (name, city) или создаём
    const existing = await prisma.venue.findFirst({
      where: { name: data.venueName, city: data.city },
      select: { id: true },
    });

    const venueId =
      existing?.id ??
      (
        await prisma.venue.create({
          data: {
            name: data.venueName,
            city: data.city,
            images: [],
            features: [],
          },
          select: { id: true },
        })
      ).id;

    // 2) создаём Lead (email обязателен в вашей схеме)
    const lead = await prisma.lead.create({
      data: {
        source: VENUE_SOURCE,
        venueId,
        email: data.contactEmail,
        city: data.city,
        time: data.time ?? null,
        date: data.date ? new Date(data.date) : null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (e: any) {
    console.error('[request-venue] error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
