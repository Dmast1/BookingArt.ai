"use client";

import { useState } from "react";

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <input
        {...rest}
        className="w-full rounded-xl bg-surface border border-line px-3 py-2 text-sm outline-none focus:border-accent/50"
      />
    </label>
  );
}

export default function LeadPage() {
  const [vLoading, setVLoading] = useState(false);
  const [pLoading, setPLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submitVenue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setVLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      venueName: String(fd.get("venueName") || ""),
      city: String(fd.get("city") || ""),
      contactEmail: String(fd.get("contactEmail") || ""),
      // ISO datetime (как мы тестировали)
      date: String(fd.get("date") || ""),
    };
    const res = await fetch("/api/request-venue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setMsg(res.ok ? "Заявка по площадке создана" : `Ошибка: ${json?.error || res.status}`);
    setVLoading(false);
  }

  async function submitProvider(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setPLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      providerName: String(fd.get("providerName") || ""),
      city: String(fd.get("city") || ""),
      contactEmail: String(fd.get("contactEmail") || ""),
      date: String(fd.get("date") || ""),
    };
    const res = await fetch("/api/request-provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setMsg(res.ok ? "Заявка по провайдеру создана" : `Ошибка: ${json?.error || res.status}`);
    setPLoading(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <h1 className="text-2xl font-semibold">Оставить заявку</h1>

      {msg && (
        <div className="rounded-xl border border-line bg-white/5 px-3 py-2 text-sm">{msg}</div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* VENUE */}
        <form onSubmit={submitVenue} className="space-y-3 rounded-2xl border border-line p-4 bg-surface">
          <div className="text-lg font-medium">Площадка (Venue)</div>
          <Field name="venueName" label="Название площадки" placeholder="Sala Allegro" required />
          <Field name="city" label="Город" placeholder="București" required />
          <Field name="contactEmail" label="Email" placeholder="you@example.com" type="email" required />
          <Field
            name="date"
            label="Дата (ISO)"
            placeholder="2025-11-20T20:00:00.000Z"
            required
          />
          <button
            disabled={vLoading}
            className="w-full rounded-xl bg-accent text-black font-medium py-2 disabled:opacity-60"
          >
            {vLoading ? "Отправка…" : "Отправить"}
          </button>
        </form>

        {/* PROVIDER */}
        <form onSubmit={submitProvider} className="space-y-3 rounded-2xl border border-line p-4 bg-surface">
          <div className="text-lg font-medium">Провайдер (Artist/Provider)</div>
          <Field name="providerName" label="Имя/название" placeholder="DJ Alex" required />
          <Field name="city" label="Город" placeholder="București" required />
          <Field name="contactEmail" label="Email" placeholder="you@example.com" type="email" required />
          <Field
            name="date"
            label="Дата (ISO)"
            placeholder="2025-11-20T20:00:00.000Z"
            required
          />
          <button
            disabled={pLoading}
            className="w-full rounded-xl bg-accent text-black font-medium py-2 disabled:opacity-60"
          >
            {pLoading ? "Отправка…" : "Отправить"}
          </button>
        </form>
      </div>
    </div>
  );
}
