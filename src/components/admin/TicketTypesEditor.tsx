"use client";

import { useState } from "react";

type TicketTypeRow = {
  id: string;
  name: string;
  price: number;   // în bani (ex. 10000 = 100.00)
  currency: string;
  total: number;
  sold: number;
};

type Props = {
  eventId: string;
  initialTypes: TicketTypeRow[];
};

export function TicketTypesEditor({ eventId, initialTypes }: Props) {
  const [types, setTypes] = useState<TicketTypeRow[]>(initialTypes);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newType, setNewType] = useState({
    name: "",
    priceInput: "",
    currency: "RON",
    totalInput: "",
  });

  function formatPrice(value: number) {
    return (value / 100).toFixed(2);
  }

  async function handleUpdate(row: TicketTypeRow) {
    setError(null);
    setLoadingId(row.id);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/tickets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          name: row.name,
          price: row.price,
          currency: row.currency,
          total: row.total,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Eroare la salvare");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Eroare la salvare");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Sigur vrei să ștergi acest tip de bilet?")) return;

    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/tickets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Eroare la ștergere");
      }

      setTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Eroare la ștergere");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCreate() {
    setError(null);

    if (!newType.name.trim()) {
      setError("Completează numele.");
      return;
    }

    const priceFloat = parseFloat(newType.priceInput.replace(",", "."));
    if (!Number.isFinite(priceFloat) || priceFloat <= 0) {
      setError("Preț invalid.");
      return;
    }
    const totalInt = parseInt(newType.totalInput, 10);
    if (!Number.isInteger(totalInt) || totalInt <= 0) {
      setError("Total bilete invalid.");
      return;
    }

    const priceBani = Math.round(priceFloat * 100);

    setLoadingId("new");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newType.name.trim(),
          price: priceBani,
          currency: newType.currency,
          total: totalInt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Eroare la creare");
      }

      const data = await res.json();
      const created = data.ticketType as {
        id: string;
        name: string;
        price: number;
        currency: string;
        total: number;
        sold: number;
      };

      setTypes((prev) => [...prev, created]);
      setNewType({
        name: "",
        priceInput: "",
        currency: newType.currency,
        totalInput: "",
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Eroare la creare");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">
          Tipuri de bilete
        </h2>
        {error && (
          <span className="text-[11px] text-red-400">{error}</span>
        )}
      </div>

      {/* Существующие типы */}
      {types.length === 0 ? (
        <p className="text-xs text-zinc-400">
          Nu există încă tipuri de bilete. Adaugă primul tip mai jos.
        </p>
      ) : (
        <div className="space-y-2">
          {types.map((t) => (
            <div
              key={t.id}
              className="grid gap-2 rounded-xl border border-line bg-bg/80 p-3 md:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_auto]"
            >
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Nume tip
                </label>
                <input
                  className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-zinc-100 outline-none"
                  value={t.name}
                  onChange={(e) =>
                    setTypes((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Preț
                </label>
                <div className="flex gap-1">
                  <input
                    className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-zinc-100 outline-none"
                    value={formatPrice(t.price)}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      const f = parseFloat(v);
                      setTypes((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? {
                                ...x,
                                price: Number.isFinite(f)
                                  ? Math.round(f * 100)
                                  : x.price,
                              }
                            : x
                        )
                      );
                    }}
                  />
                  <input
                    className="w-16 rounded-lg border border-line bg-surface px-1.5 py-1 text-xs text-zinc-100 outline-none"
                    value={t.currency}
                    onChange={(e) =>
                      setTypes((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? { ...x, currency: e.target.value.toUpperCase() }
                            : x
                        )
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Total bilete
                </label>
                <input
                  className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-zinc-100 outline-none"
                  type="number"
                  min={t.sold}
                  value={t.total}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setTypes((prev) =>
                      prev.map((x) =>
                        x.id === t.id && Number.isInteger(n)
                          ? { ...x, total: n }
                          : x
                      )
                    );
                  }}
                />
                <p className="text-[10px] text-zinc-500">
                  Vândute: {t.sold}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Disponibile
                </label>
                <p className="mt-1 text-sm text-emerald-300">
                  {Math.max(t.total - t.sold, 0)}
                </p>
              </div>

              <div className="flex flex-col gap-1 justify-end">
                <button
                  type="button"
                  onClick={() => handleUpdate(t)}
                  disabled={loadingId === t.id}
                  className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-semibold text-black hover:brightness-110 disabled:opacity-60"
                >
                  {loadingId === t.id ? "Se salvează…" : "Salvează"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  disabled={loadingId === t.id}
                  className="rounded-lg border border-red-500/50 bg-bg px-3 py-1.5 text-[11px] text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Новый тип */}
      <div className="mt-4 rounded-xl border border-dashed border-line bg-bg/60 p-3">
        <h3 className="text-xs font-semibold text-zinc-200">
          Adaugă tip nou de bilet
        </h3>
        <div className="mt-3 grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.6fr_auto]">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-zinc-500">
              Nume tip
            </label>
            <input
              className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-zinc-100 outline-none"
              placeholder="ex. General, VIP…"
              value={newType.name}
              onChange={(e) =>
                setNewType((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-zinc-500">
              Preț
            </label>
            <div className="flex gap-1">
              <input
                className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-zinc-100 outline-none"
                placeholder="ex. 120.00"
                value={newType.priceInput}
                onChange={(e) =>
                  setNewType((prev) => ({
                    ...prev,
                    priceInput: e.target.value,
                  }))
                }
              />
              <input
                className="w-16 rounded-lg border border-line bg-surface px-1.5 py-1 text-xs text-zinc-100 outline-none"
                value={newType.currency}
                onChange={(e) =>
                  setNewType((prev) => ({
                    ...prev,
                    currency: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-zinc-500">
              Total bilete
            </label>
            <input
              className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-zinc-100 outline-none"
              placeholder="ex. 200"
              value={newType.totalInput}
              onChange={(e) =>
                setNewType((prev) => ({
                  ...prev,
                  totalInput: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={loadingId === "new"}
              className="w-full rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-black hover:brightness-110 disabled:opacity-60"
            >
              {loadingId === "new" ? "Se adaugă…" : "Adaugă tip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
