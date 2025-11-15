import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Evenimente — BookingArt.ai",
};

type SearchParams = {
  q?: string;
  city?: string;
  from?: string;
  to?: string;
  page?: string;
};

type EventCard = {
  id: string;
  slug: string;
  title: string;
  city: string;
  date: Date;
  image: string | null;
};

type PageProps = {
  searchParams?: SearchParams;
};

const PAGE_SIZE = 12;

export default async function EventsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  const q = (searchParams?.q ?? "").trim();
  const city = (searchParams?.city ?? "").trim();
  const from = (searchParams?.from ?? "").trim();
  const to = (searchParams?.to ?? "").trim();
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  const where: Record<string, unknown> = {};
  const AND: unknown[] = [];

  if (q) {
    AND.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (city) AND.push({ city });
  if (from) AND.push({ date: { gte: new Date(from) } });
  if (to) AND.push({ date: { lte: new Date(to) } });

  if (AND.length) {
    (where as any).AND = AND;
  }

  const [itemsRaw, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        date: true,
        image: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  const items = itemsRaw as unknown as EventCard[];
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageNumbers = Array.from({ length: pages }, (_v, i) => i + 1);

  const isProviderOrAdmin =
    user && (user.role === "PROVIDER" || user.role === "ADMIN");

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
          <div className="absolute -left-20 top-[-35%] h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,176,112,0.3),transparent_65%)] blur-3xl opacity-90" />
          <div className="absolute -right-24 bottom-[-35%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,61,48,0.7),transparent_65%)] blur-3xl opacity-85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(3,17,13,0.9)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Evenimente & bilete
            </div>
            <h1 className="text-[1.9rem] font-semibold leading-tight text-[var(--text-main)] sm:text-[2.1rem] md:text-[2.3rem]">
              Concerte, party-uri și{" "}
              <span className="text-[var(--accent)]">evenimente live</span> într-un
              singur loc.
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Filtrezi după oraș, dată și găsești rapid evenimentele la care vrei
              să ajungi.
            </p>
          </div>

          <div className="mt-1 flex flex-col items-start gap-1 text-xs text-[var(--text-muted)] md:items-end">
            <span className="rounded-full bg-[rgba(2,9,8,0.9)] px-3 py-1 text-[11px]">
              {total === 0
                ? "Momentan nu avem evenimente pe filtrul ales."
                : `${total} evenimente găsite pentru aceste filtre.`}
            </span>
            {isProviderOrAdmin && (
              <div className="mt-1 flex gap-2 text-[11px]">
                <a
                  href="/events/new"
                  className="
                    rounded-xl bg-[var(--accent)] px-3 py-2
                    font-semibold text-[#1b1207]
                    shadow-[0_16px_40px_rgba(0,0,0,0.95)]
                    hover:translate-y-[1px] transition-transform
                  "
                >
                  + Creează eveniment
                </a>
                <a
                  href="/events/manage"
                  className="
                    rounded-xl border border-[var(--border-subtle)]
                    bg-[rgba(2,9,8,0.9)] px-3 py-2
                    text-[var(--text-main)]
                    hover:border-[var(--border-accent)]
                    hover:text-[var(--accent)]
                  "
                >
                  Evenimentele mele
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Форма фильтрации */}
        <form
          action="/events"
          className="
            relative mt-5 grid gap-3
            rounded-2xl border border-[var(--border-subtle)]
            bg-[rgba(2,9,8,0.9)] p-3
            backdrop-blur-xl
            md:grid-cols-[1.4fr_0.9fr_0.9fr_auto]
          "
        >
          <input
            name="q"
            placeholder="Caută eveniment (titlu, oraș)…"
            defaultValue={q}
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
          <input
            type="text"
            name="city"
            placeholder="Oraș"
            defaultValue={city}
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
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="
                rounded-xl border border-[var(--border-subtle)]
                bg-[rgba(3,17,13,0.96)]
                px-3 py-2
                text-sm text-[var(--text-main)]
                outline-none
                focus:border-[var(--border-accent)]
              "
            />
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="
                rounded-xl border border-[var(--border-subtle)]
                bg-[rgba(3,17,13,0.96)]
                px-3 py-2
                text-sm text-[var(--text-main)]
                outline-none
                focus:border-[var(--border-accent)]
              "
            />
          </div>
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

      {/* Сетка карточек / пустое состояние */}
      <section className="mt-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e: EventCard) => {
            const dateStr = e.date.toLocaleDateString("ro-RO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <a
                key={e.id}
                href={`/events/${e.slug}`}
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
                <div className="relative aspect-[16/9] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      e.image ??
                      "https://picsum.photos/seed/event-card-placeholder/800/450"
                    }
                    alt={e.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020908]/95 via-black/45 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-[rgba(3,17,13,0.96)] px-2.5 py-1 text-[11px] text-[var(--text-main)]">
                    {e.city || "Oraș necunoscut"}
                  </div>
                  <div className="absolute left-3 bottom-3 flex items-center gap-2 text-[11px] text-[var(--text-main)]">
                    <span className="rounded-full bg-[rgba(3,17,13,0.96)] px-2.5 py-1">
                      {dateStr}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-main)]">
                      {e.title}
                    </h2>
                    <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                      Eveniment cu bilete · {e.city || "România"}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Vezi detalii & bilete</span>
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
            );
          })}

          {items.length === 0 && (
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
              {q || city || from || to ? (
                <>Nu am găsit evenimente pentru criteriile selectate.</>
              ) : (
                <>
                  Momentan nu sunt evenimente publicate. Organizatorii vor putea
                  adăuga aici concerte, party-uri și show-uri cu bilete din
                  panoul lor de control.
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Пагинация */}
      {pages > 1 && (
        <section className="mt-7 flex items-center justify-center gap-2">
          {pageNumbers.map((p) => {
            const sp = new URLSearchParams({
              ...(q ? { q } : {}),
              ...(city ? { city } : {}),
              ...(from ? { from } : {}),
              ...(to ? { to } : {}),
              page: String(p),
            }).toString();

            const isActive = p === page;

            return (
              <a
                key={p}
                href={`/events?${sp}`}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm ring-1 ring-[var(--border-subtle)] transition",
                  isActive
                    ? "bg-[var(--accent)] text-[#1b1207] shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                    : "bg-white/[.05] text-[var(--text-main)] hover:bg-white/[.08]",
                ].join(" ")}
              >
                {p}
              </a>
            );
          })}
        </section>
      )}
    </main>
  );
}
