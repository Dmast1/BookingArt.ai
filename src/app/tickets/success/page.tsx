// src/app/tickets/success/page.tsx
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: { session_id?: string };
};

export const dynamic = "force-dynamic";

export default async function TicketsSuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams?.session_id;
  if (!sessionId) {
    redirect("/tickets");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = (session.metadata?.orderId as string) || null;

  if (!orderId) {
    redirect("/tickets");
  }

  // если реально оплачено — отмечаем заказ как paid
  if (session.payment_status === "paid") {
    await prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: "paid" },
    });
  }

  // и отправляем юзера на страницу конкретного заказа
  redirect(`/tickets/${orderId}`);
}