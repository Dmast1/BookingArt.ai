// src/app/bookings/Actions.tsx
"use client";

import { useState } from "react";

export default function Actions({ id, current }: { id: string; current: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState(current);

  async function set(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setStatus(data.booking.status);
    } catch (e) {
      console.error(e);
      alert("Не удалось обновить статус");
    } finally {
      setLoading(null);
    }
  }

  const Btn = (p: { to: string; label: string; tone: string }) => (
    <button
      onClick={() => set(p.to)}
      disabled={loading !== null}
      className={`rounded px-2 py-1 text-xs border ${p.tone} disabled:opacity-50`}
      title={`Сделать ${p.label}`}
    >
      {loading === p.to ? "…" : p.label}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <span className="rounded border px-2 py-1 text-xs">{status}</span>
      <Btn to="paid" label="paid" tone="border-green-600 text-green-700" />
      <Btn to="canceled" label="canceled" tone="border-red-600 text-red-700" />
      <Btn to="done" label="done" tone="border-slate-400 text-slate-700" />
    </div>
  );
}
