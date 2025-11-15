// src/app/api/tickets/checkout/route.ts  ← путь оставляй тот же
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Stripe from "stripe";

type CheckoutItem = {
  ticketTypeId: string;
  quantity: number;
};

type CheckoutBody = {
  eventId: string;
  items: CheckoutItem[];
  email?: string;
};

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const hasStripe = stripeSecret.length > 0;

// без apiVersion — чтобы не ловить ошибки типов
const stripe = hasStripe ? new Stripe(stripeSecret) : null;

export async function POST(req: Request) {
  const user = await getCurrentUser();

  let body: CheckoutBody | null = null;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.eventId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "eventId și items sunt obligatorii" },
      { status: 400 }
    );
  }

  const cleanItems = body.items
    .map((i) => ({
      ticketTypeId: i.ticketTypeId,
      quantity: Number(i.quantity),
    }))
    .filter((i) => i.quantity > 0 && !!i.ticketTypeId);

  if (cleanItems.length === 0) {
    return NextResponse.json(
      { error: "Cel puțin un tip de bilet cu cantitate > 0" },
      { status: 400 }
    );
  }

  const email = body.email?.trim() || user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "Emailul este obligatoriu pentru comandă" },
      { status: 400 }
    );
  }

  // проверяем, что event существует (ещё нужен slug для cancel_url)
  const event = await prisma.event.findUnique({
    where: { id: body.eventId },
    select: { id: true, slug: true, title: true },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evenimentul nu există." },
      { status: 404 }
    );
  }

  // общая валидация типов билетов
  const typeIds = cleanItems.map((i) => i.ticketTypeId);
  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: typeIds } },
  });

  if (ticketTypes.length !== typeIds.length) {
    return NextResponse.json(
      { error: "Unele tipuri de bilete nu au fost găsite" },
      { status: 400 }
    );
  }

  for (const t of ticketTypes) {
    if (t.eventId !== body.eventId) {
      return NextResponse.json(
        { error: "Tip de bilet care nu aparține acestui eveniment" },
        { status: 400 }
      );
    }
  }

  let currency = ticketTypes[0].currency;
  let total = 0;

  for (const item of cleanItems) {
    const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!;

    if (tt.currency !== currency) {
      return NextResponse.json(
        {
          error:
            "Toate biletele din aceeași comandă trebuie să fie în aceeași valută",
        },
        { status: 400 }
      );
    }

    if (item.quantity <= 0) {
      return NextResponse.json(
        { error: "Cantitate invalidă" },
        { status: 400 }
      );
    }

    const available = tt.total - tt.sold;
    if (item.quantity > available) {
      return NextResponse.json(
        {
          error: `Disponibil doar ${available} bilete pentru tipul "${tt.name}"`,
        },
        { status: 400 }
      );
    }

    total += tt.price * item.quantity;
  }

  // ─────────────────────────────────────────────
  // 1) БЕЗ Stripe — старое поведение (MVP)
  // ─────────────────────────────────────────────
  if (!hasStripe || !stripe) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.ticketOrder.create({
          data: {
            userId: user?.id ?? null,
            email,
            status: "paid",
            total,
            currency,
            eventId: body!.eventId,
          },
        });

        for (const item of cleanItems) {
          const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!;

          await tx.ticketOrderItem.create({
            data: {
              orderId: created.id,
              ticketTypeId: tt.id,
              quantity: item.quantity,
              unitPrice: tt.price,
              currency: tt.currency,
            },
          });

          await tx.ticketType.update({
            where: { id: tt.id },
            data: { sold: { increment: item.quantity } },
          });
        }

        return created;
      });

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status, // "paid"
      });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json(
        { error: e.message || "Eroare la procesarea comenzii" },
        { status: 400 }
      );
    }
  }

  // ─────────────────────────────────────────────
  // 2) СО Stripe — создаём pending заказ + Checkout Session
  // ─────────────────────────────────────────────
  try {
    const order = await prisma.ticketOrder.create({
      data: {
        userId: user?.id ?? null,
        email,
        status: "pending",
        total,
        currency,
        eventId: body!.eventId,
        items: {
          create: cleanItems.map((item) => {
            const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!;
            return {
              ticketTypeId: tt.id,
              quantity: item.quantity,
              unitPrice: tt.price,
              currency: tt.currency,
            };
          }),
        },
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cleanItems.map((item) => {
        const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!;
        return {
          quantity: item.quantity,
          price_data: {
            currency: tt.currency.toLowerCase(), // "ron", "eur"
            unit_amount: tt.price, // в bani/центах
            product_data: {
              name: `${event.title} — ${tt.name}`,
            },
          },
        };
      });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      success_url: `${baseUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${event.slug}`,
      metadata: {
        orderId: order.id,
        eventId: body.eventId,
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status, // "pending"
      checkoutUrl: session.url,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Eroare la procesarea comenzii" },
      { status: 400 }
    );
  }
}