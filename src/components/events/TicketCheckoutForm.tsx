// src/components/.../TicketCheckoutForm.tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";

type TicketTypeDTO = {
  id: string;
  name: string;
  price: number;   // în bani
  currency: string;
  total: number;
  sold: number;
};

type Props = {
  eventId: string;
  userEmail?: string | null;
  ticketTypes: TicketTypeDTO[];
};

export function TicketCheckoutForm({ eventId, userEmail, ticketTypes }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(userEmail ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const q: Record<string, number> = {};
    for (const t of ticketTypes) q[t.id] = 0;
    return q;
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () =>
      ticketTypes.reduce((sum, t) => {
        const q = quantities[t.id] ?? 0;
        return sum + t.price * q;
      }, 0),
    [ticketTypes, quantities]
  );

  const currency = ticketTypes[0]?.currency ?? "RON";

  function changeQty(id: string, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      let next = current + delta;
      if (next < 0) next = 0;
      if (next > max) next = max;
      return { ...prev, [id]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const items = ticketTypes
      .map((t) => ({
        ticketTypeId: t.id,
        quantity: quantities[t.id] ?? 0,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      setError("Selectează cel puțin un bilet.");
      return;
    }
    if (!email.trim()) {
      setError("Introdu emailul pentru livrarea biletelor.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tickets/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            items,
            email: email.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(
            data.error || "Eroare la finalizarea comenzii"
          );
        }

        // 1) Stripe-режим: есть checkoutUrl → уходим на Stripe
        const checkoutUrl = data.checkoutUrl as string | undefined;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }

        // 2) Без Stripe: просто страница заказа
        const orderId = data.orderId as string | undefined;
        if (orderId) {
          router.push(`/tickets/${orderId}`);
        } else {
          setError("Răspuns invalid de la server.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Eroare la finalizarea comenzii");
      }
    });
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-bg/80 p-4 text-xs text-zinc-400">
        Organizatorul nu a configurat încă bilete pentru acest eveniment.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-line bg-bg/90 p-4 text-xs text-zinc-300"
    >
      <h2 className="text-sm font-semibold text-zinc-100">
        Cumpără bilete
      </h2>

      {ticketTypes.map((t) => {
        const available = Math.max(t.total - t.sold, 0);
        return (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/80 px-3 py-2"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-100">
                {t.name}
              </div>
              <div className="text-[11px] text-zinc-400">
                {(t.price / 100).toFixed(2)} {t.currency} · Disponibile:{" "}
                <span className="text-emerald-300">{available}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeQty(t.id, -1, available)}
                className="h-7 w-7 rounded-full border border-line bg-bg text-xs text-zinc-100 hover:border-accent/60"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">
                {quantities[t.id] ?? 0}
              </span>
              <button
                type="button"
                onClick={() => changeQty(t.id, 1, available)}
                className="h-7 w-7 rounded-full border border-line bg-bg text-xs text-zinc-100 hover:border-accent/60"
                disabled={available === 0}
              >
                +
              </button>
            </div>
          </div>
        );
      })}

      <div className="space-y-1">
        <label className="text-[11px] uppercase tracking-wide text-zinc-500">
          Email pentru bilete
        </label>
        <input
          type="email"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-zinc-100 outline-none"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <div className="text-[11px] text-zinc-400">
          Total:
          <span className="ml-1 text-sm font-semibold text-zinc-100">
            {(total / 100).toFixed(2)} {currency}
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending || total === 0}
          className="rounded-xl bg-accent px-4 py-2 text-[11px] font-semibold text-black hover:brightness-110 disabled:opacity-60"
        >
          {isPending ? "Se procesează…" : "Finalizare comandă"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
          {error}
        </div>
      )}
    </form>
  );
}