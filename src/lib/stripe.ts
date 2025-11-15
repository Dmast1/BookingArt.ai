// src/lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY nu este setat în .env");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// без apiVersion, чтобы не вылезала твоя ошибка про "2024-06-20"