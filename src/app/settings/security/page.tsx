// src/app/settings/security/page.tsx
"use client";

import { useState, FormEvent } from "react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirm) {
      setError("Parola nouă și confirmarea nu coincid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "A apărut o eroare.");
        return;
      }

      setSuccess("Parola a fost actualizată cu succes.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Nu s-a putut salva. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl pb-12 pt-4">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50">
          Securitate & parolă
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Actualizează parola contului tău. În viitor aici putem adăuga 2FA,
          sesiuni active, device-uri de încredere etc.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-surface/80 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Schimbă parola
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Pentru siguranță, îți cerem parola curentă înainte de a seta una
          nouă. Parola nouă trebuie să aibă cel puțin 8 caractere.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3 text-sm">
          <div className="grid gap-1">
            <label className="text-xs text-zinc-400">Parola curentă</label>
            <input
              type="password"
              autoComplete="current-password"
              className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <p className="text-[11px] text-zinc-500">
              Dacă nu ai avut parolă până acum (numai login cu SMS/Google), poți
              lăsa acest câmp gol.
            </p>
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-zinc-400">Parola nouă</label>
            <input
              type="password"
              autoComplete="new-password"
              className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minim 8 caractere"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-zinc-400">
              Confirmă parola nouă
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repetă parola nouă"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Se salvează…" : "Salvează parola nouă"}
          </button>
        </form>
      </div>
    </section>
  );
}