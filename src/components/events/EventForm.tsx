// src/components/events/EventForm.tsx
"use client";

import { useState } from "react";

type TicketInput = {
  name: string;
  price: string;   // в RON/EUR (например "150")
  currency: string;
  total: string;   // количество (например "100")
};

type Props = {
  providerId: string | null;
};

export function EventForm({ providerId }: Props) {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tickets, setTickets] = useState<TicketInput[]>([
    { name: "General", price: "", currency: "RON", total: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateTicket(index: number, patch: Partial<TicketInput>) {
    setTickets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  }

  function addTicketRow() {
    setTickets((prev) => [
      ...prev,
      { name: "", price: "", currency: "RON", total: "" },
    ]);
  }

  function removeTicketRow(index: number) {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !city.trim() || !date) {
      setError("Completează titlul, orașul și data.");
      return;
    }

    if (!providerId) {
      setError("Nu am putut identifica providerul pentru acest cont.");
      return;
    }

    const dtString = time ? `${date}T${time}:00` : `${date}T20:00:00`;
    const eventDate = new Date(dtString);

    const preparedTickets = tickets
      .map((t) => ({
        ...t,
        priceInt: Number(t.price.replace(",", ".") || "0"),
        totalInt: Number(t.total || "0"),
      }))
      .filter((t) => t.name.trim() && t.priceInt > 0 && t.totalInt > 0)
      .map((t) => ({
        name: t.name.trim(),
        currency: t.currency || "RON",
        price: Math.round(t.priceInt * 100), // в бань/центах
        total: t.totalInt,
      }));

    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          city: city.trim(),
          date: eventDate.toISOString(),
          image: image.trim() || null,
          status,
          providerId,
          tickets: preparedTickets,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Eroare la crearea evenimentului.");
      }

      const data = await res.json();
      setSuccess("Eveniment creat cu succes.");
      setTitle("");
      setCity("");
      setDate("");
      setTime("");
      setImage("");
      setStatus("draft");
      setTickets([{ name: "General", price: "", currency: "RON", total: "" }]);

      if (data?.slug) {
        // можно сразу перейти на страницу события
        window.location.href = `/events/${data.slug}`;
      }
    } catch (e: any) {
      setError(e.message || "Eroare la crearea evenimentului.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          {success}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs text-zinc-400">Titlu eveniment</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
            placeholder="Ex: Concert Live Band"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-zinc-400">Oraș</span>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
            placeholder="București"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs text-zinc-400">Data</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-zinc-400">Ora (opțional)</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-zinc-400">Status</span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "published")
            }
            className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
          >
            <option value="draft">Draft (nu este încă public)</option>
            <option value="published">Publicat</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-xs text-zinc-400">
          Imagine (URL, opțional)
        </span>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
          placeholder="https://…"
        />
      </label>

      <div className="mt-4 rounded-2xl border border-line bg-bg/70 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Tipuri de bilete
          </h3>
          <button
            type="button"
            onClick={addTicketRow}
            className="text-xs text-accent hover:underline"
          >
            + Adaugă tip de bilet
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {tickets.map((t, idx) => (
            <div
              key={idx}
              className="grid gap-2 rounded-xl border border-line bg-black/20 p-2 md:grid-cols-[2fr_1.1fr_1fr_auto]"
            >
              <input
                type="text"
                placeholder="Nume (ex: General, VIP)"
                value={t.name}
                onChange={(e) => updateTicket(idx, { name: e.target.value })}
                className="rounded-lg border border-line bg-bg px-2 py-1 text-xs text-zinc-100 outline-none"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Preț (ex: 150)"
                value={t.price}
                onChange={(e) => updateTicket(idx, { price: e.target.value })}
                className="rounded-lg border border-line bg-bg px-2 py-1 text-xs text-zinc-100 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={t.currency}
                  onChange={(e) =>
                    updateTicket(idx, { currency: e.target.value })
                  }
                  className="rounded-lg border border-line bg-bg px-2 py-1 text-xs text-zinc-100 outline-none"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Total bilete"
                  value={t.total}
                  onChange={(e) => updateTicket(idx, { total: e.target.value })}
                  className="rounded-lg border border-line bg-bg px-2 py-1 text-xs text-zinc-100 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTicketRow(idx)}
                className="self-center text-[11px] text-zinc-500 hover:text-red-400"
              >
                Șterge
              </button>
            </div>
          ))}
        </div>

        <p className="mt-2 text-[11px] text-zinc-500">
          Poți lăsa toate câmpurile goale dacă vrei doar să publici evenimentul
          ca afiș informativ, fără vânzare de bilete prin BookingArt.ai.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-3 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Se salvează…" : "Creează eveniment"}
      </button>
    </form>
  );
}
