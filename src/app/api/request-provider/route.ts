// src/app/api/request-provider/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadSource, Role } from "@prisma/client";
import { z } from "zod";

// Одна схема для обоих сценариев:
// 1) есть providerId  (кликаем в календаре существующего провайдера)
// 2) нет providerId, но есть providerName (предложить нового провайдера)
const BodySchema = z.object({
  // вариант 1: существующий провайдер
  providerId: z.string().optional(),

  // вариант 2: создать нового провайдера
  providerName: z.string().optional(),

  city: z.string().min(2, "Oraș invalid"),
  country: z.string().optional().nullable(),
  categories: z.array(z.string()).optional().default([]),

  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  date: z.string().optional(), // ISO
  time: z.string().optional(),
});

// аккуратно читаем либо JSON, либо форму
async function readBody(req: Request): Promise<any> {
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    return req.json();
  }

  if (
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    const obj: Record<string, any> = {};

    form.forEach((value, key) => {
      // formData может вернуть File | string — приводим к строке
      obj[key] = typeof value === "string" ? value : String(value);
    });

    // если категории передали строкой, попробуем распарсить
    if (obj.categories && typeof obj.categories === "string") {
      try {
        obj.categories = JSON.parse(obj.categories);
      } catch {
        obj.categories = [obj.categories];
      }
    }

    return obj;
  }

  // запасной вариант: пробуем как текст+JSON
  const text = await req.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Body must be JSON or form data");
  }
}

export async function POST(req: Request) {
  try {
    const raw = await readBody(req);
    const data = BodySchema.parse(raw);

    const {
      providerId,
      providerName,
      city,
      country,
      categories,
      contactName,
      contactEmail,
      contactPhone,
      date,
      time,
    } = data;

    // email, который положим в lead
    const emailForLead =
      contactEmail ?? `pending+${crypto.randomUUID()}@bookingart.ai`;

    // --------------------------------------------------
    // 1) СЦЕНАРИЙ: уже существующий провайдер (providerId)
    // --------------------------------------------------
    if (providerId) {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true },
      });

      if (!provider) {
        return NextResponse.json(
          { ok: false, error: "Provider not found" },
          { status: 404 }
        );
      }

      const lead = await prisma.lead.create({
        data: {
          source: LeadSource.provider,
          status: "new",
          providerId: provider.id,
          email: emailForLead,
          city,
          time: time ?? null,
          date: date ? new Date(date) : null,
        },
        select: { id: true, createdAt: true, status: true },
      });

      return NextResponse.json(
        { ok: true, mode: "existing-provider", lead },
        { status: 201 }
      );
    }

    // --------------------------------------------------
    // 2) СЦЕНАРИЙ: нет providerId -> создаём нового провайдера
    // --------------------------------------------------
    if (!providerName) {
      return NextResponse.json(
        { ok: false, error: "providerId sau providerName este obligatoriu" },
        { status: 400 }
      );
    }

    // создаём / обновляем аккаунт пользователя под этого провайдера
    const user = await prisma.user.upsert({
      where: { email: emailForLead },
      update: {
        name: contactName ?? undefined,
        phone: contactPhone ?? undefined,
        role: Role.PROVIDER,
      },
      create: {
        email: emailForLead,
        name: contactName ?? providerName,
        phone: contactPhone ?? null,
        role: Role.PROVIDER,
      },
      select: { id: true },
    });

    // создаём самого провайдера
    const provider = await prisma.provider.create({
      data: {
        displayName: providerName,
        city,
        country: country ?? "RO",
        categories: categories ?? [],
        user: {
          connect: { id: user.id },
        },
      },
      select: { id: true, displayName: true, userId: true },
    });

    // лид к новому провайдеру
    const lead = await prisma.lead.create({
      data: {
        source: LeadSource.provider,
        status: "new",
        providerId: provider.id,
        email: emailForLead,
        city,
        time: time ?? null,
        date: date ? new Date(date) : null,
      },
      select: { id: true, createdAt: true, status: true },
    });

    return NextResponse.json(
      {
        ok: true,
        mode: "new-provider",
        provider,
        lead,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[request-provider] error:", err);
    const message =
      err?.issues?.[0]?.message ||
      err?.message ||
      "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
