//src/app/settings/provider/ProviderPackagesForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

export type ProviderPackageDTO = {
  id?: string;
  title: string;
  description: string | null;
  price: number; // în bănuți
  currency: string;
  isPublic: boolean;
  sortOrder: number;

  imageUrl?: string | null;
  tag?: string | null;
  durationHours?: number | null;
  maxPeople?: number | null;
  isHighlight?: boolean;
};

type Props = {
  initial: ProviderPackageDTO[];
};

export default function ProviderPackagesForm({ initial }: Props) {
  const [items, setItems] = useState<ProviderPackageDTO[]>(initial);
  const [loadingId, setLoadingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ID'шники карточек, у которых показываем “Salvat ✓” 2 сек.
  const [savedPulse, setSavedPulse] = useState<Set<string>>(new Set());

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  function addNew() {
    const maxSort =
      items.length > 0 ? Math.max(...items.map((p) => p.sortOrder ?? 0)) : 0;

    setItems((prev) => [
      ...prev,
      {
        id: undefined,
        title: "",
        description: "",
        price: 0,
        currency: "EUR",
        isPublic: true,
        sortOrder: maxSort + 1,
        imageUrl: null,
        tag: "",
        durationHours: null,
        maxPeople: null,
        isHighlight: false,
      },
    ]);
  }

  function updateItem(idx: number, patch: Partial<ProviderPackageDTO>) {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function pkgKey(pkg: ProviderPackageDTO, idx: number) {
    return pkg.id ?? `new-${idx}`;
  }

  function markSaved(key: string) {
    setSavedPulse((prev) => new Set(prev).add(key));
    // убрать бейдж через 2 сек.
    setTimeout(() => {
      setSavedPulse((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 2000);
  }

  async function handleImageChange(
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const pkg = items[idx];
    const key = pkgKey(pkg, idx);
    setError(null);
    setLoadingId(pkg.id ?? "new");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload/package-image", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Nu am putut încărca imaginea pentru pachet");
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        throw new Error("Răspuns invalid de la upload");
      }

      updateItem(idx, { imageUrl: data.url });
      markSaved(key);
    } catch (e: any) {
      setError(e.message || "Eroare la upload imagine pachet");
    } finally {
      setLoadingId(null);
    }
  }

  async function saveItem(idx: number) {
    const pkg = items[idx];
    const key = pkgKey(pkg, idx);
    setError(null);
    setLoadingId(pkg.id ?? "new");

    try {
      const payload = {
        id: pkg.id,
        title: pkg.title.trim(),
        description: (pkg.description ?? "").trim() || null,
        price: Number(pkg.price) || 0,
        currency: pkg.currency || "EUR",
        isPublic: pkg.isPublic,
        sortOrder: pkg.sortOrder ?? idx,
        imageUrl: pkg.imageUrl || null,
        tag: (pkg.tag ?? "").trim() || null,
        durationHours: pkg.durationHours || null,
        maxPeople: pkg.maxPeople || null,
        isHighlight: Boolean(pkg.isHighlight),
      };

      if (!payload.title || !payload.price) {
        throw new Error("Titlu și preț sunt obligatorii");
      }

      const res = await fetch("/api/provider/packages", {
        method: pkg.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare la salvarea pachetului");
      }

      const data = await res.json();
      const saved = (data.package ||
        data.pkg ||
        data) as ProviderPackageDTO & { id: string };

      setItems((prev) => {
        const next = [...prev];
        next[idx] = {
          id: saved.id,
          title: saved.title,
          description: saved.description ?? null,
          price: saved.price,
          currency: saved.currency,
          isPublic: saved.isPublic,
          sortOrder: saved.sortOrder,
          imageUrl: saved.imageUrl ?? null,
          tag: saved.tag ?? null,
          durationHours: saved.durationHours ?? null,
          maxPeople: saved.maxPeople ?? null,
          isHighlight: saved.isHighlight ?? false,
        };
        return next;
      });

      // визуальный фидбек «сохранено»
      markSaved(key);
    } catch (e: any) {
      setError(e.message || "Eroare la salvare");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteItem(idx: number) {
    const pkg = items[idx];
    setError(null);

    setItems((prev) => prev.filter((_, i) => i !== idx));

    if (!pkg.id) return;

    try {
      setLoadingId(pkg.id);
      const res = await fetch("/api/provider/packages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare la ștergere");
      }
    } catch (e: any) {
      setError(e.message || "Eroare la ștergere");
    } finally {
      setLoadingId(null);
    }
  }

  const hasItems = items.length > 0;

  return (
    <div
      className="
        mt-8 space-y-4 rounded-[26px]
        border border-[#16302B]
        bg-[radial-gradient(circle_at_0%_0%,rgba(12,60,45,0.7),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(163,133,96,0.42),transparent_60%),#020806]
        px-4 py-5 md:px-6 md:py-6
        shadow-[0_32px_140px_rgba(0,0,0,0.95)]
      "
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-400 ring-1 ring-[#264437]">
            <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
            Pachete & prețuri
          </div>
          <p className="mt-2 text-[13px] font-medium text-zinc-50">
            Creează 2–5 pachete clare, ca într-un meniu premium.
          </p>
          <p className="text-[11px] text-zinc-400">
            Standard, Premium, All-inclusive – astfel clientul înțelege rapid
            „range-ul” tău.
          </p>
        </div>

        <button
          type="button"
          onClick={addNew}
          className="
            shrink-0 rounded-full bg-[var(--accent)]
            px-4 py-2 text-[12px] font-semibold text-black
            shadow-[0_0_0_1px_rgba(0,0,0,0.6)]
            hover:brightness-110
          "
        >
          Adaugă pachet
        </button>
      </div>

      {!hasItems && (
        <p className="pt-2 text-[11px] text-zinc-500">
          Încă nu ai niciun pachet. Începe cu un pachet standard (4–5 ore,
          echipament inclus) și unul premium.
        </p>
      )}

      {hasItems && (
        <div className="mt-2 space-y-4">
          {items.map((pkg, idx) => {
            const key = pkgKey(pkg, idx);
            const loading = loadingId === (pkg.id ?? "new");
            const justSaved = savedPulse.has(key);

            return (
              <div
                key={key}
                className="
                  relative space-y-3 rounded-2xl border border-[#1b352b]
                  bg-black/75 px-4 py-4 md:px-5 md:py-5
                  text-xs shadow-[0_22px_90px_rgba(0,0,0,0.9)]
                "
              >
                {/* бейдж «Salvat ✓» */}
                {justSaved && (
                  <div className="absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-600/30">
                    Salvat ✓
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <span className="text-[10px] text-zinc-500">
                      Pachet #{idx + 1}
                    </span>
                    {pkg.isHighlight && (
                      <span className="rounded-full bg-[var(--accent)]/10 px-2 py-[2px] text-[10px] font-semibold text-[var(--accent)]">
                        Recomandat
                      </span>
                    )}
                  </div>
                  {pkg.tag && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-200">
                      {pkg.tag}
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-[1.05fr,1.9fr]">
                  {/* IMAGE + META */}
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl border border-[#244034] bg-black/70">
                      <div className="aspect-[16/9] w-full">
                        {pkg.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={pkg.imageUrl}
                            alt={pkg.title || "Imagine pachet"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-[11px] text-zinc-500">
                            <span>Fără imagine încă</span>
                            <span className="text-[10px] text-zinc-600">
                              Recomandat: 1200×675
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#244034] bg-black/75 px-3 py-1.5 text-[11px] font-medium text-zinc-100 hover:border-[var(--accent)]/80">
                      <span>
                        {loading ? "Se încarcă..." : "Încarcă imagine pachet"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(idx, e)}
                        disabled={loading}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500">
                          Tag (badge)
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl border border-[#244034] bg-black/70 px-3 py-1.5 text-[11px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                          value={pkg.tag ?? ""}
                          onChange={(e) =>
                            updateItem(idx, { tag: e.target.value })
                          }
                          placeholder="ex: Nuntă, Corporate"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-500">
                            Ore
                          </label>
                          <input
                            type="number"
                            className="mt-1 w-full rounded-xl border border-[#244034] bg-black/70 px-3 py-1.5 text-[11px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                            value={pkg.durationHours ?? ""}
                            onChange={(e) =>
                              updateItem(idx, {
                                durationHours: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                            placeholder="ex: 4"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500">
                            Persoane
                          </label>
                          <input
                            type="number"
                            className="mt-1 w-full rounded-xl border border-[#244034] bg-black/70 px-3 py-1.5 text-[11px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                            value={pkg.maxPeople ?? ""}
                            onChange={(e) =>
                              updateItem(idx, {
                                maxPeople: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                            placeholder="ex: 150"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MAIN INFO */}
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                      <div>
                        <label className="block text-[11px] text-zinc-500">
                          Nume pachet
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl border border-[#244034] bg-black/70 px-3 py-1.5 text-[12px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                          value={pkg.title}
                          onChange={(e) =>
                            updateItem(idx, { title: e.target.value })
                          }
                          placeholder="Ex: Pachet DJ standard"
                        />
                      </div>
                      <div className="grid grid-cols-[1.2fr,0.8fr] gap-2">
                        <div>
                          <label className="block text-[11px] text-zinc-500">
                            Preț (EUR)
                          </label>
                          <input
                            type="number"
                            className="mt-1 w-full rounded-xl border border-[#244034] bg-black/70 px-3 py-1.5 text-[12px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                            value={pkg.price ? pkg.price / 100 : ""}
                            onChange={(e) =>
                              updateItem(idx, {
                                price: Math.round(
                                  Number(e.target.value || 0) * 100
                                ),
                              })
                            }
                            placeholder="ex: 900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-500">
                            Monedă
                          </label>
                          <input
                            className="mt-1 w-full rounded-xl border border-[#244034] bg-black/70 px-3 py-1.5 text-[12px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                            value={pkg.currency}
                            onChange={(e) =>
                              updateItem(idx, { currency: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-500">
                        Descriere scurtă
                      </label>
                      <textarea
                        className="mt-1 w-full rounded-2xl border border-[#244034] bg-black/70 px-3 py-2 text-[12px] text-zinc-100 outline-none focus:border-[var(--accent)]/80"
                        rows={3}
                        value={pkg.description ?? ""}
                        onChange={(e) =>
                          updateItem(idx, { description: e.target.value })
                        }
                        placeholder="Ce include concret pachetul: ore, echipament, transport, extra-uri."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-col gap-1">
                        <label className="inline-flex items-center gap-2 text-[11px] text-zinc-300">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-zinc-700 bg-black"
                            checked={pkg.isPublic}
                            onChange={(e) =>
                              updateItem(idx, { isPublic: e.target.checked })
                            }
                          />
                          <span>Afișează public pe profil</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-[11px] text-amber-300">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-zinc-700 bg-black"
                            checked={!!pkg.isHighlight}
                            onChange={(e) =>
                              updateItem(idx, { isHighlight: e.target.checked })
                            }
                          />
                          <span>Marchează drept „pachet recomandat”</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => deleteItem(idx)}
                          className="rounded-full px-3 py-1 text-[11px] text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
                          disabled={loading}
                        >
                          Șterge
                        </button>
                        <button
                          type="button"
                          onClick={() => saveItem(idx)}
                          className="rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.6)] hover:brightness-110 disabled:opacity-60"
                          disabled={loading}
                        >
                          {loading
                            ? "Se salvează..."
                            : savedPulse.has(key)
                            ? "Salvat ✓"
                            : "Salvează pachetul"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      <p className="pt-1 text-[11px] text-zinc-500">
        Prețurile afișate sunt orientative pentru clienți. Pentru oferte
        personalizate, veți discuta direct în chat.
      </p>
    </div>
  );
}
