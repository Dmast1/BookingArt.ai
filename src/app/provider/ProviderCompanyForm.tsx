// src/components/provider/ProviderCompanyForm.tsx
"use client";

import React, { useState } from "react";

type CompanyType = "SRL" | "PFA" | "II" | "PF";

type FormState = {
  companyType: CompanyType;
  companyName: string;
  registrationNumber: string;
  cui: string;
  country: string;
  city: string;
  addressLine: string;
  bankName: string;
  iban: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  websiteUrl: string;
  categories: string;
  notes: string;
  acceptTerms: boolean;
  acceptGDPR: boolean;
};

const inputBase =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 " +
  "px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 " +
  "outline-none ring-0 transition-colors " +
  "focus:border-accent/80 focus:ring-2 focus:ring-accent/25";

const textareaBase =
  "mt-1 w-full min-h-[100px] resize-y rounded-xl border border-white/10 bg-black/40 " +
  "px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 " +
  "outline-none ring-0 transition-colors " +
  "focus:border-accent/80 focus:ring-2 focus:ring-accent/25";

export default function ProviderCompanyForm({
  userEmail,
}: {
  userEmail: string;
}) {
  const [form, setForm] = useState<FormState>({
    companyType: "SRL",
    companyName: "",
    registrationNumber: "",
    cui: "",
    country: "România",
    city: "",
    addressLine: "",
    bankName: "",
    iban: "",
    contactName: "",
    contactPhone: "",
    contactEmail: userEmail || "",
    websiteUrl: "",
    categories: "",
    notes: "",
    acceptTerms: false,
    acceptGDPR: false,
  });

  const [companyFiles, setCompanyFiles] = useState<File[]>([]);
  const [idFile, setIdFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCompanyFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setCompanyFiles(Array.from(files));
  }

  function handleIdFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files[0]) return;
    setIdFile(files[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      if (!form.acceptTerms || !form.acceptGDPR) {
        throw new Error(
          "Este necesar să accepți termenii și prelucrarea datelor (GDPR)."
        );
      }

      const fd = new FormData();

      (Object.entries(form) as [keyof FormState, FormState[keyof FormState]][]).forEach(
        ([key, value]) => {
          const v =
            typeof value === "boolean" ? String(value) : (value ?? "").toString();
          fd.append(key, v);
        }
      );

      companyFiles.forEach((file) => {
        fd.append("companyFiles", file);
      });

      if (idFile) {
        fd.append("idDocument", idFile);
      }

      const res = await fetch("/api/provider/register", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Eroare la înregistrarea providerului"
        );
      }

      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Eroare neașteptată");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#020617]/90 via-black/90 to-[#05030f]/90 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.9)] md:p-6 lg:p-8"
    >
      {/* HEADER – без боковой колонки, всё сверху */}
      <header className="space-y-4 border-b border-white/10 pb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-500/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Setup cont provider
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-zinc-50">
              Date firmă pentru facturare & contracte.
            </h2>
            <p className="max-w-xl text-[13px] text-zinc-400">
              Completezi o singură dată. După verificare, folosești aceleași
              date la toate rezervările și plățile.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] text-zinc-200 ring-1 ring-white/10">
              <span className="text-zinc-500">Cont logat:</span>
              <span className="font-mono text-emerald-200">
                {userEmail || "—"}
              </span>
            </div>
            <div className="inline-flex flex-wrap gap-1 rounded-full bg-black/70 p-1 ring-1 ring-white/10">
              {(["SRL", "PFA", "II", "PF"] as CompanyType[]).map((t) => {
                const active = form.companyType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateField("companyType", t)}
                    className={
                      "rounded-full px-3 py-1 text-[11px] uppercase tracking-wide transition " +
                      (active
                        ? "bg-accent text-black shadow-sm"
                        : "bg-transparent text-zinc-300 hover:bg-white/5")
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* шаги компактно под хедером */}
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-400">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px] text-accent">
              1
            </span>
            <span>Firmă & date fiscale</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[11px] text-accent/90">
              2
            </span>
            <span>Adresă, cont bancar & contact</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[11px] text-accent/90">
              3
            </span>
            <span>Documente pentru verificare</span>
          </div>
        </div>
      </header>

      {/* 1 · FIRMA */}
      <section className="space-y-4 rounded-2xl bg-black/55 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              1 · Date firmă / brand
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Cum apare firma ta în contracte și facturi.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-300">
              Denumire firmă / nume brand
            </label>
            <input
              className={inputBase}
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Ex: Nova Events SRL"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Nr. registru comerțului
            </label>
            <input
              className={inputBase}
              value={form.registrationNumber}
              onChange={(e) =>
                updateField("registrationNumber", e.target.value)
              }
              placeholder="J00/000/2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              CUI / CIF
            </label>
            <input
              className={inputBase}
              value={form.cui}
              onChange={(e) => updateField("cui", e.target.value)}
              placeholder="RO12345678"
            />
          </div>
        </div>
      </section>

      {/* 2 · ADRESĂ & BANCĂ */}
      <section className="space-y-4 rounded-2xl bg-black/55 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              2 · Adresă & cont bancar
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Pentru localizare și plăți către tine.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Țară
            </label>
            <input
              className={inputBase}
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              placeholder="România"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Oraș
            </label>
            <input
              className={inputBase}
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Cluj-Napoca"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Adresă completă
            </label>
            <input
              className={inputBase}
              value={form.addressLine}
              onChange={(e) => updateField("addressLine", e.target.value)}
              placeholder="Str. Exemplu nr. 10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Bancă
            </label>
            <input
              className={inputBase}
              value={form.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
              placeholder="Ex: Banca Transilvania"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              IBAN
            </label>
            <input
              className={inputBase}
              value={form.iban}
              onChange={(e) => updateField("iban", e.target.value)}
              placeholder="RO49AAAA1B31007593840000"
            />
          </div>
        </div>
      </section>

      {/* 3 · CONTACT */}
      <section className="space-y-4 rounded-2xl bg-black/55 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              3 · Persoană de contact
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Cine ține legătura cu noi pentru contracte & plăți.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Nume & prenume
            </label>
            <input
              className={inputBase}
              value={form.contactName}
              onChange={(e) => updateField("contactName", e.target.value)}
              placeholder="Ex: Andrei Pop"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Telefon
            </label>
            <input
              className={inputBase}
              value={form.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              placeholder="+40 7xx xxx xxx"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Email facturare / contracte
            </label>
            <input
              type="email"
              className={inputBase}
              value={form.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              placeholder="billing@firma.ro"
            />
          </div>
        </div>
      </section>

      {/* 4 · EXTRA */}
      <section className="space-y-4 rounded-2xl bg-black/55 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              4 · Detalii extra
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Ajută-ne să te afișăm corect în căutări.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Website (opțional)
            </label>
            <input
              className={inputBase}
              value={form.websiteUrl}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Categorii (ex: DJ, Fotografie, Săli)
            </label>
            <input
              className={inputBase}
              value={form.categories}
              onChange={(e) => updateField("categories", e.target.value)}
              placeholder="DJ, Fotograf, Decor"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300">
            Observații interne (opțional)
          </label>
          <textarea
            className={textareaBase}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Ex: facturare lunară, anumite condiții, etc."
          />
        </div>
      </section>

      {/* 5 · DOCUMENTE */}
      <section className="space-y-4 rounded-2xl bg-black/60 p-4 ring-1 ring-emerald-500/40">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
              5 · Documente pentru verificare
            </div>
            <p className="mt-1 text-[11px] text-emerald-100/80">
              Acte de firmă și document de identitate (doar pentru verificare
              internă).
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* company extras */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-200">
              Extras firmă / acte companie
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/60 bg-emerald-500/5 px-3 py-3 text-center text-[11px] text-emerald-100/90 hover:bg-emerald-500/10">
              <span className="text-lg">📄</span>
              <span>
                Trage fișiere aici sau{" "}
                <span className="underline">alege din device</span>.
              </span>
              <span className="text-[10px] text-emerald-200/80">
                Acceptăm .pdf, .jpg, .jpeg, .png (poți încărca mai multe).
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleCompanyFilesChange}
              />
            </label>

            {companyFiles.length > 0 && (
              <ul className="space-y-1 text-[11px] text-emerald-200/90">
                {companyFiles.map((file, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="truncate">{file.name}</span>
                    <span className="text-emerald-300/80">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* id document */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-200">
              Document identitate reprezentant
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/60 bg-black/60 px-3 py-3 text-center text-[11px] text-emerald-100/90 hover:bg-black/70">
              <span className="text-lg">🪪</span>
              <span>
                Încarcă o poză clară a CI / pașaportului. O folosim doar pentru
                verificare KYC internă.
              </span>
              <span className="text-[10px] text-emerald-200/80">
                Acceptăm .jpg, .jpeg, .png, .pdf.
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleIdFileChange}
              />
            </label>

            {idFile && (
              <div className="text-[11px] text-emerald-200/90">
                Selectat: <span className="font-medium">{idFile.name}</span>{" "}
                ({(idFile.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ЧЕКБОКСЫ + CTA */}
      <section className="space-y-4 rounded-2xl bg-black/70 p-4 ring-1 ring-white/10">
        <div className="space-y-3 text-xs text-zinc-300">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => updateField("acceptTerms", e.target.checked)}
              className="mt-[2px] h-4 w-4 rounded border-zinc-500 bg-black/70"
            />
            <span>
              Confirm că datele completate sunt reale și sunt autorizat(ă) să
              reprezint această firmă în relația cu BookingArt.ai.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.acceptGDPR}
              onChange={(e) => updateField("acceptGDPR", e.target.checked)}
              className="mt-[2px] h-4 w-4 rounded border-zinc-500 bg-black/70"
            />
            <span>
              Sunt de acord cu{" "}
              <a href="/terms" className="text-accent hover:underline">
                Termenii și Condițiile
              </a>{" "}
              și cu{" "}
              <a href="/privacy" className="text-accent hover:underline">
                Politica GDPR
              </a>
              .
            </span>
          </label>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.4)] hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Se trimite..." : "Trimite datele pentru verificare"}
          </button>
          {saved && (
            <span className="text-xs text-emerald-400">
              Date trimise ✅ Vei vedea statusul în dashboard.
            </span>
          )}
          {error && (
            <span className="text-xs text-red-400">
              {error}
            </span>
          )}
        </div>
      </section>
    </form>
  );
}