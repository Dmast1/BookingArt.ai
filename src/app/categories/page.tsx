import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categorii — BookingArt.ai",
};

const CATS = [
  {
    slug: "dj",
    label: "DJ",
    emoji: "🎧",
    description: "Nunți, corporate, party-uri private.",
  },
  {
    slug: "fotograf",
    label: "Fotograf",
    emoji: "📷",
    description: "Foto nuntă, botez, ședințe & content.",
  },
  {
    slug: "videograf",
    label: "Videograf",
    emoji: "🎥",
    description: "Evenimente, aftermovie, social media.",
  },
  {
    slug: "live",
    label: "Artiști live",
    emoji: "🎤",
    description: "Trupe live, cover band, soliști.",
  },
  {
    slug: "mc",
    label: "MC / Moderator",
    emoji: "🎙️",
    description: "MC, prezentatori, moderatori.",
  },
  {
    slug: "decor",
    label: "Decor",
    emoji: "🎈",
    description: "Decor săli, aranjamente, balloon art.",
  },
  {
    slug: "light",
    label: "Lumini & sunet",
    emoji: "✨",
    description: "Scene, lumini, sunet, tehnic.",
  },
  {
    slug: "sali",
    label: "Săli & venue-uri",
    emoji: "🏛️",
    description: "Locații pentru evenimente.",
  },
  {
    slug: "bilete",
    label: "Evenimente cu bilete",
    emoji: "🎟️",
    description: "Concerte, party-uri, spectacole.",
  },
  {
    slug: "catering",
    label: "Catering",
    emoji: "🍽️",
    description: "Meniu, candy bar, coffee break.",
  },
  {
    slug: "hostess",
    label: "Hostess & staff",
    emoji: "💃",
    description: "Hostess, promotori, staff.",
  },
  {
    slug: "yachts",
    label: "Yacht-uri & boat party",
    emoji: "🛥️",
    description: "Croaziere private, boat party.",
  },
];

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:px-6">
      {/* HERO CATEGORII */}
      <section
        className="
          relative overflow-hidden rounded-3xl
          border border-zinc-900/80
          bg-gradient-to-r from-[#02010a] via-[#05030f] to-[#120806]
          px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9
          shadow-[0_32px_160px_rgba(0,0,0,0.9)]
        "
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-[-40%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.26),transparent)] blur-3xl opacity-80" />
          <div className="absolute -right-24 bottom-[-40%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.26),transparent)] blur-3xl opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Catalog de categorii
            </div>
            <h1 className="text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem] md:text-[2.3rem]">
              Toți providerii tăi{" "}
              <span className="text-accent">pe categorii clare</span>.
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300">
              Alege categoria și vezi direct artiști, săli și servicii. Fără
              scroll infinit prin tot.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 md:mt-0 md:justify-end">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110"
            >
              Caută în toate categoriile
            </Link>
            <Link
              href="/provider"
              className="inline-flex items-center justify-center rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
            >
              Înscrie-te ca provider
            </Link>
          </div>
        </div>
      </section>

      {/* GRID CATEGORII – минимал, без простынь текста */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Alege o categorie
            </h2>
            <p className="text-xs text-zinc-500">
              Vezi doar ce te interesează acum.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {CATS.map((c, idx) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="
                group relative flex h-32 flex-col justify-between
                rounded-2xl border border-zinc-900/80
                bg-[radial-gradient(circle_at_top,#18181b,transparent_55%),radial-gradient(circle_at_bottom,#020617,transparent_55%)]
                p-4 shadow-[0_18px_60px_rgba(0,0,0,0.7)]
                transition-transform duration-200
                hover:-translate-y-1 hover:border-[var(--accent)]/80
                cat-pop
              "
            >
              <div className="relative flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-black/70 ring-1 ring-white/10 text-[1.6rem] transition group-hover:ring-[var(--accent)]/70">
                  {c.emoji}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-50">
                    {c.label}
                  </span>
                  <span className="text-[11px] text-zinc-500 line-clamp-1 md:line-clamp-2">
                    {c.description}
                  </span>
                </div>
              </div>

              <div className="relative flex items-center justify-end text-[11px] text-zinc-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] text-zinc-200 opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / BENEFITS */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-black/70 p-4 text-sm text-zinc-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Cum funcționează
          </div>
          <p className="mt-2 text-[13px] text-zinc-300">
            Alegi categoria, filtrezi după oraș, dată și buget, apoi trimiți o
            singură cerere clară către mai mulți provideri.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/70 p-4 text-sm text-zinc-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Clienți
          </div>
          <p className="mt-2 text-[13px] text-zinc-300">
            Vezi profil, poze, review-uri și prețuri orientative înainte să
            scrii cuiva.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/70 p-4 text-sm text-zinc-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Provideri
          </div>
          <p className="mt-2 text-[13px] text-zinc-300">
            Primești cereri filtrate pe categoria ta și răspunzi direct din
            dashboard.
          </p>
        </div>
      </section>
    </main>
  );
}
