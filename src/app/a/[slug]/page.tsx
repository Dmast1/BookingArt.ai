// src/app/a/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

export default async function ActivityDetailPage({ params }: PageProps) {
  const slug = params.slug;

  // основная активность
  const activity = await prisma.activity.findFirst({
    where: {
      slug,
      status: "active",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      city: true,
      priceFrom: true,
      currency: true,
      coverImage: true,
      createdAt: true,
    },
  });

  if (!activity) {
    notFound();
  }

  // слоты по активности
  const slots = await prisma.activitySlot.findMany({
    where: { activityId: activity.id },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      status: true,
      capacityTotal: true,
      capacityBooked: true,
      note: true,
    },
  });

  const priceLabel =
    typeof activity.priceFrom === "number"
      ? `de la ${(activity.priceFrom / 100).toFixed(0)} ${
          activity.currency || "EUR"
        }`
      : "Preț la cerere";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-5 md:px-0">
      {/* HERO */}
      <article
        className="
          overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.14),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.98),rgba(3,17,13,0.98))]
          shadow-[0_30px_140px_rgba(0,0,0,0.95)]
        "
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.coverImage || "/images/placeholder-wide.jpg"}
            alt={activity.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-2 sm:left-6 sm:right-6 sm:bottom-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Activitate
              </span>
              {activity.city && (
                <span className="rounded-full bg-black/60 px-2.5 py-[3px] text-[11px] text-zinc-200">
                  {activity.city}
                </span>
              )}
              <span className="rounded-full bg-[var(--accent)]/14 px-2.5 py-[3px] text-[11px] text-[var(--accent)]">
                {priceLabel}
              </span>
            </div>
            <h1 className="text-[1.6rem] font-semibold leading-tight text-zinc-50 sm:text-[1.9rem]">
              {activity.title}
            </h1>
            {activity.subtitle && (
              <p className="max-w-2xl text-[13px] text-zinc-200">
                {activity.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* контент */}
        <div className="grid gap-6 p-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] sm:p-6 md:p-7">
          <div className="space-y-3 text-sm text-zinc-200">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-zinc-400">
              DESCRIERE
            </h2>
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-zinc-200">
              {activity.description ||
                "Organizăm o experiență completă — scrie o descriere mai detaliată a activității în dashboard-ul providerului."}
            </p>
          </div>

          <div className="space-y-4 text-[13px] text-zinc-200">
            <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                DETALII RAPIDE
              </h3>
              <ul className="mt-2 space-y-1.5 text-[13px] text-zinc-200">
                {activity.city && (
                  <li>
                    <span className="text-zinc-400">Oraș: </span>
                    {activity.city}
                  </li>
                )}
                <li>
                  <span className="text-zinc-400">Preț: </span>
                  {priceLabel}
                </li>
                <li>
                  <span className="text-zinc-400">Creată: </span>
                  {formatDate(activity.createdAt)}
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/35 p-3.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                CE ESTE INCLUS
              </h3>
              <p className="mt-2 text-[13px] text-zinc-300">
                Poți enumera în dashboard exact ce este inclus în activitate
                (ghid, echipament, transport etc.).
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* СЛОТЫ */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-50">
              Date disponibile
            </h2>
            <p className="mt-1 text-[12px] text-zinc-400">
              Alege data și intervalul orar care te interesează.
            </p>
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/60 px-3.5 py-3 text-sm text-zinc-400">
            Momentan nu sunt sloturi publicate pentru această activitate.
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => {
              const d = formatDate(slot.startAt);
              const from = formatTime(slot.startAt);
              const to = slot.endAt ? formatTime(slot.endAt) : "—";

              const total = slot.capacityTotal ?? 0;
              const booked = slot.capacityBooked ?? 0;
              const left = Math.max(total - booked, 0);

              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--border-subtle)] bg-black/50 px-3.5 py-2.5 text-[13px]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-black/70 px-2.5 py-[2px] text-[11px] text-zinc-100">
                        {d}
                      </span>
                      <span className="text-[11px] text-zinc-300">
                        {from} – {to}
                      </span>
                      <StatusPill status={slot.status} />
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-400">
                      {total > 0
                        ? `Locuri: ${booked}/${total} (libere ${left})`
                        : "Capacitate nelimitată"}
                    </div>
                    {slot.note && (
                      <div className="mt-1 text-[11px] text-zinc-400">
                        {slot.note}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="
                      rounded-full border border-[var(--border-accent)]
                      bg-[var(--accent)]/10 px-3 py-1.5
                      text-[11px] font-semibold text-[var(--accent)]
                      hover:bg-[var(--accent)]/18
                    "
                  >
                    Rezervă (în curând)
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

/* ------- helpers ------- */

function formatDate(date: Date) {
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function formatTime(date: Date) {
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase();

  if (s === "open" || s === "free") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Liber
      </span>
    );
  }
  if (s === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        Parțial
      </span>
    );
  }
  if (s === "busy" || s === "sold_out") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-red-300">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Ocupat
      </span>
    );
  }
  if (s === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/25 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-zinc-300">
        Închis
      </span>
    );
  }

  return null;
}
