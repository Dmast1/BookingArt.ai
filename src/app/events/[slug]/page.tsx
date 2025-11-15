import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TicketCheckoutForm } from "@/components/events/TicketCheckoutForm";

type RouteParams = {
  slug: string;
};

type PageProps = {
  params: Promise<RouteParams>;
};

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      title: true,
      city: true,
      date: true,
    },
  });

  if (!event) {
    return { title: "Eveniment — BookingArt.ai" };
  }

  const dateStr = event.date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    title: `${event.title} — ${event.city}, ${dateStr} | BookingArt.ai`,
  };
}

export default async function EventPage(props: PageProps) {
  const { slug } = await props.params;
  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: { select: { name: true, city: true } },
      provider: { select: { displayName: true } },
      ticketTypes: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!event) return notFound();

  const dateStr = event.date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const heroImage =
    event.image ??
    "https://picsum.photos/seed/bookingart-event/1200/700";

  const ticketTypes = event.ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    price: t.price,
    currency: t.currency,
    total: t.total,
    sold: t.sold,
  }));

  const hasTickets = ticketTypes.length > 0;

  return (
    <main
      className="
        min-h-[70vh]
        bg-[radial-gradient(circle_at_top,rgba(11,61,48,0.55),transparent_60%),radial-gradient(circle_at_bottom,rgba(57,5,23,0.5),transparent_65%),var(--bg)]
        pb-12
      "
    >
      <div className="mx-auto max-w-5xl px-4 pt-4 md:px-6">
        <a
          href="/events"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          ← Înapoi la evenimente
        </a>

        {/* HERO CARD */}
        <div
          className="
            relative mt-4 overflow-hidden
            rounded-[32px]
            border border-[var(--border-subtle)]
            bg-[rgba(3,17,13,0.96)]
            shadow-[0_34px_120px_rgba(0,0,0,0.95)]
            backdrop-blur-[24px]
          "
        >
          <div className="relative h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020908]/95 via-black/40 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_bottom,rgba(3,17,13,0.95),transparent_70%)]" />

            {/* text */}
            <div className="absolute inset-x-4 bottom-4 md:inset-x-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(3,17,13,0.9)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    Eveniment
                  </div>
                  <h1 className="mt-2 text-xl font-semibold text-[var(--text-main)] sm:text-[1.6rem] md:text-[1.8rem]">
                    {event.title}
                  </h1>
                  <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-[13px]">
                    {event.city} · {dateStr}
                  </p>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] md:text-right">
                  {event.venue && (
                    <div>
                      Sală:{" "}
                      <span className="font-medium text-[var(--text-main)]">
                        {event.venue.name}
                      </span>{" "}
                      ({event.venue.city})
                    </div>
                  )}
                  {event.provider && (
                    <div>
                      Organizat de{" "}
                      <span className="font-medium text-[var(--text-main)]">
                        {event.provider.displayName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="mt-6 grid gap-5 md:grid-cols-[1.6fr_1.1fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div
              className="
                rounded-[24px]
                border border-[var(--border-subtle)]
                bg-[rgba(3,17,13,0.96)]
                p-4 md:p-5
                text-sm
                shadow-[0_24px_80px_rgba(0,0,0,0.9)]
                backdrop-blur-[22px]
              "
            >
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Despre eveniment
              </h2>
              <p className="mt-2 text-sm text-[var(--text-main)]/90">
                Organizatorul poate adăuga aici descrierea detaliată a
                evenimentului: programul serii, artiștii invitați, condițiile de
                acces și alte informații utile. Momentan această secțiune este
                generică, până când vor fi completate toate detaliile.
              </p>
            </div>

            <div
              className="
                rounded-[24px]
                border border-[var(--border-subtle)]
                bg-[rgba(2,9,8,0.96)]
                p-4 md:p-5
                text-xs text-[var(--text-main)]
                shadow-[0_20px_70px_rgba(0,0,0,0.9)]
                backdrop-blur-[20px]
              "
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Informații practice
              </h3>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <span className="text-[var(--text-muted)]">Oraș: </span>
                  <span className="text-[var(--text-main)]">{event.city}</span>
                </li>
                {event.venue && (
                  <li>
                    <span className="text-[var(--text-muted)]">Locație: </span>
                    <span className="text-[var(--text-main)]">
                      {event.venue.name} ({event.venue.city})
                    </span>
                  </li>
                )}
                <li>
                  <span className="text-[var(--text-muted)]">Data & ora: </span>
                  <span className="text-[var(--text-main)]">{dateStr}</span>
                </li>
                {event.status && (
                  <li>
                    <span className="text-[var(--text-muted)]">Status: </span>
                    <span className="text-[var(--text-main)]">
                      {event.status}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN – TICKETS */}
          <div>
            {hasTickets ? (
              <div
                className="
                  rounded-[24px]
                  border border-[var(--border-subtle)]
                  bg-[rgba(3,17,13,0.98)]
                  p-4 md:p-5
                  shadow-[0_26px_90px_rgba(0,0,0,0.95)]
                  backdrop-blur-[24px]
                "
              >
                <TicketCheckoutForm
                  eventId={event.id}
                  userEmail={user?.email ?? null}
                  ticketTypes={ticketTypes}
                />
              </div>
            ) : (
              <div
                className="
                  rounded-[24px]
                  border border-[var(--border-subtle)]
                  bg-[rgba(3,17,13,0.96)]
                  p-4 md:p-5
                  text-sm text-[var(--text-muted)]
                  shadow-[0_26px_90px_rgba(0,0,0,0.95)]
                  backdrop-blur-[24px]
                "
              >
                <h2 className="text-sm font-semibold text-[var(--text-main)]">
                  Bilete
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Pentru acest eveniment nu sunt încă bilete vândute prin
                  BookingArt.ai. Organizatorul va putea adăuga tipuri de bilete
                  și prețuri în panoul său de administrare.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
