// src/components/.../TicketPurchaseForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type TicketTypeDTO = {
  id: string;
  name: string;
  price: number; // în bani
  currency: string;
  total: number;
  sold: number;
};

export function TicketPurchaseForm(props: {
  eventId: string;
  ticketTypes: TicketTypeDTO[];
  defaultEmail?: string | null;
}) {
  const { eventId, ticketTypes, defaultEmail } = props;
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(ticketTypes.map((t) => [t.id, 0])) as Record<
        string,
        number
      >
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = ticketTypes.reduce((sum, t) => {
    const q = quantities[t.id] ?? 0;
    return sum + q * t.price;
  }, 0);

  const currency = ticketTypes[0]?.currency ?? "RON";

  function setQty(id: string, v: number) {
    if (Number.isNaN(v) || v < 0) v = 0;
    setQuantities((prev) => ({ ...prev, [id]: v }));
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
    if (!email || !email.includes("@")) {
      setError("Introdu un email valid pentru confirmare.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tickets/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, email, items }),
        });

        const data = await res.json().catch(() => ({} as any));

        if (!res.ok) {
          setError(
            (data as any)?.error ?? "Nu am reușit să procesez comanda."
          );
          return;
        }

        const checkoutUrl = (data as any).checkoutUrl as
          | string
          | undefined;

        if (checkoutUrl) {
          // Stripe Checkout
          window.location.href = checkoutUrl;
          return;
        }

        // fallback: fără Stripe → pagină comandă
        const orderId = (data as any).orderId as string | undefined;
        if (orderId) {
          router.push(`/tickets/${orderId}`);
        } else {
          setError("Răspuns invalid de la server.");
        }
      } catch (err) {
        console.error(err);
        setError("Eroare de rețea. Încearcă din nou.");
      }
    });
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm text-zinc-400">
        Momentan nu sunt tipuri de bilete configurate pentru acest
        eveniment.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-line bg-surface/80 p-4 text-sm"
    >
      <h2 className="text-sm font-semibold text-zinc-100">
        Cumpără bilete
      </h2>

      {/* Tipuri de bilete */}
      <div className="space-y-2">
        {ticketTypes.map((t) => {
          const remaining = t.total < 0 ? null : t.total - t.sold;
          const priceFormatted = (t.price / 100).toFixed(2);

          return (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2"
            >
              <div>
                <div className="text-sm text-zinc-100">{t.name}</div>
                <div className="text-xs text-zinc-500">
                  {priceFormatted} {t.currency} / bilet
                  {remaining !== null && (
                    <> · rămase: {Math.max(remaining, 0)}</>
                  )}
                </div>
              </div>
              <input
                type="number"
                min={0}
                className="w-16 rounded-lg border border-line bg-surface px-2 py-1 text-right text-sm text-zinc-100 outline-none"
                value={quantities[t.id] ?? 0}
                onChange={(e) => setQty(t.id, Number(e.target.value))}
              />
            </div>
          );
        })}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="grid gap-1 text-xs text-zinc-400">
          <span>Email pentru confirmare</span>
          <input
            type="email"
            className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Total</span>
        <span className="text-base font-semibold text-zinc-50">
          {(total / 100).toFixed(2)} {currency}
        </span>
      </div>

      {/* Erori */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Button */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
      >
        {isPending ? "Se procesează…" : "Continuă către plată"}
      </button>

      <p className="text-[11px] text-zinc-500">
        Plata este procesată prin Stripe (mod test). După finalizarea
        plății vei fi redirecționat înapoi pe BookingArt.ai.
      </p>
    </form>
  );
}