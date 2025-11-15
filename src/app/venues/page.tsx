// src/app/venues/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { Prisma, Venue } from "@prisma/client";

export const metadata: Metadata = {
  title: "Săli de evenimente — BookingArt.ai",
};

const cities = ["București", "Cluj", "Iași", "Constanța", "Timișoara", "Brașov"];
const months = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

type PageProps = {
  searchParams?: {
    q?: string;
    city?: string;
    month?: string; // зарезервировано под будущую логику (пока не используется)
  };
};

export default async function VenuesPage({ searchParams }: PageProps) {
  const q = (searchParams?.q ?? "").trim();
  const city = (searchParams?.city ?? "").trim();
  const _month = (searchParams?.month ?? "").trim();

  const where: Prisma.VenueWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  if (city) {
    where.city = city;
  }

  const venues = await prisma.venue.findMany({
    where,
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  return (
    <main className="mx-auto max-w-6xl min-h-[70vh] px-4 pb-14 pt-5 md:px-6">
      {/* HERO / HEADER */}
      <section
        className="
          relative overflow-hidden
          rounded-[28px]
          border border-[var(--border-subtle)]
          bg-[rgba(3,17,13,0.96)]
          px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8
          shadow-[0_36px_140px_rgba(0,0,0,0.95)]
          backdrop-blur-[24px]
        "
      >
        {/* glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-[-35%] h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,176,112,0.32),transparent_65%)] blur-3xl opacity-90" />
          <div className="absolute -right-24 bottom-[-35%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,61,48,0.7),transparent_65%)] blur-3xl opacity-85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(3,17,13,0.9)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Săli de evenimente
            </div>
            <h1 className="text-[1.9rem] font-semibold leading-tight text-[var(--text-main)] sm:text-[2.1rem] md:text-[2.3rem]">
              Găsești sala potrivită{" "}
              <span className="text-[var(--accent)]">
                pentru evenimentul tău
              </span>
              .
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Filtrezi după oraș și perioadă și vezi rapid săli potrivite pentru
              nuntă, corporate sau party.
            </p>
          </div>

          <div className="mt-1 flex flex-col items-start gap-1 text-xs text-[var(--text-muted)] md:items-end">
            <span className="rounded-full bg-[rgba(2,9,8,0.9)] px-3 py-1 text-[11px]">
              {venues.length === 0
                ? "Momentan nu avem rezultate pe filtrul ales."
                : `${venues.length} săli găsite pentru aceste filtre.`}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]/80">
              Date reale din platformă, fără mock-uri.
            </span>
          </div>
        </div>

        {/* ФИЛЬТРЫ */}
        <form
          action="/venues"
          className="
            relative mt-5 grid gap-3
            rounded-2xl border border-[var(--border-subtle)]
            bg-[rgba(2,9,8,0.9)]
            p-3
            ring-0 backdrop-blur-xl
            md:grid-cols-[1.4fr_0.9fr_0.9fr_auto]
          "
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Caută o sală (nume, oraș)…"
            className="
              rounded-xl border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)]
              px-3 py-2
              text-sm text-[var(--text-main)]
              outline-none
              placeholder:text-[var(--text-muted)]
              focus:border-[var(--border-accent)]
            "
          />
          <select
            name="city"
            className="
              rounded-xl border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)]
              px-3 py-2
              text-sm text-[var(--text-main)] outline-none
              focus:border-[var(--border-accent)]
            "
            defaultValue={city || ""}
          >
            <option value="">Oraș (toate)</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            name="month"
            className="
              rounded-xl border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)]
              px-3 py-2
              text-sm text-[var(--text-main)] outline-none
              focus:border-[var(--border-accent)]
            "
            defaultValue={_month || ""}
          >
            <option value="">Lună (toate)</option>
            {months.map((m, i) => (
              <option key={m} value={String(i + 1).padStart(2, "0")}>
                {m}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="
              btn-primary
              w-full md:w-auto
              rounded-xl px-4 py-2 text-sm
            "
          >
            Filtrează
          </button>
        </form>
      </section>

      {/* Сетка залов */}
      <section className="mt-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v: Venue) => (
            <a
              key={v.id}
              href={`/venues/${v.id}`}
              className="
                group relative flex flex-col overflow-hidden
                rounded-[24px]
                border border-[var(--border-subtle)]
                bg-[rgba(3,17,13,0.96)]
                shadow-[0_24px_90px_rgba(0,0,0,0.95)]
                backdrop-blur-[22px]
                transition-transform duration-200
                hover:-translate-y-1 hover:border-[var(--border-accent)]
              "
            >
              {/* обложка: градиент, потом можно заменить реальными фото */}
              <div className="relative aspect-[16/9] w-full bg-[radial-gradient(circle_at_top,rgba(217,176,112,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(6,32,26,0.9),rgba(3,17,13,1))]">
                <div className="absolute left-3 top-3 rounded-full bg-[rgba(3,17,13,0.96)] px-2.5 py-1 text-[11px] text-[var(--text-main)]">
                  {v.city || "Oraș necunoscut"}
                </div>
                {typeof v.rating === "number" && v.rating > 0 && (
                  <div
                    className="
                      absolute right-3 top-3 flex h-7 items-center gap-1
                      rounded-full bg-[rgba(3,17,13,0.96)]
                      px-2.5 text-[11px] text-[var(--accent)]
                      shadow-[0_12px_30px_rgba(0,0,0,0.9)]
                    "
                  >
                    ★ {v.rating.toFixed(1)}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020908]/95 via-[#020908]/50 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-main)]">
                    {v.name}
                  </h2>
                  <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                    Sală de evenimente · {v.city || "România"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    {"capacityMin" in v && "capacityMax" in v && v.capacityMax && (
                      <span className="inline-flex items-center rounded-full bg-[rgba(2,9,8,0.9)] px-2 py-[3px]">
                        Capacitate aprox.{" "}
                        {/* @ts-ignore */}
                        {v.capacityMin ?? "50"} – {v.capacityMax}+ pers.
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Vezi detalii & disponibilitate</span>
                  <span
                    className="
                      flex h-6 w-6 items-center justify-center
                      rounded-full bg-[rgba(2,9,8,0.9)]
                      text-[11px] text-[var(--text-main)]
                      opacity-0 transition-opacity group-hover:opacity-100
                    "
                  >
                    →
                  </span>
                </div>
              </div>
            </a>
          ))}

          {venues.length === 0 && (
            <div
              className="
                col-span-full rounded-[24px]
                border border-[var(--border-subtle)]
                bg-[rgba(3,17,13,0.96)]
                px-4 py-6 text-sm text-[var(--text-muted)]
                shadow-[0_18px_70px_rgba(0,0,0,0.9)]
                backdrop-blur-[20px]
              "
            >
              Nu am găsit rezultate pentru criteriile selectate. Încearcă alt
              oraș sau caută după numele complet al sălii.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
