//src/app/onboarding/provider/ProviderOnboardingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PersonaType = "PF" | "COMPANY";

// ✅ добавлена категория „Activități”
const CATEGORY_OPTIONS = [
  "DJ",
  "Foto",
  "Video",
  "Live",
  "MC",
  "Decor",
  "Lumini",
  "Săli",
  "Activități",
];
const COUNTRY_OPTIONS = ["România", "Franța", "Moldova", "Bulgaria", "UAE"];

export default function ProviderOnboardingForm() {
  const router = useRouter();

  const [type, setType] = useState<PersonaType>("PF");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]); // single-select

  // PF
  const [pfFirstName, setPfFirstName] = useState("");
  const [pfLastName, setPfLastName] = useState("");
  const [pfStageName, setPfStageName] = useState("");
  const [pfCity, setPfCity] = useState("");
  const [pfCountry, setPfCountry] = useState("România");
  const [pfEmail, setPfEmail] = useState("");
  const [pfIdDoc, setPfIdDoc] = useState<File | null>(null);

  // Company
  const [coName, setCoName] = useState("");
  const [coCUI, setCoCUI] = useState(""); // CUI/CIF
  const [coRegNo, setCoRegNo] = useState(""); // Nr. registru (опц.)
  const [coCity, setCoCity] = useState("");
  const [coCountry, setCoCountry] = useState("România");
  const [coEmail, setCoEmail] = useState("");
  const [coContact, setCoContact] = useState(""); // Persoană de contact
  const [coPhone, setCoPhone] = useState("");
  const [coDoc, setCoDoc] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function requiredOk(): boolean {
    if (type === "PF") {
      return !!(
        pfFirstName &&
        pfLastName &&
        pfStageName &&
        pfCity &&
        pfCountry &&
        pfEmail
      );
    }
    return !!(coName && coCUI && coCity && coCountry && coEmail);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requiredOk()) {
      setError("Completează câmpurile obligatorii.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("type", type);

      // ✅ шлём массив категорий (даже если выбрана одна)
      fd.append("categories[]", category);

      if (type === "PF") {
        fd.append("pfFirstName", pfFirstName);
        fd.append("pfLastName", pfLastName);
        fd.append("pfStageName", pfStageName);
        fd.append("pfCity", pfCity);
        fd.append("pfCountry", pfCountry);
        fd.append("pfEmail", pfEmail);
        if (pfIdDoc) fd.append("pfIdDoc", pfIdDoc);
      } else {
        fd.append("coName", coName);
        fd.append("coCUI", coCUI);
        fd.append("coRegNo", coRegNo);
        fd.append("coCity", coCity);
        fd.append("coCountry", coCountry);
        fd.append("coEmail", coEmail);
        fd.append("coContact", coContact);
        fd.append("coPhone", coPhone);
        if (coDoc) fd.append("coDoc", coDoc);
      }

      const res = await fetch("/api/onboarding/provider", {
        method: "POST",
        body: fd, // multipart/form-data
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Eroare la salvare.");
        return;
      }
      router.push("/profile");
    } catch (err) {
      console.error(err);
      setError("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-zinc-100">
      {/* Switch PF / Company */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("PF")}
          className={`rounded-full px-3 py-1.5 border ${
            type === "PF"
              ? "border-[var(--border-accent)] bg-white/10"
              : "border-white/10 bg-black/40 hover:bg-white/5"
          }`}
        >
          Persoană fizică (PF)
        </button>
        <button
          type="button"
          onClick={() => setType("COMPANY")}
          className={`rounded-full px-3 py-1.5 border ${
            type === "COMPANY"
              ? "border-[var(--border-accent)] bg-white/10"
              : "border-white/10 bg-black/40 hover:bg-white/5"
          }`}
        >
          Companie
        </button>

        <div className="ml-auto w-44">
          <label className="block text-xs text-zinc-400">
            Categorie principală
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PF section */}
      {type === "PF" && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400">Nume</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={pfLastName}
                onChange={(e) => setPfLastName(e.target.value)}
                placeholder="Popescu"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Prenume</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={pfFirstName}
                onChange={(e) => setPfFirstName(e.target.value)}
                placeholder="Ion"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Nume de scenă</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
              value={pfStageName}
              onChange={(e) => setPfStageName(e.target.value)}
              placeholder="DJ Nova"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400">Oraș</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={pfCity}
                onChange={(e) => setPfCity(e.target.value)}
                placeholder="București"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Țară</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={pfCountry}
                onChange={(e) => setPfCountry(e.target.value)}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
              value={pfEmail}
              onChange={(e) => setPfEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">
              Act de identitate (foto / PDF)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 file:mr-3 file:rounded-lg file:border file:border-white/10 file:bg-white/10 file:px-3 file:py-1.5"
              onChange={(e) => setPfIdDoc(e.currentTarget.files?.[0] ?? null)}
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Se păstrează doar pentru verificare internă.
            </p>
          </div>
        </div>
      )}

      {/* Company section */}
      {type === "COMPANY" && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-400">Denumire companie</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
              value={coName}
              onChange={(e) => setCoName(e.target.value)}
              placeholder="Luma Events SRL"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-400">CUI / CIF</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={coCUI}
                onChange={(e) => setCoCUI(e.target.value)}
                placeholder="RO12345678"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-400">
                Nr. Registrul Comerțului (opțional)
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={coRegNo}
                onChange={(e) => setCoRegNo(e.target.value)}
                placeholder="J40/0000/2025"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400">Oraș</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={coCity}
                onChange={(e) => setCoCity(e.target.value)}
                placeholder="București"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Țară</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={coCountry}
                onChange={(e) => setCoCountry(e.target.value)}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={coEmail}
                onChange={(e) => setCoEmail(e.target.value)}
                placeholder="office@company.ro"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Telefon (opțional)</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
                value={coPhone}
                onChange={(e) => setCoPhone(e.target.value)}
                placeholder="+40 7xx xxx xxx"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Persoană de contact</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2"
              value={coContact}
              onChange={(e) => setCoContact(e.target.value)}
              placeholder="Nume prenume"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">
              Acte companie (certificat / PDF)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 file:mr-3 file:rounded-lg file:border file:border-white/10 file:bg-white/10 file:px-3 file:py-1.5"
              onChange={(e) => setCoDoc(e.currentTarget.files?.[0] ?? null)}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? "Se salvează…" : "Creează profil"}
      </button>

      <p className="text-[11px] text-zinc-500">
        Prin trimitere, confirmi că documentele pot fi folosite doar pentru
        verificare KYC internă.
      </p>
    </form>
  );
}
