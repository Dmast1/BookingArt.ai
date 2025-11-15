"use client";

import { useTransition, useState } from "react";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "canceled", label: "Canceled" },
] as const;

export function TicketOrderStatusForm(props: {
  orderId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(props.initialStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setStatus(next);
    setError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/tickets/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: props.orderId, status: next }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "Eroare la salvare.");
          return;
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error(err);
        setError("Eroare de rețea.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        className="rounded-lg border border-line bg-bg px-2 py-1 text-xs text-zinc-100 outline-none"
        value={status}
        onChange={handleChange}
        disabled={isPending}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[11px] text-red-400">{error}</span>
      )}
      {saved && !error && (
        <span className="text-[11px] text-emerald-400">
          Salvat.
        </span>
      )}
    </div>
  );
}
