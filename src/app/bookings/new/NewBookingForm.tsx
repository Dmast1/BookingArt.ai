"use client";

import React, { useState } from "react";

type Props = {
  provider: {
    id: string;
    displayName: string;
  };
  dateIso: string;
};

type FormState = {
  timeFrom: string;
  timeTo: string;
  eventType: string;
  guests: string;
  location: string;
  budget: string;
  notes: string;
};

export default function NewBookingForm({ provider, dateIso }: Props) {
  const [form, setForm] = useState<FormState>({
    timeFrom: "18:00",
    timeTo: "02:00",
    eventType: "",
    guests: "",
    location: "",
    budget: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/bookings/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          date: dateIso,
          ...form,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Eroare la trimiterea cererii de rezervare"
        );
      }

      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Eroare neașteptată");
    } finally {
      setLoading(false);
    }
  }

  const dateLabel = new Date(dateIso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-line bg-surface/80 p-4 md:p-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-100">
            Detalii eveniment
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Completează câteva informații esențiale pentru ca{" "}
            <span className="font-medium text-zinc-100">
              {provider.displayName}
            </span>{" "}
            să poată evalua cererea ta pentru{" "}
            <span className="text-zinc-50">{dateLabel}</span>.
          </p>
        </div>
      </div>

      {/* Time */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Interval orar (de la)
          </label>
          <input
            type="time"
            value={form.timeFrom}
            onChange={(e) => updateField("timeFrom", e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Interval orar (până la)
          </label>
          <input
            type="time"
            value={form.timeTo}
            onChange={(e) => updateField("timeTo", e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>
      </div>

      {/* Event basics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-400">
            Tip eveniment
          </label>
          <input
            value={form.eventType}
            onChange={(e) => updateField("eventType", e.target.value)}
            placeholder="Ex: nuntă, botez, corporate, aniversare..."
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Nr. aproximativ de invitați
          </label>
          <input
            value={form.guests}
            onChange={(e) => updateField("guests", e.target.value)}
            placeholder="Ex: 80-120"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>
      </div>

      {/* Location + budget */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Locația evenimentului
          </label>
          <input
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Oraș, sală, adresă (dacă știi deja)"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Buget estimativ pentru acest provider
          </label>
          <input
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            placeholder="Ex: 800–1200 €"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-zinc-400">
          Detalii suplimentare / preferințe
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Ex: gen muzical preferat, restricții, program exact, cerințe tehnice..."
          className="mt-1 min-h-[110px] w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
        />
      </div>

      {/* footer */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Se trimite cererea..." : "Trimite cererea de rezervare"}
        </button>
        {saved && (
          <span className="text-xs text-emerald-400">
            Cererea ta a fost trimisă ✅ Vei primi răspuns în cont și pe email.
          </span>
        )}
        {error && (
          <span className="text-xs text-red-400">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}