// src/app/providers/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Artiști & Furnizori — BookingArt.ai",
};

type Search = {
  q?: string;
  city?: string;
  cat?: string;
  page?: string;
};

const PAGE = 12;

type ProviderCard = {
  id: string;
  displayName: string;
  city: string | null;
  country: string | null;
  categories: string[];
};

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: Search;
}) {
  const q = (searchParams?.q ?? "").trim();
  const city = (searchParams?.city ?? "").trim();
  const cat = (searchParams?.cat ?? "").trim();
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  const AND: any[] = [];
  if (q) {
    AND.push({
      OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (city) AND.push({ city });
  if (cat) AND.push({ categories: { has: cat } });

  const where = AND.length ? { AND } : {};

  const [items, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE,
      take: PAGE,
      select: {
        id: true,
        displayName: true,
        city: true,
        country: true,
        categories: true,
      },
    }) as unknown as Promise<ProviderCard[]>,
    prisma.provider.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE));

  const CATS: string[] = [
    "DJ",
    "Fotograf",
    "Videograf",
    "MC/Moderator",
    "Artiști Live",
    "Decor",
    "Lumini/Sunet",
    "Hostess",
    "Catering",
  ];

  return (
    <section className="mx-auto max-w-7xl">
      <h1 className="text-xl font-semibold text-zinc-100">
        Artiști & Furnizori
      </h1>

      {/* Фильтры */}
      <form
        action="/providers"
        className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_220px_auto]"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Caută artist/furnizor (nume, oraș)…"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
        />
        <input
          name="city"
          defaultValue={city}
          placeholder="Oraș"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
        />
        <select
          name="cat"
          defaultValue={cat}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
        >
          <option value="">Categorie (toate)</option>
          {CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-black hover:brightness-110"
        >
          Filtrează
        </button>
      </form>

      {/* Сетка карточек */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <a
            key={p.id}
            href={`/providers/${p.id}`}
            className="group relative block overflow-hidden rounded-2xl border border-line bg-white/[.03] shadow-[0_16px_48px_rgba(0,0,0,.45)] transition hover:bg-white/[.06] hover:ring-1 hover:ring-[var(--accent)]/40"
          >
            <div className="aspect-[16/9] w-full bg-[linear-gradient(120deg,#161616,#0f0f0f)]" />
            <div className="p-4">
              <div className="text-sm text-zinc-400">
                {p.city ?? "—"} {p.country ? `· ${p.country}` : ""}
              </div>
              <div className="mt-1 text-base font-semibold text-zinc-100">
                {p.displayName}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(p.categories) ? p.categories : [])
                  .slice(0, 4)
                  .map((c) => (
                    <span
                      key={c}
                      className="rounded-lg bg-surface border border-line px-2 py-1 text-xs text-zinc-300"
                    >
                      {c}
                    </span>
                  ))}
              </div>
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-sm text-zinc-400">
            Nicio înregistrare pentru criteriile selectate.
          </div>
        )}
      </div>

      {/* Пагинация */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => {
            const p = i + 1;
            const sp = new URLSearchParams({
              ...(q ? { q } : {}),
              ...(city ? { city } : {}),
              ...(cat ? { cat } : {}),
              page: String(p),
            }).toString();
            return (
              <a
                key={p}
                href={`/providers?${sp}`}
                className={`rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/[.08] ${
                  p === page
                    ? "bg-accent text-black"
                    : "bg-white/[.04] text-zinc-200 hover:bg-white/[.08]"
                }`}
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
