// src/app/search/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Căutare — BookingArt.ai" };

type Scope = "all" | "providers" | "venues";
type SearchDict = Record<string, string | string[] | undefined>;

const cities = ["București", "Cluj", "Iași", "Constanța", "Timișoara", "Brașov"];

function pickStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchDict;
}) {
  const q = pickStr(searchParams?.q).trim();
  const city = pickStr(searchParams?.city).trim();
  const scopeParam = pickStr(searchParams?.scope).trim() as Scope | "";
  const scope: Scope =
    scopeParam === "providers" || scopeParam === "venues" ? scopeParam : "all";

  const whereProvider: any = {};
  const whereVenue: any = {};

  if (q) {
    whereProvider.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { categories: { has: q } },
    ];
    whereVenue.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  if (city) {
    whereProvider.city = city;
    whereVenue.city = city;
  }

  const [providers, venues] = await Promise.all([
    scope !== "venues"
      ? prisma.provider.findMany({
          where: whereProvider,
          orderBy: { createdAt: "desc" },
          take: 24,
        })
      : Promise.resolve([] as any[]),
    scope !== "providers"
      ? prisma.venue.findMany({
          where: whereVenue,
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          take: 24,
        })
      : Promise.resolve([] as any[]),
  ]);

  const [providersCount, venuesCount] = await Promise.all([
    prisma.provider.count({ where: whereProvider }),
    prisma.venue.count({ where: whereVenue }),
  ]);

  const tabLink = (s: Scope) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (city) usp.set("city", city);
    usp.set("scope", s);
    return `/search?${usp.toString()}`;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 md:px-6">
      {/* HERO / FILTER BAR */}
      <section className="overflow-hidden rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#020b08] via-[#050508] to-[#120a08] px-4 py-5 shadow-[0_30px_140px_rgba(0,0,0,0.85)] md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Căutare pe BookingArt.ai
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-zinc-50 md:text-[1.7rem]">
              Găsește artiști, săli și furnizori pentru evenimentul tău.
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Filtrează după oraș și tip de rezultat. Intră în profil sau
              trimite o cerere de rezervare direct din platformă.
            </p>
          </div>

          <div className="text-xs text-zinc-500 lg:text-right">
            <div>
              <span className="text-zinc-300">Artiști &amp; furnizori:</span>{" "}
              {providersCount}
            </div>
            <div>
              <span className="text-zinc-300">Săli:</span> {venuesCount}
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <form
          action="/search"
          className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1.7fr)_220px_auto]"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Caută artiști, săli, cuvinte cheie…"
            className="h-10 rounded-2xl border border-white/10 bg-black/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-[var(--accent)]/80"
          />
          <select
            name="city"
            defaultValue={city || ""}
            className="h-10 rounded-2xl border border-white/10 bg-black/60 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/80"
          >
            <option value="">Oraș (toate)</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-2xl bg-[var(--accent)] px-5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
          >
            Caută
          </button>
        </form>

        {/* Tabs */}
        <div className="mt-4 inline-flex gap-1 rounded-full bg-black/60 p-1 text-[12px]">
          <a
            href={tabLink("all")}
            className={`rounded-full px-3 py-1.5 transition ${
              scope === "all"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-zinc-300 hover:text-zinc-100"
            }`}
          >
            Toate
          </a>
          <a
            href={tabLink("providers")}
            className={`rounded-full px-3 py-1.5 transition ${
              scope === "providers"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-zinc-300 hover:text-zinc-100"
            }`}
          >
            Artiști &amp; furnizori ({providersCount})
          </a>
          <a
            href={tabLink("venues")}
            className={`rounded-full px-3 py-1.5 transition ${
              scope === "venues"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-zinc-300 hover:text-zinc-100"
            }`}
          >
            Săli ({venuesCount})
          </a>
        </div>
      </section>

      {/* PROVIDERS */}
      {(scope === "all" || scope === "providers") && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Artiști &amp; furnizori
            </h2>
            {q && (
              <span className="text-[11px] text-zinc-500">
                Rezultate pentru „{q}”
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => {
              const initials =
                (p.displayName || "AR").slice(0, 2).toUpperCase() || "AR";
              const location = p.city ?? "România";

              return (
                <a
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="group flex items-stretch overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-br from-[#020b08] via-[#050508] to-[#0f0907] shadow-[0_20px_80px_rgba(0,0,0,0.75)] transition hover:border-[var(--accent)]/70 hover:shadow-[0_26px_100px_rgba(0,0,0,0.9)]"
                >
                  {/* avatar / фото */}
                  <div className="relative flex w-24 items-center justify-center bg-black/60 sm:w-28">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/12 bg-black/60 shadow-[0_16px_50px_rgba(0,0,0,0.9)]">
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.avatarUrl}
                          alt={p.displayName ?? "Artist / furnizor"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs font-semibold text-zinc-100">
                          {initials}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* контент */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-3">
                    <div>
                      <div className="truncate text-sm font-semibold text-zinc-50">
                        {p.displayName ?? "Artist / furnizor"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-400">
                        {location}
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="relative h-6 overflow-hidden rounded-full bg-black/60 text-[11px] text-zinc-300 ring-1 ring-white/10">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(232,175,91,0.35),transparent_55%)] opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative z-10 flex h-full items-center justify-between px-3">
                          <span>Vezi profilul &amp; calendarul</span>
                          <span className="text-zinc-400 group-hover:text-[var(--accent)]">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
            {providers.length === 0 && (
              <div className="col-span-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-4 text-sm text-zinc-400">
                Nimic găsit pentru filtrele actuale la artiști &amp; furnizori.
              </div>
            )}
          </div>
        </section>
      )}

      {/* VENUES */}
      {(scope === "all" || scope === "venues") && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Săli de evenimente
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((v) => (
              <a
                key={v.id}
                href={`/venues/${v.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-br from-[#05070b] via-[#050508] to-[#120a08] shadow-[0_20px_80px_rgba(0,0,0,0.75)] transition hover:border-[var(--accent)]/70 hover:shadow-[0_26px_100px_rgba(0,0,0,0.9)]"
              >
                <div className="px-4 pt-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                    {v.city ?? "România"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-50">
                    {v.name}
                  </div>
                </div>

                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="flex flex-1 items-end justify-between px-4 pb-3 text-[11px] text-zinc-400">
                  <span className="rounded-full bg-white/5 px-2 py-[2px] text-[10px] uppercase tracking-wide text-zinc-300">
                    Vezi detaliile sălii
                  </span>
                  <span className="text-zinc-400 group-hover:text-[var(--accent)]">
                    →
                  </span>
                </div>
              </a>
            ))}
            {venues.length === 0 && (
              <div className="col-span-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-4 text-sm text-zinc-400">
                Nimic găsit pentru filtrele actuale la săli.
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
