// src/app/provider/ProviderOnboardingForm.tsx
"use client";

import React, { useState } from "react";

type LegalType = "PF" | "COMPANY";

type FormState = {
  legalType: LegalType;

  // profil public
  displayName: string;
  city: string;
  country: string;
  categories: string[];
  bio: string;

  // contact
  email: string;
  phone: string;
  websiteUrl: string;

  // juridic – PF
  pfFullName: string;
  pfIdNumber: string;
  pfAddress: string;

  // juridic – Companie
  companyName: string;
  companyRegNumber: string;
  companyVatId: string;
  companyAddress: string;
  companyIban: string;
  companyBank: string;
  contactPerson: string;
};

export default function ProviderOnboardingForm({ email }: { email: string }) {
  const [form, setForm] = useState<FormState>({
    legalType: "COMPANY",

    displayName: "",
    city: "",
    country: "RO",
    categories: [],
    bio: "",

    email: email || "",
    phone: "",
    websiteUrl: "",

    pfFullName: "",
    pfIdNumber: "",
    pfAddress: "",

    companyName: "",
    companyRegNumber: "",
    companyVatId: "",
    companyAddress: "",
    companyIban: "",
    companyBank: "",
    contactPerson: "",
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onCategoriesChange(value: string) {
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    update("categories", parts);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      // backend minim: folosim același /api/settings/provider
      // vei putea extinde route-ul ca să salvezi și câmpurile juridice.
      const res = await fetch("/api/settings/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // câmpurile care deja există în provider settings
          displayName: form.displayName,
          city: form.city,
          country: form.country,
          categories: form.categories,
          bio: form.bio,
          websiteUrl: form.websiteUrl,

          // extra info juridică (PF / Companie) – le vei prelua în API
          legalType: form.legalType,
          email: form.email,
          phone: form.phone,

          pfFullName: form.pfFullName,
          pfIdNumber: form.pfIdNumber,
          pfAddress: form.pfAddress,

          companyName: form.companyName,
          companyRegNumber: form.companyRegNumber,
          companyVatId: form.companyVatId,
          companyAddress: form.companyAddress,
          companyIban: form.companyIban,
          companyBank: form.companyBank,
          contactPerson: form.contactPerson,
        }),
      });

      if (!res.ok) {
        throw new Error("Eroare la înregistrare. Încearcă din nou.");
      }

      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Eroare neașteptată");
    } finally {
      setLoading(false);
    }
  }

  const isCompany = form.legalType === "COMPANY";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-3xl border border-line bg-surface/80 p-4 md:p-6"
    >
      {/* tip entitate */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-100">
            Tip de înregistrare
          </div>
          <p className="text-xs text-zinc-400">
            Poți alege între Persoană Fizică (PF / PFA) sau Companie (SRL, SRL-D
            etc.).
          </p>
        </div>
        <div className="inline-flex gap-2 rounded-xl bg-black/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => update("legalType", "PF")}
            className={`rounded-lg px-3 py-1.5 ${
              !isCompany
                ? "bg-accent text-black"
                : "text-zinc-300 hover:bg-white/5"
            }`}
          >
            Persoană Fizică
          </button>
          <button
            type="button"
            onClick={() => update("legalType", "COMPANY")}
            className={`rounded-lg px-3 py-1.5 ${
              isCompany
                ? "bg-accent text-black"
                : "text-zinc-300 hover:bg-white/5"
            }`}
          >
            Companie
          </button>
        </div>
      </div>

      {/* profil public */}
      <div className="space-y-4 rounded-2xl border border-line bg-bg/60 p-4">
        <div className="text-sm font-medium text-zinc-100">
          Date profil public
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Nume / denumire afișată public
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            placeholder={isCompany ? "Ex: EventPro SRL" : "Ex: DJ Nova"}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Oraș
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="București, Cluj-Napoca..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Țară
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="RO"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Website (opțional)
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              value={form.websiteUrl}
              onChange={(e) => update("websiteUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Categorii (ex: DJ, Fotograf) – separate prin virgulă
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            value={form.categories.join(", ")}
            onChange={(e) => onCategoriesChange(e.target.value)}
            placeholder="DJ, Fotograf, Videograf"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Descriere scurtă (bio public)
          </label>
          <textarea
            className="mt-1 min-h-[120px] w-full resize-y rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Gen muzical, experiență, tipuri de evenimente, etc."
          />
        </div>
      </div>

      {/* contact */}
      <div className="space-y-4 rounded-2xl border border-line bg-bg/60 p-4">
        <div className="text-sm font-medium text-zinc-100">
          Date de contact
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Email pentru rezervări
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Telefon
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+40 ..."
            />
          </div>
        </div>
      </div>

      {/* date juridice */}
      <div className="space-y-4 rounded-2xl border border-line bg-bg/60 p-4">
        <div className="text-sm font-medium text-zinc-100">
          Date juridice {isCompany ? "(Companie)" : "(Persoană Fizică)"}
        </div>

        {isCompany ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  Denumire companie
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Ex: EventPro SRL"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  Nr. înregistrare (Reg. Com.)
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.companyRegNumber}
                  onChange={(e) =>
                    update("companyRegNumber", e.target.value)
                  }
                  placeholder="J00/0000/2025"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  CUI / CIF
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.companyVatId}
                  onChange={(e) => update("companyVatId", e.target.value)}
                  placeholder="RO12345678"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  IBAN
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.companyIban}
                  onChange={(e) => update("companyIban", e.target.value)}
                  placeholder="RO00 XXXX ...."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  Bancă
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.companyBank}
                  onChange={(e) => update("companyBank", e.target.value)}
                  placeholder="BCR, BT, ING..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  Persoană de contact
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.contactPerson}
                  onChange={(e) => update("contactPerson", e.target.value)}
                  placeholder="Nume și prenume"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Adresă sediu social
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                value={form.companyAddress}
                onChange={(e) => update("companyAddress", e.target.value)}
                placeholder="Stradă, număr, oraș, județ"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  Nume complet
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.pfFullName}
                  onChange={(e) => update("pfFullName", e.target.value)}
                  placeholder="Nume și prenume"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400">
                  Serie & nr. CI / pașaport
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  value={form.pfIdNumber}
                  onChange={(e) => update("pfIdNumber", e.target.value)}
                  placeholder="XX 000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Adresă domiciliu
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-line bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                value={form.pfAddress}
                onChange={(e) => update("pfAddress", e.target.value)}
                placeholder="Stradă, număr, oraș, județ"
              />
            </div>
          </>
        )}
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Se trimite..." : "Trimite pentru înrolare"}
        </button>
        {saved && (
          <span className="text-xs text-emerald-400">
            Formular trimis ✅ Vei primi confirmarea după verificare.
          </span>
        )}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </form>
  );
}