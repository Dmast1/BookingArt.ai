// src/app/providers/[id]/request-form.tsx
"use client";

import { useState } from "react";

type Props = {
  providerId: string;
  defaultCity?: string | null;
  providerName?: string | null;
};

export default function ProviderRequestForm({ providerId, defaultCity, providerName }: Props) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      providerId,
      providerName: fd.get("providerName")?.toString() || providerName || "",
      city: fd.get("city")?.toString() || defaultCity || "",
      contactEmail: fd.get("contactEmail")?.toString() || "",
      contactPhone: fd.get("contactPhone")?.toString() || "",
      date: fd.get("date")?.toString() || undefined,
      time: fd.get("time")?.toString() || undefined,
    };

    try {
      const res = await fetch("/api/request-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || "Server error");
      setOk(true);
      e.currentTarget.reset();
    } catch (error: any) {
      setErr(error?.message || "Eroare");
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-2">
        <label className="text-xs text-zinc-400">Nume artist / companie</label>
        <input
          name="providerName"
          defaultValue={providerName ?? ""}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          placeholder="DJ Alex"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs text-zinc-400">Oraș</label>
        <input
          name="city"
          defaultValue={defaultCity ?? ""}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          placeholder="București"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <label className="text-xs text-zinc-400">Data (UTC)</label>
          <input
            name="date"
            type="date"
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-zinc-400">Ora</label>
          <input
            name="time"
            type="time"
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs text-zinc-400">Email</label>
        <input
          name="contactEmail"
          type="email"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          placeholder="nume@domeniu.ro"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs text-zinc-400">Telefon</label>
        <input
          name="contactPhone"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          placeholder="+40…"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Se trimite…" : "Solicită ofertă"}
      </button>

      {ok === true && (
        <div className="text-xs text-emerald-400">Cererea a fost trimisă. Mulțumim!</div>
      )}
      {ok === false && <div className="text-xs text-red-400">{err}</div>}
    </form>
  );
}
