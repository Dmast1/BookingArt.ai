// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// 👆 убрали { apiVersion: ... }

export async function POST(req: NextRequest) {
  try {
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.nextUrl.origin ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Test Booking",
              description: "Rezervare de test pe BookingArt.ai",
            },
            unit_amount: 1000, // 10.00 EUR
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payments/cancel`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return new NextResponse(
      JSON.stringify({
        error: err.message ?? "Stripe error",
      }),
      { status: 500 }
    );
  }
}