import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

type SearchParams = {
  q?: string;
  city?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  page?: string;
};

const PAGE_SIZE = 12;

export default async function ActivitiesPage({
  searchParams,
}: { searchParams: SearchParams }) {
  const q = (searchParams.q ?? "").trim();
  const city = (searchParams.city ?? "").trim();
  const from = (searchParams.from ?? "").trim();
  const to = (searchParams.to ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  // where
  const where: any = { status: "active" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { subtitle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (from || to) {
    // если заданы даты — покажем активности, у которых есть слоты в диапазоне
    where.slots = {
      some: {
        startAt: from ? { gte: new Date(from) } : undefined,
        endAt: to ? { lte: new Date(to) } : undefined,
        status: "open",
      },
    };
  }

  const [total, items] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        city: true,
        priceFrom: true,
        currency: true,
        coverImage: true,
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-6">
      {/* HERO + фильтры */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] p-5 shadow-[0_28px_140px_rgba(0,0,0,0.95)] sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Activități & experiențe
        </div>

        <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
          Activități, tururi și experiențe de făcut.
        </h1>
        <p className="mt-1 text-sm text-zinc-300">
          Filtrează după oraș, perioadă și găsește rapid activități disponibile.
        </p>

        <form
          action="/activitati"
          className="mt-4 grid gap-2 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto]"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Caută activitate (titlu, oraș)…"
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--border-accent)]"
          />
          <input
            name="city"
            defaultValue={city}
            placeholder="Oraș"
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--border-accent)]"
          />
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--border-accent)]"
          />
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-10 rounded-xl border border-[var(--border-subtle)] bg-black/70 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--border-accent)]"
          />
          <button
            className="h-10 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-black hover:brightness-110"
            type="submit"
          >
            Filtrează
          </button>
        </form>
      </div>

      {/* GRID */}
      <Suspense fallback={<div className="text-sm text-zinc-400">Se încarcă…</div>}>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/70 p-6 text-sm text-zinc-400">
            Nicio activitate găsită pentru filtrele date.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <a
                key={a.id}
                href={`/a/${a.slug}`}
                className="group overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-black/70 shadow-[0_22px_90px_rgba(0,0,0,0.9)]"
              >
                <div className="aspect-[16/9] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.coverImage || "/images/placeholder-wide.jpg"}
                    alt={a.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-zinc-400">{a.city || "—"}</div>
                    {typeof a.priceFrom === "number" && (
                      <div className="rounded-full bg-white/5 px-2 py-[2px] text-[11px] text-zinc-200">
                        de la {(a.priceFrom / 100).toFixed(0)} {a.currency || "EUR"}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100">
                    {a.title}
                  </div>
                  {a.subtitle && (
                    <div className="text-[12px] text-zinc-400 line-clamp-1">{a.subtitle}</div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </Suspense>

      {/* PAGINATION */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
            const sp = new URLSearchParams({
              ...(q ? { q } : {}),
              ...(city ? { city } : {}),
              ...(from ? { from } : {}),
              ...(to ? { to } : {}),
              page: String(n),
            }).toString();
            const href = `/activitati?${sp}`;
            const active = n === page;
            return (
              <a
                key={n}
                href={href}
                className={[
                  "h-8 min-w-8 rounded-lg border px-2 text-center text-sm leading-8",
                  active
                    ? "border-[var(--border-accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "border-[var(--border-subtle)] bg-black/60 text-zinc-300 hover:border-[var(--border-accent)]",
                ].join(" ")}
              >
                {n}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
