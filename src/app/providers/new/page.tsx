"use client";

import { useState } from "react";

export default function BecomeProviderPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      providerName: fd.get("providerName")?.toString() || "",
      city: fd.get("city")?.toString() || "",
      contactEmail: fd.get("contactEmail")?.toString() || "",
      contactPhone: fd.get("contactPhone")?.toString() || "",
    };

    try {
      const res = await fetch("/api/request-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || "Server error");
      setOk(true);
      e.currentTarget.reset();
    } catch (error: any) {
      setErr(error?.message || "Eroare");
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-zinc-100">Sunt artist / furnizor</h1>
      <p className="mt-1 text-zinc-400 text-sm">
        Completează formularul; verificăm rapid și îți creăm profilul. Vei primi
        acces la calendar, mesagerie și rezervări.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <div className="grid gap-2">
          <label className="text-xs text-zinc-400">Nume afișat</label>
          <input
            name="providerName"
            required
            placeholder="Ex.: DJ Alex / Verde Events"
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs text-zinc-400">Oraș</label>
          <input
            name="city"
            placeholder="București"
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-xs text-zinc-400">Email</label>
            <input
              name="contactEmail"
              type="email"
              placeholder="nume@domeniu.ro"
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-zinc-400">Telefon</label>
            <input
              name="contactPhone"
              placeholder="+40…"
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Se trimite…" : "Trimite cererea"}
        </button>

        {ok === true && (
          <div className="text-xs text-emerald-400">
            Cererea a fost trimisă. Te contactăm în curând.
          </div>
        )}
        {ok === false && <div className="text-xs text-red-400">{err}</div>}
      </form>
    </div>
  );
}
