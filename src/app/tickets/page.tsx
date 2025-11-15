// src/app/tickets/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Biletele mele — BookingArt.ai",
};

type PageProps = {
  searchParams?: {
    success?: string;
    order?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function MyTicketsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/tickets");
  }

  const orders = await prisma.ticketOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: { title: true, slug: true, city: true, date: true },
      },
      items: {
        include: {
          ticketType: { select: { name: true } },
        },
      },
    },
    take: 30,
  });

  const success = searchParams?.success === "1";
  const successOrderId = searchParams?.order;

  return (
    <main className="mx-auto max-w-5xl min-h-[70vh] px-4 pb-14 pt-5 md:px-6">
      {/* HEADER */}
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
          <div className="absolute -left-16 top-[-35%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,176,112,0.3),transparent_65%)] blur-3xl opacity-85" />
          <div className="absolute -right-16 bottom-[-35%] h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,61,48,0.7),transparent_65%)] blur-3xl opacity-85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(3,17,13,0.9)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Biletele mele
            </div>
            <h1 className="mt-2 text-[1.8rem] font-semibold leading-tight text-[var(--text-main)] sm:text-[2rem]">
              Toate biletele tale,{" "}
              <span className="text-[var(--accent)]">într-un singur loc.</span>
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
              Comenzi, status plăți și acces rapid la evenimente.
            </p>
          </div>

          <div className="mt-2 flex flex-col items-start gap-1 text-xs text-[var(--text-muted)] md:items-end">
            <span className="rounded-full bg-[rgba(2,9,8,0.9)] px-3 py-1 text-[11px]">
              {orders.length === 0
                ? "Încă nu ai bilete cumpărate."
                : `${orders.length} comenzi de bilete.`}
            </span>
            <a
              href="/events"
              className="inline-flex items-center text-[11px] text-[var(--accent)] hover:text-[var(--accent)]/85"
            >
              Vezi evenimente cu bilete →
            </a>
          </div>
        </div>

        {success && successOrderId && (
          <div className="relative mt-4 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
              Plată confirmată
            </div>
            <p className="mt-1 text-[12px]">
              Comanda ta a fost înregistrată (ID:{" "}
              <span className="font-mono text-[11px]">{successOrderId}</span>).
            </p>
          </div>
        )}
      </section>

      {/* LISTĂ COMENZI / EMPTY */}
      {orders.length === 0 ? (
        <section
          className="
            mt-8 rounded-[24px]
            border border-[var(--border-subtle)]
            bg-[rgba(3,17,13,0.96)]
            px-5 py-6 text-sm text-[var(--text-muted)]
            shadow-[0_18px_70px_rgba(0,0,0,0.9)]
            backdrop-blur-[20px]
          "
        >
          <p>Nu ai încă bilete cumpărate prin platformă.</p>
          <a
            href="/events"
            className="mt-3 inline-flex items-center text-[13px] text-[var(--accent)] hover:text-[var(--accent)]/85"
          >
            Caută un eveniment și ia-ți primul bilet →
          </a>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          {orders.map((o) => {
            const createdAt = o.createdAt.toLocaleString("ro-RO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const eventDate = o.event?.date
              ? o.event.date.toLocaleString("ro-RO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            const totalTickets = o.items.reduce(
              (sum, it) => sum + it.quantity,
              0
            );

            const statusLabel = o.status;
            const statusStyles =
              o.status === "paid"
                ? "bg-emerald-500/15 text-emerald-300"
                : o.status === "canceled"
                ? "bg-red-500/15 text-red-300"
                : "bg-amber-500/15 text-amber-300";

            return (
              <article
                key={o.id}
                className="
                  relative overflow-hidden rounded-[26px]
                  border border-[var(--border-subtle)]
                  bg-[rgba(3,17,13,0.98)]
                  shadow-[0_26px_90px_rgba(0,0,0,0.95)]
                  backdrop-blur-[22px]
                "
              >
                {/* “перфорация” билета слева */}
                <div className="pointer-events-none absolute inset-y-4 left-0 w-[3px] bg-gradient-to-b from-[var(--accent)] via-[#27332f] to-[var(--accent)]" />
                <div className="pointer-events-none absolute left-[-10px] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#020908]" />

                <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:px-5 md:py-5">
                  {/* LEFT: info eveniment */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <span className="font-mono text-[10px]">
                        {o.id.slice(0, 10)}…
                      </span>
                      <span className="h-px w-6 bg-[var(--border-subtle)]" />
                      <span>{createdAt}</span>
                    </div>

                    <div className="mt-2">
                      {o.event ? (
                        <>
                          <a
                            href={`/events/${o.event.slug}`}
                            className="text-sm font-semibold text-[var(--text-main)] hover:text-[var(--accent)]"
                          >
                            {o.event.title}
                          </a>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
                            {o.event.city && (
                              <span className="rounded-full bg-[rgba(2,9,8,0.9)] px-2.5 py-[3px]">
                                {o.event.city}
                              </span>
                            )}
                            {eventDate && (
                              <span className="rounded-full bg-[rgba(2,9,8,0.9)] px-2.5 py-[3px]">
                                {eventDate}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm font-semibold text-[var(--text-main)]">
                          Eveniment necunoscut
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: sumar bani + status + QR placeholder */}
                  <div
                    className="
                      flex w-full flex-col justify-between
                      rounded-2xl bg-[rgba(2,9,8,0.9)]
                      px-3 py-3 text-[11px] text-[var(--text-main)]
                      md:w-60
                    "
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[var(--text-muted)]">Status</span>
                      <span
                        className={`rounded-full px-2.5 py-[3px] text-[11px] font-semibold ${statusStyles}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Total</span>
                      <span className="text-sm font-semibold text-[var(--text-main)]">
                        {(o.total / 100).toFixed(2)} {o.currency}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Bilete</span>
                      <span className="text-[var(--text-main)]">
                        {totalTickets} buc.
                      </span>
                    </div>

                    {/* будущий QR / cod acces */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex-1 text-[10px] text-[var(--text-muted)]">
                        În versiunea full aici vei avea codul / QR pentru acces.
                      </div>
                      <div className="grid h-12 w-12 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.98)] text-[9px] text-[var(--text-muted)]">
                        QR
                      </div>
                    </div>
                  </div>
                </div>

                {/* линия-разделитель și tipuri bilete */}
                <div className="border-t border-[var(--border-subtle)] bg-[rgba(2,9,8,0.96)] px-4 py-3 md:px-5">
                  <div className="grid gap-2 md:grid-cols-2">
                    {o.items.map((it) => (
                      <div
                        key={it.id}
                        className="
                          flex items-center justify-between
                          rounded-xl border border-[var(--border-subtle)]
                          bg-[rgba(3,17,13,0.96)]
                          px-3 py-2 text-[11px]
                        "
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text-main)]">
                            {it.ticketType?.name ?? "Tip bilet"}
                          </span>
                          <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                            x{it.quantity} ·{" "}
                            {(it.unitPrice / 100).toFixed(2)} {it.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
