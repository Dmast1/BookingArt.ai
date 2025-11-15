"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  defaultName: string;
  defaultEmail: string;
  defaultCity: string;
};

export default function ClientOnboardingForm({
  defaultName,
  defaultEmail,
  defaultCity,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [city, setCity] = useState(defaultCity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, city }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Eroare la salvarea profilului.");
        return;
      }
      router.push("/"); // или /search
    } catch (e) {
      console.error(e);
      setError("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-zinc-100">
      <div>
        <label className="text-xs text-zinc-400">Nume</label>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Numele tău"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400">Email (pentru notificări)</label>
        <input
          type="email"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400">Oraș</label>
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 outline-none"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="București"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? "Se salvează…" : "Continuă"}
      </button>
    </form>
  );
}
