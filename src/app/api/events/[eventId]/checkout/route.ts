// src/app/api/events/[eventId]/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// В Next 16 ожидание: params как Promise<...>
type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function POST(req: NextRequest, ctx: RouteContext) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe nu este configurat pe server." },
      { status: 500 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    const url = new URL(`/auth?next=${req.nextUrl.pathname}`, req.url);
    return NextResponse.redirect(url);
  }

  const { eventId } = await ctx.params;

  // читаем тело запроса
  let payload: { ticketTypeId: string; quantity: number };
  try {
    payload = (await req.json()) as {
      ticketTypeId: string;
      quantity: number;
    };
  } catch {
    return NextResponse.json({ error: "Body JSON invalid" }, { status: 400 });
  }
const ticketTypeId = payload.ticketTypeId;
  const qty = Number(payload.quantity ?? 1) || 1;

  if (!ticketTypeId || qty <= 0) {
    return NextResponse.json(
      { error: "Tip bilet sau cantitate invalidă." },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true, title: true },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evenimentul nu există." },
      { status: 404 }
    );
  }

  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
  });

  if (!ticketType || ticketType.eventId !== event.id) {
    return NextResponse.json(
      { error: "Tip de bilet invalid pentru acest eveniment." },
      { status: 400 }
    );
  }
const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: (ticketType.currency || "RON").toLowerCase(),
            product_data: {
              name: `${event.title} — ${ticketType.name}`,
            },
            // предполагается, что price уже в минимальных единицах (bani/centi)
            unit_amount: ticketType.price,
          },
          quantity: qty,
        },
      ],
      // На success — страница успеха, на которую придёт session_id
      success_url: `${origin}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      // На cancel — обратно на страницу события
      cancel_url: `${origin}/events/${event.slug}?payment=cancel`,
      metadata: {
        eventId: event.id,
        ticketTypeId,
        quantity: String(qty),
        userId: user.id,
      },
    });
if (!session.url) {
      return NextResponse.json(
        { error: "Nu s-a putut crea sesiunea de plată." },
        { status: 500 }
      );
    }

    // Фронт после этого должен делать window.location.href = url
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("[STRIPE_CHECKOUT_ERROR]", err);
    return NextResponse.json(
      { error: "Eroare la crearea sesiunii Stripe." },
      { status: 500 }
    );
  }
}