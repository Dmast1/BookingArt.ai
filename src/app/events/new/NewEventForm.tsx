"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type TicketDraft = {
  name: string;
  price: number;    // cents
  currency: string;
  total: number;
};

export default function NewEventForm({
  isAdmin,
  defaultCity,
  defaultCurrency,
  myProviderId,
}: {
  isAdmin: boolean;
  defaultCity: string;
  defaultCurrency: string;
  myProviderId: string | null;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [city, setCity] = useState(defaultCity);
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState<"active" | "draft" | "cancelled">("active");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [providerId, setProviderId] = useState<string>(myProviderId ?? "");
  const [coverUrl, setCoverUrl] = useState<string>("");

  const [tickets, setTickets] = useState<TicketDraft[]>([
    { name: "General", price: 0, currency: defaultCurrency, total: 0 },
  ]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/event-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload eșuat");
      const data = await res.json();
      if (!data?.url) throw new Error("Răspuns invalid la upload");
      setCoverUrl(data.url);
    } catch (e: any) {
      setError(e.message || "Eroare upload");
    } finally {
      setUploading(false);
    }
  }

  function addTicket() {
    setTickets((t) => [...t, { name: "", price: 0, currency, total: 0 }]);
  }
  function updateTicket(i: number, patch: Partial<TicketDraft>) {
    setTickets((t) => {
      const next = [...t];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }
  function removeTicket(i: number) {
    setTickets((t) => t.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        city: city.trim(),
        dateTime,
        image: coverUrl || null,
        priceFrom: priceFrom === "" ? null : Number(priceFrom),
        currency,
        status,
        providerId: isAdmin ? providerId || null : null, // сервер сам возьмет моего провайдера
        tickets: tickets
          .filter((t) => t.name.trim())
          .map((t) => ({
            name: t.name.trim(),
            price: Number(t.price || 0),
            currency: t.currency || currency,
            total: Number(t.total || 0),
          })),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare la salvare");
      }
      setSaved(true);
      // перейти к моим событиям
      router.push("/events/mine");
    } catch (e: any) {
      setError(e.message || "Eroare");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-zinc-900/80 bg-black/75 p-5 text-sm shadow-[0_22px_100px_rgba(0,0,0,0.9)]">
      {isAdmin && (
        <div className="mb-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-50">
          Admin: poți seta Provider ID sau lăsa gol.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <label className="grid gap-1 text-sm">
          <span className="text-xs text-zinc-400">Titlu eveniment</span>
          <input className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                 value={title} onChange={(e)=>setTitle(e.target.value)} required />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-xs text-zinc-400">Oraș</span>
          <input className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                 value={city} onChange={(e)=>setCity(e.target.value)} required />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-xs text-zinc-400">Data & ora</span>
        <input type="datetime-local" className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
               value={dateTime} onChange={(e)=>setDateTime(e.target.value)} required />
      </label>

      {/* Cover upload */}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <div>
          <span className="text-xs text-zinc-400">Imagine copertă (upload)</span>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-black/70 px-3 py-2 text-sm text-zinc-100 hover:border-[var(--accent)]/70">
              {uploading ? "Se încarcă…" : "Încarcă imagine"}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} disabled={uploading}/>
            </label>
            {coverUrl && <span className="text-xs text-emerald-300">Încărcat ✅</span>}
          </div>
          {coverUrl && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="cover" className="aspect-[16/9] w-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-zinc-400">Preț de la (opțional, €)</span>
            <input type="number" min={0} className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                   value={priceFrom === "" ? "" : Number(priceFrom)} onChange={(e)=>setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))}/>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-zinc-400">Monedă</span>
            <input className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                   value={currency} onChange={(e)=>setCurrency(e.target.value)} />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-zinc-400">Status</span>
            <select className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                    value={status} onChange={(e)=>setStatus(e.target.value as any)}>
              <option value="active">Activ</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Anulat</option>
            </select>
          </label>

          {isAdmin && (
            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="text-xs text-zinc-400">Provider ID (opțional, doar admin)</span>
              <input className="h-10 w-full rounded-xl border border-zinc-800 bg-black/70 px-3 font-mono text-[11px] text-zinc-200 outline-none focus:border-[var(--accent)]/80"
                     value={providerId} onChange={(e)=>setProviderId(e.target.value)} placeholder="cuid() al providerului"/>
            </label>
          )}
        </div>
      </div>

      {/* Ticket types */}
      <div className="rounded-2xl border border-zinc-800 bg-black/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-zinc-300">Tipuri de bilete</div>
          <button type="button" onClick={addTicket} className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-black">
            Adaugă tip bilet
          </button>
        </div>

        <div className="space-y-3">
          {tickets.map((t, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1.3fr_0.7fr_0.5fr_auto]">
              <input
                className="h-9 rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100"
                placeholder="Ex: Early Bird"
                value={t.name}
                onChange={(e)=>updateTicket(i, { name: e.target.value })}
              />
              <input
                type="number"
                className="h-9 rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100"
                placeholder="Preț (€)"
                value={t.price ? t.price/100 : ""}
                onChange={(e)=>updateTicket(i, { price: Math.round(Number(e.target.value||0)*100) })}
              />
              <input
                className="h-9 rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100"
                value={t.currency}
                onChange={(e)=>updateTicket(i, { currency: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="h-9 w-24 rounded-xl border border-zinc-800 bg-black/70 px-3 text-sm text-zinc-100"
                  placeholder="Total"
                  value={t.total}
                  onChange={(e)=>updateTicket(i, { total: Number(e.target.value||0) })}
                />
                <button type="button" onClick={()=>removeTicket(i)} className="rounded-full px-2 text-xs text-zinc-400 hover:text-red-300">
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60">
          {saving ? "Se salvează…" : "Salvează evenimentul"}
        </button>
        <a href="/events/mine" className="rounded-xl border border-zinc-800 bg-black/70 px-4 py-2.5 text-sm text-zinc-200 hover:border-[var(--accent)]/70 hover:text-[var(--accent)]">
          Anulează
        </a>
        {saved && <span className="text-xs text-emerald-400">Salvat ✅</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </form>
  );
}
