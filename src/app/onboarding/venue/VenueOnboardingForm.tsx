//src/app/onboarding/venue/VenueOnboardingForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT_BASE =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/60";

export default function VenueOnboardingForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [venueType, setVenueType] = useState("hall");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("RO");
  const [address, setAddress] = useState("");
  const [capacityMin, setCapacityMin] = useState("");
  const [capacityMax, setCapacityMax] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !city.trim() || !address.trim()) {
      setError("Completează numele locației, orașul și adresa completă.");
      return;
    }

    if (capacityMin && capacityMax) {
      const min = Number(capacityMin);
      const max = Number(capacityMax);
      if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
        setError("Capacitatea maximă trebuie să fie mai mare decât minimă.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/venue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          venueType,
          city: city.trim(),
          country: country.trim() || "RO",
          address: address.trim(),
          capacityMin: capacityMin ? Number(capacityMin) : null,
          capacityMax: capacityMax ? Number(capacityMax) : null,
          priceFrom: priceFrom ? Number(priceFrom) : null,
          priceTo: priceTo ? Number(priceTo) : null,
          website: website.trim() || null,
          contactEmail: contactEmail.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Eroare la salvare.");
        return;
      }

      // после регистрации venue — куда ведём
      router.push("/venues"); // или "/dashboard"
    } catch (err) {
      console.error(err);
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-zinc-100">
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-400">
          Nume locație / companie
        </label>
        <input
          className={INPUT_BASE}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aurora Hall, Grand Hotel…"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Tip locație
          </label>
          <select
            className={INPUT_BASE}
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
          >
            <option value="hall">Sală evenimente</option>
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="terrace">Terasa / rooftop</option>
            <option value="club">Club / lounge</option>
            <option value="corporate">Corporate / office</option>
            <option value="other">Alt tip de locație</option>
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Oraș</label>
            <input
              className={INPUT_BASE}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="București"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Țară</label>
            <input
              className={INPUT_BASE}
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              placeholder="RO"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-400">
          Adresă completă
        </label>
        <input
          className={INPUT_BASE}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Str. Exemplu 10, etaj 2, sector 1"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Capacitate minimă
          </label>
          <input
            type="number"
            className={INPUT_BASE}
            value={capacityMin}
            onChange={(e) => setCapacityMin(e.target.value)}
            placeholder="50"
            min={0}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Capacitate maximă
          </label>
          <input
            type="number"
            className={INPUT_BASE}
            value={capacityMax}
            onChange={(e) => setCapacityMax(e.target.value)}
            placeholder="300"
            min={0}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Buget de la (€/eveniment)
          </label>
          <input
            type="number"
            className={INPUT_BASE}
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            placeholder="1000"
            min={0}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Până la (€/eveniment)
          </label>
          <input
            type="number"
            className={INPUT_BASE}
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            placeholder="5000"
            min={0}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Website / link principal
          </label>
          <input
            className={INPUT_BASE}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://aurorahall.ro"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">
            Email de contact
          </label>
          <input
            type="email"
            className={INPUT_BASE}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="events@aurorahall.ro"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-400">
          Detalii scurte (opțional)
        </label>
        <textarea
          rows={3}
          className={`${INPUT_BASE} resize-none`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tipuri de evenimente, restricții oră muzică, parcare, cazare, etc."
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
        className="mt-3 w-full rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(0,0,0,0.65)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "Se salvează…" : "Creează locație"}
      </button>
    </form>
  );
}
