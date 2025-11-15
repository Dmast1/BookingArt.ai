// src/components/activities/ActivityForm.tsx
"use client";

import { useState } from "react";

type ActivityInitial = {
  id?: string;
  title?: string;
  city?: string;
  shortDesc?: string;
  priceFrom?: number | null; // в центах
  currency?: string;
  thumbnail?: string | null;
};

export default function ActivityForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: ActivityInitial;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [priceFrom, setPriceFrom] = useState<string>(
    initial?.priceFrom ? String(initial.priceFrom / 100) : ""
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");
  const [thumb, setThumb] = useState<string | null>(initial?.thumbnail ?? null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isCreate = mode === "create";

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload/activity-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error("Eșec la upload imagine");
      setThumb(data.url);
    } catch (e: any) {
      setErr(e.message || "Nu am putut încărca imaginea");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(false);
    setErr(null);
    try {
      const payload = {
        title,
        city,
        shortDesc,
        priceFrom: priceFrom ? Math.round(Number(priceFrom) * 100) : null,
        currency,
        thumbnail: thumb,
      };

      const body = initial?.id ? { id: initial.id, ...payload } : payload;

      const res = await fetch("/api/provider/activities", {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Eșec salvare activitate");
      }

      setOk(true);
      if (isCreate) {
        window.location.href = "/provider/activities";
      }
    } catch (e: any) {
      setErr(e.message || "A apărut o eroare la salvare");
    } finally {
      setSaving(false);
    }
  }

  const disabled = saving || uploading;

  return (
    <form
      onSubmit={onSubmit}
      className="
        space-y-4
        rounded-[24px]
        border border-[var(--border-subtle)]
        bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.08),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.96),rgba(3,17,13,0.98))]
        px-4 py-4 md:px-6 md:py-5
        shadow-[0_26px_90px_rgba(0,0,0,1)]
      "
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {isCreate ? "Adaugă activitate" : "Editează activitatea"}
          </p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--text-main)] md:text-base">
            Detalii principale
          </h2>
        </div>
        <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {currency || "EUR"}
        </span>
      </div>

      {/* basic info */}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Titlu activitate" hint="Cum va apărea în listă">
          <input
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-3 text-[13px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: Plimbare cu yachtul la apus"
          />
        </Field>

        <Field label="Oraș" hint="Unde are loc activitatea">
          <input
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-3 text-[13px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)]"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Ex: Constanța"
          />
        </Field>
      </div>

      <Field label="Descriere scurtă" hint="1–2 fraze, ce primește clientul">
        <textarea
          className="min-h-[90px] rounded-xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-3 py-2 text-[13px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)]"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          placeholder="Ex: Croazieră de 2 ore cu băuturi incluse și sesiune foto la apus."
        />
      </Field>

      {/* price / currency */}
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <Field label="Preț de la" hint="Valoare orientativă, per persoană sau pachet">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              className="h-10 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-3 text-[13px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)]"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="Ex: 120"
            />
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
              {currency || "EUR"}
            </span>
          </div>
        </Field>

        <Field label="Monedă" hint="De ex. EUR, RON">
          <input
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-3 text-[13px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)]"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
            placeholder="EUR"
          />
        </Field>
      </div>

      {/* thumbnail upload */}
      <div className="mt-2 space-y-2">
        <p className="text-xs font-medium text-[var(--text-main)]">
          Imagine cover / thumbnail
        </p>
        <p className="text-[11px] text-[var(--text-muted)]">
          Recomandat 1600×900px, se va afișa în listă și pe pagina activității.
        </p>

        <label
          className={`
            group relative mt-1 flex cursor-pointer items-center gap-3 overflow-hidden
            rounded-2xl border border-dashed border-[var(--border-subtle)]
            bg-[rgba(3,17,13,0.92)] px-3 py-3
            transition-colors duration-200
            hover:border-[var(--border-accent)]
          `}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-black/60 text-[var(--text-muted)] group-hover:text-[var(--accent)]">
            📷
          </div>
          <div className="flex-1 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text-main)]">
                {uploading ? "Se încarcă imaginea…" : "Încarcă sau schimbă imaginea"}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              Click pentru a alege un fișier din calculator.
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>

        {thumb && (
          <div className="mt-2 flex items-center gap-3">
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt="Preview thumbnail"
                className="h-20 w-32 object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setThumb(null)}
              className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--accent)]"
            >
              Elimină imaginea
            </button>
          </div>
        )}
      </div>

      {/* status */}
      {err && <div className="text-[11px] text-red-400">{err}</div>}
      {ok && !saving && (
        <div className="text-[11px] text-emerald-400">Salvat ✅</div>
      )}

      {/* actions */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-[var(--text-muted)]">
          Poți modifica detaliile ulterior din lista de activități.
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="
            inline-flex items-center justify-center
            rounded-full bg-[var(--accent)]
            px-4 py-2
            text-sm font-semibold text-[#1b1207]
            shadow-[0_16px_40px_rgba(0,0,0,0.9)]
            disabled:cursor-not-allowed disabled:opacity-70
          "
        >
          {saving ? "Se salvează…" : isCreate ? "Publică activitatea" : "Salvează modificările"}
        </button>
      </div>
    </form>
  );
}

/* small helper component для полей */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-medium text-[var(--text-main)]">
        {label}
      </span>
      {hint && (
        <span className="text-[11px] text-[var(--text-muted)]">{hint}</span>
      )}
      {children}
    </label>
  );
}
