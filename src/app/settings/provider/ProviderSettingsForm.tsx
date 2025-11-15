// src/app/settings/provider/ProviderSettingsForm.tsx
"use client";

import React, { useState } from "react";

export type ProviderFormInitial = {
  displayName: string;
  city: string;
  country: string;
  categories: string[]; // read-only отображение
  bio: string;
  youtubeUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  avatarUrl?: string | null;
};

export default function ProviderSettingsForm({ initial }: { initial: ProviderFormInitial }) {
  const [form, setForm] = useState<ProviderFormInitial>({
    ...initial,
    avatarUrl: initial.avatarUrl ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function updateField<K extends keyof ProviderFormInitial>(key: K, value: ProviderFormInitial[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Базовые проверки (часто именно они роняют аплоад на бэке)
    if (!file.type.startsWith("image/")) {
      setAvatarError("Încarcă o imagine (PNG/JPG/WebP).");
      return;
    }
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      setAvatarError(`Imagine prea mare (> ${MAX_MB}MB).`);
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);
    setSaved(false);

    try {
      const fd = new FormData();
      fd.append("file", file); // важно: ключ именно "file"

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        // Попробуем вытащить текст ошибки с бэка, чтобы понять причину
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Nu am putut încărca imaginea");
      }

      const data = (await res.json()) as { url?: string };
      if (!data?.url) throw new Error("Răspuns invalid de la upload");

      // мгновенный превью по возвращённому URL
      updateField("avatarUrl", data.url);
    } catch (err: any) {
      setAvatarError(err?.message || "Eroare upload");
    } finally {
      setAvatarUploading(false);
      // сброс инпута, чтобы можно было выбрать тот же файл повторно
      e.currentTarget.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/settings/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // категории не отправляем на изменение — они фиксируются при онбординге
          categories: initial.categories,
          avatarUrl: form.avatarUrl || null,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Eroare la salvare");
      }
      setSaved(true);
    } catch (err: any) {
      setError(err?.message || "Eroare neașteptată");
    } finally {
      setLoading(false);
    }
  }

  const avatarInitials = (form.displayName || "PR").slice(0, 2).toUpperCase();

  return (
    <form
      onSubmit={onSubmit}
      className="
        mt-6 space-y-7 rounded-[26px] border border-[#16302B]
        bg-[radial-gradient(circle_at_0%_0%,rgba(12,60,45,0.85),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(163,133,96,0.55),transparent_60%),#020806]
        px-4 py-5 md:px-6 md:py-6 shadow-[0_34px_130px_rgba(0,0,0,0.95)]
      "
    >
      {/* HERO */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-[22px] border border-[#2a463a] bg-black/70 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatarUrl} alt={form.displayName || "Avatar provider"} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-xl font-semibold text-zinc-100">
                {avatarInitials}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-200/80 ring-1 ring-emerald-500/40">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              Profil public provider
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400">Nume / denumire artist</label>
              <input
                className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-[var(--accent)]/80"
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="Ex: DJ Andrei, Trupa X, Sala Y..."
              />
            </div>
            <p className="text-[11px] text-zinc-500">Așa vei apărea în rezultate și pe pagina ta publică.</p>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="text-[11px] text-zinc-400">Oraș</span>
              <input
                className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-[var(--accent)]/80"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="București, Cluj..."
              />
            </label>
            <label>
              <span className="text-[11px] text-zinc-400">Țară</span>
              <input
                className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-[var(--accent)]/80"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="RO"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#2a463a] bg-black/70 px-3 py-1.5 text-[11px] font-medium text-zinc-100 hover:border-[var(--accent)]/70">
              <span>{avatarUploading ? "Se încarcă…" : "Schimbă avatarul"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
            </label>
            <span className="text-[10px] text-zinc-500">min. 400×400, ≤5MB</span>
          </div>
          {avatarError && <p className="text-[11px] text-red-400">{avatarError}</p>}
        </div>
      </div>

      {/* divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(163,133,96,0.5)] to-transparent opacity-70" />

      {/* READ-ONLY categorii (если нужно показать) */}
      {initial.categories?.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Categorii (setate la înregistrare)</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {initial.categories.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] text-zinc-200 ring-1 ring-[#1d3c33]">
                {c}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Modificarea categoriilor se face doar prin suport.</p>
        </div>
      )}

      {/* divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(163,133,96,0.5)] to-transparent opacity-70" />

      {/* BIO */}
      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Descriere scurtă</span>
        <p className="mt-1 text-[11px] text-zinc-500">Gen muzical, vibe, tipuri de evenimente, publicul tău ideal.</p>
        <textarea
          className="mt-2 min-h[140px] w-full resize-y rounded-2xl border border-[#16302B] bg-black/75 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-[var(--accent)]/80"
          value={form.bio}
          onChange={(e) => updateField("bio", e.target.value)}
          placeholder="Ex: DJ de club & evenimente private, specializat pe house / tech-house, disponibil pentru nunți premium și corporate."
        />
      </label>

      {/* divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(163,133,96,0.5)] to-transparent opacity-70" />

      {/* LINKS */}
      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Link-uri & Social</div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-[11px] text-zinc-400">YouTube</span>
            <input
              className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/75 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-[var(--accent)]/80"
              value={form.youtubeUrl}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </label>
          <label className="text-sm">
            <span className="text-[11px] text-zinc-400">Instagram</span>
            <input
              className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/75 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-[var(--accent)]/80"
              value={form.instagramUrl}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </label>
          <label className="text-sm">
            <span className="text-[11px] text-zinc-400">Facebook</span>
            <input
              className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/75 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-[var(--accent)]/80"
              value={form.facebookUrl}
              onChange={(e) => updateField("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </label>
          <label className="text-sm">
            <span className="text-[11px] text-zinc-400">Website</span>
            <input
              className="mt-1 w-full rounded-xl border border-[#16302B] bg-black/75 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-[var(--accent)]/80"
              value={form.websiteUrl}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.55)] hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Se salvează…" : "Salvează profilul public"}
        </button>
        {saved && <span className="text-xs text-emerald-400">Salvat ✅ Profilul a fost actualizat.</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </form>
  );
}
