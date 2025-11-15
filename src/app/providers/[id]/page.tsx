// src/app/providers/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Cell = {
  day?: number;
  iso?: string;
  status?: "free" | "partial" | "busy";
  note?: string | null;
};

function cn(...parts: (string | null | undefined | false)[]) {
  return parts.filter(Boolean).join(" ");
}

// аккуратно достаём id из params (строка или массив)
function normalizeId(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

// календарь текущего месяца
function buildMonthGrid(opts: {
  year: number;
  month: number; // 0..11
  dates: { date: string; status: string; note?: string | null }[];
}): Cell[] {
  const { year, month, dates } = opts;
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = last.getUTCDate();

  const map = new Map<string, { status: string; note?: string | null }>();
  dates.forEach((d) => {
    const key = new Date(d.date).toISOString().slice(0, 10);
    map.set(key, { status: d.status, note: d.note });
  });

  const cells: Cell[] = [];

  // понедельник – первый день недели
  const pad = (first.getUTCDay() + 6) % 7;
  for (let i = 0; i < pad; i++) cells.push({});

  for (let d = 1; d <= totalDays; d++) {
    const iso = new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10);
    const meta = map.get(iso);
    cells.push({
      day: d,
      iso,
      status: (meta?.status as Cell["status"]) ?? "free",
      note: meta?.note ?? null,
    });
  }
  return cells;
}

/* ---------- SEO ---------- */

type MetadataProps = {
  params: Promise<{ id: string | string[] }>;
};

export async function generateMetadata(
  { params }: MetadataProps
): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = normalizeId(rawId);
  if (!id) {
    return { title: "Artist / furnizor — BookingArt.ai" };
  }

  const provider = await prisma.provider.findUnique({
    where: { id },
    select: { displayName: true, city: true, country: true },
  });

  if (!provider) {
    return { title: "Artist / furnizor — BookingArt.ai" };
  }

  const place = [provider.city, provider.country ?? "RO"]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${provider.displayName} — ${place} | BookingArt.ai`,
  };
}

/* ---------- Страница публичной заявки к провайдеру ---------- */

type PageProps = {
  params: Promise<{ id: string | string[] }>;
  searchParams?: Promise<{ requested?: string; date?: string }>;
};

export default async function ProviderPage({ params, searchParams }: PageProps) {
  const { id: rawId } = await params;
  const search = (await searchParams) ?? {};
  const id = normalizeId(rawId);
  if (!id) return notFound();

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      user: { select: { avatarUrl: true } },
      calendars: {
        where: {
          date: {
            gte: new Date(new Date().toISOString().slice(0, 10)), // c сегодня
          },
        },
        orderBy: { date: "asc" },
        take: 120,
        select: { id: true, date: true, status: true, note: true },
      },
      bookings: {
        take: 20,
        orderBy: { date: "desc" },
      },
    },
  });

  if (!provider) return notFound();

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  const cells = buildMonthGrid({
    year: y,
    month: m,
    dates: provider.calendars.map((c) => ({
      date: c.date.toISOString(),
      status: c.status,
      note: c.note ?? undefined,
    })),
  });

  const cats = provider.categories ?? [];
  const requested = search.requested === "1";
  const selectedDate = search.date ?? "";
  const avatarUrl = provider.user?.avatarUrl || null;

  const locationLabel = [provider.city, provider.country ?? "RO"]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 md:px-6">
      <a
        href={`/p/${provider.id}`}
        className="text-xs text-zinc-400 hover:text-accent"
      >
        ← Înapoi la profilul public
      </a>

      {/* баннер после отправки заявки */}
      {requested && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Cererea ta a fost înregistrată. Providerul sau echipa BookingArt te
          va contacta în curând cu detalii.
        </div>
      )}

      {/* HERO карточка провайдера + контекст заявки */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#02010a] via-[#05030f] to-[#140a08] px-5 py-5 shadow-[0_28px_140px_rgba(0,0,0,0.9)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-5">
            {avatarUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/12 bg-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={provider.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-lg font-semibold text-zinc-100 ring-1 ring-white/14">
                {provider.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
                Cerere de rezervare
              </div>
              <h1 className="mt-2 text-xl font-semibold text-zinc-50 md:text-2xl">
                {provider.displayName}
              </h1>
              <p className="mt-1 text-xs text-zinc-400">{locationLabel}</p>

              {cats.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-200">
                  {cats.slice(0, 4).map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-black/60 px-2 py-[2px] ring-1 ring-white/10"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 max-w-xs text-xs text-zinc-300 md:text-right">
            <p>
              Completezi rapid detaliile evenimentului, iar cererea ajunge ca
              lead în platformă. Providerul confirmă disponibilitatea, prețul și
              următorii pași.
            </p>
          </div>
        </div>
      </section>

      {/* сетка: слева форма, справа календарь */}
      <section className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Форма запроса */}
        <div className="rounded-3xl border border-line bg-surface/90 p-4 md:p-5">
          <h2 className="text-sm font-semibold text-zinc-100">
            Detalii cerere de rezervare
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Pentru MVP, plata și contractul se fac ulterior, după confirmarea
            de către provider.
          </p>

          <form
            className="mt-4 grid gap-3 text-sm"
            action="/api/request-provider"
            method="post"
          >
            <input type="hidden" name="providerId" value={provider.id} />

            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">
                Numele tău / companiei
              </span>
              <input
                name="name"
                type="text"
                className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="Ex: Andrei Popescu"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">Emailul pentru răspuns</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="you@example.com"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">Telefon (opțional)</span>
              <input
                name="phone"
                type="tel"
                className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="+40 7xx xxx xxx"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Oraș / locație</span>
                <input
                  name="city"
                  type="text"
                  className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                  placeholder="București"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Data dorită</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={selectedDate}
                  className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">
                Detalii despre eveniment
              </span>
              <textarea
                name="note"
                rows={4}
                className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none resize-y focus:border-accent/70"
                placeholder="Tip eveniment (nuntă, corporate, party), interval orar, număr invitați, buget orientativ…"
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110"
            >
              Trimite cererea
            </button>

            <p className="mt-2 text-[11px] text-zinc-500">
              Prin trimiterea cererii, ești de acord ca BookingArt să partajeze
              aceste date cu providerul selectat pentru a continua discuția
              despre eveniment.
            </p>
          </form>
        </div>

        {/* Календарь текущего месяца */}
        <div className="space-y-3">
          <div className="rounded-3xl border border-line bg-surface/90 p-4 md:p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Calendar disponibilitate
              </h2>
              <span className="text-[11px] text-zinc-500">
                Lună curentă · informativ
              </span>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-zinc-500">
              {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
                <div key={d} className="py-1 text-center">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1 text-[11px]">
              {cells.map((c, idx) => {
                if (!c.day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-10 rounded-lg bg-white/[0.02]"
                    />
                  );
                }

                const rawStatus: Cell["status"] = c.status ?? "free";
                const isSelected =
                  selectedDate &&
                  c.iso?.slice(0, 10) === selectedDate.slice(0, 10);

                let box = "border border-line bg-white/[0.03] text-zinc-100";
                let label = "Liber";

                if (rawStatus === "busy") {
                  box =
                    "border border-red-500/40 bg-red-500/10 text-red-100";
                  label = "Ocupat";
                } else if (rawStatus === "partial") {
                  box =
                    "border border-amber-500/40 bg-amber-500/10 text-amber-100";
                  label = "Parțial";
                }

                return (
                  <div
                    key={c.iso}
                    className={cn(
                      "flex h-10 flex-col rounded-lg px-1.5 py-1",
                      box,
                      isSelected &&
                        "ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-black"
                    )}
                    title={c.note ?? ""}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{c.day}</span>
                    </div>
                    <span className="mt-auto text-[9px] leading-tight opacity-80">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-500">
              <span className="rounded-full bg-white/[0.03] px-2 py-[2px]">
                Verde = liber
              </span>
              <span className="rounded-full bg-white/[0.03] px-2 py-[2px]">
                Galben = parțial
              </span>
              <span className="rounded-full bg-white/[0.03] px-2 py-[2px]">
                Roșu = ocupat
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-xs text-zinc-400">
            Datele din calendar sunt orientative. Providerul poate avea deja
            alte evenimente în acea zi, dar îți va confirma exact după ce
            primește cererea.
          </div>
        </div>
      </section>
    </main>
  );
}
