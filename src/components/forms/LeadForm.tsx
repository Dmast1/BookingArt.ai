"use client";

import * as React from "react";
import { z } from "zod";
import { venueLeadSchema, providerLeadSchema } from "@/lib/validators";

type Mode = "venue" | "provider";

type Props = {
  mode: Mode; // "venue" | "provider"
  className?: string;
};

export default function LeadForm({ mode, className }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const isVenue = mode === "venue";
  const schema = isVenue ? venueLeadSchema : providerLeadSchema;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setErr(null);

    const formData = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(formData.entries());
    // trim
    Object.keys(payload).forEach(k => {
      if (typeof payload[k] === "string") payload[k] = payload[k].trim();
    });

    try {
      schema.parse(payload);
      const res = await fetch(isVenue ? "/api/request-venue" : "/api/request-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Request failed");

      setOk(true);
      (e.currentTarget as HTMLFormElement).reset();
    } catch (e: any) {
      setErr(e?.message ?? "Eroare");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className ?? "space-y-3"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">{isVenue ? "Numele sălii" : "Numele providerului"} *</span>
          <input
            required
            name={isVenue ? "venueName" : "providerName"}
            placeholder={isVenue ? "Ex: Sala Allegro" : "Ex: DJ Alex"}
            className="rounded-xl bg-surface border border-line px-3 py-2 outline-none focus:border-accent/50"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Oraș</span>
          <input name="city" placeholder="Ex: București" className="rounded-xl bg-surface border border-line px-3 py-2"/>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Țară</span>
          <input name="country" placeholder="Ex: România" className="rounded-xl bg-surface border border-line px-3 py-2"/>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Nume contact</span>
          <input name="contactName" placeholder="Nume" className="rounded-xl bg-surface border border-line px-3 py-2"/>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Email contact</span>
          <input type="email" name="contactEmail" placeholder="email@exemplu.ro" className="rounded-xl bg-surface border border-line px-3 py-2"/>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Telefon</span>
          <input name="contactPhone" placeholder="+40 ..." className="rounded-xl bg-surface border border-line px-3 py-2"/>
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-zinc-400">Mesaj</span>
        <textarea name="message" rows={4} placeholder="Detalii (opțional)"
          className="rounded-xl bg-surface border border-line px-3 py-2 resize-none"/>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={loading}
          className="rounded-xl bg-accent text-black font-medium px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Se trimite..." : "Trimite"}
        </button>
        {ok && <span className="text-sm text-emerald-400">Trimis. Revenim în scurt timp.</span>}
        {err && <span className="text-sm text-red-400">{err}</span>}
      </div>
    </form>
  );
}
