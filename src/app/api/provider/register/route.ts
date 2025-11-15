// src/app/api/provider/register/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
// import { prisma } from "@/lib/prisma"; // подключишь, когда решишься сохранить в БД

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 🔒 Здесь ТЫ решаешь, как сохранять:
    // 1) В таблицу Lead (tip: "PROVIDER_KYC")
    // 2) В отдельную таблицу ProviderKyc
    // 3) Расширить model Provider c câmpuri legale

    // Пример как lead (ПРИМЕР, нужно подогнать под твою schema.prisma):
    /*
    await prisma.lead.create({
      data: {
        type: "PROVIDER_KYC",
        status: "NEW",
        userId: user.id,
        email: body.contactEmail,
        phone: body.contactPhone,
        name: body.companyName,
        city: body.city,
        payloadJson: JSON.stringify(body),
      },
    });
    */

    // Пока просто логируем и возвращаем ОК, чтобы фронт работал.
    console.log("Provider KYC payload", {
      userId: user.id,
      body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("provider/register error", err);
    return NextResponse.json(
      { message: "Eroare server" },
      { status: 500 }
    );
  }
}