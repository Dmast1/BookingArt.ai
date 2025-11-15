// src/app/bookings/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Rezervări — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/bookings");
  }

  const role = (user.role as AppRole) ?? "GUEST";

  if (role === "ADMIN") {
    return <AdminBookings email={user.email ?? ""} />;
  }

  if (role === "PROVIDER") {
    return (
      <ProviderBookings
        userId={user.id}
        email={user.email ?? ""}
      />
    );
  }

  return (
    <ClientBookings
      userId={user.id}
      email={user.email ?? ""}
      role={role}
    />
  );
}

/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  let cls =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide";
  let label = status;

  switch (status) {
    case "pending":
      cls += " border-amber-400/40 bg-amber-500/10 text-amber-100";
      label = "În așteptare";
      break;
    case "accepted":
    case "confirmed":
      cls += " border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
      label = "Acceptat";
      break;
    case "declined":
      cls += " border-red-400/40 bg-red-500/10 text-red-100";
      label = "Respins";
      break;
    case "cancelled":
    case "canceled":
      cls += " border-red-400/40 bg-red-500/10 text-red-100";
      label = "Anulat";
      break;
    case "done":
    case "completed":
      cls += " border-zinc-400/40 bg-zinc-500/10 text-zinc-50";
      label = "Finalizat";
      break;
    default:
      cls += " border-zinc-400/40 bg-zinc-700/30 text-zinc-100";
      label = status;
  }

  return <span className={cls}>{label}</span>;
}

function formatDateTime(date: Date) {
  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number") return "—";
  return `${(value / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 0,
  })} €`;
}

/* =====================================================================
   CLIENT / GUEST
===================================================================== */

async function ClientBookings(props: {
  userId: string;
  email: string;
  role: AppRole;
}) {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: props.userId, date: { gte: now } },
      orderBy: { date: "asc" },
      include: {
        provider: { select: { displayName: true, city: true } },
      },
    }),
    prisma.booking.findMany({
      where: { userId: props.userId, date: { lt: now } },
      orderBy: { date: "desc" },
      take: 50,
      include: {
        provider: { select: { displayName: true, city: true } },
      },
    }),
  ]);

  return (
    <section className="mx-auto max-w-6xl space-y-6 pb-12 pt-4">
      {/* HERO */}
      <div
        className="
          relative overflow-hidden rounded-3xl border border-zinc-900/80
          bg-gradient-to-br from-[#020a06] via-[#050e0a] to-[#130c06]
          px-5 py-6 md:px-7 md:py-7
          shadow-[0_28px_140px_rgba(0,0,0,0.95)]
        "
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.35),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-10 bottom-[-35%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.22),transparent)] blur-3xl opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Rezervările mele
              <span className="opacity-40">•</span>
              <span className="text-[10px] font-normal normal-case tracking-normal text-zinc-400">
                {props.role === "GUEST" ? "cont guest" : "cont client"}
              </span>
            </div>
            <h1 className="text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
              Evenimentele rezervate prin BookingArt.ai
            </h1>
            <p className="mt-1 text-sm text-zinc-300">
              Toate rezervările asociate cu{" "}
              <span className="font-medium text-zinc-50">
                {props.email}
              </span>
              .
            </p>
          </div>

          <div className="mt-1 flex flex-col items-start gap-2 text-[11px] text-zinc-400 md:items-end">
            <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-300 ring-1 ring-white/10">
              {upcoming.length} viitoare · {past.length} în istoric
            </span>
            <p className="max-w-xs text-right text-[11px] text-zinc-400">
              Vezi statusul fiecărui eveniment, detaliile rezervării și
              deschide chatul direct cu artistul.
            </p>
          </div>
        </div>
      </div>

      {/* VIITOARE */}
      <div className="rounded-2xl border border-zinc-900/80 bg-black/70 p-4 shadow-[0_18px_80px_rgba(0,0,0,0.9)] md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Rezervări viitoare
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Evenimente programate în viitor, inclusiv cereri în așteptare.
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
            {upcoming.length} rezervări
          </span>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            Nu ai încă rezervări viitoare. Caută un artist sau o sală și
            pornește prima rezervare.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-200">
              <thead className="sticky top-0 border-b border-white/5 bg-black/80 text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Data & ora</th>
                  <th className="pb-2 pr-4">Artist / furnizor</th>
                  <th className="pb-2 pr-4">Oraș</th>
                  <th className="pb-2 pr-4">Preț estimat</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-2 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {upcoming.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 pr-4 text-zinc-100">
                      {formatDateTime(b.date)}
                    </td>
                    <td className="py-2.5 pr-4">
                      {b.provider?.displayName ?? "Artist / furnizor"}
                    </td>
                    <td className="py-2.5 pr-4">{b.city ?? "—"}</td>
                    <td className="py-2.5 pr-4">
                      {formatMoney(b.priceGross)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/bookings/${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Detalii
                        </a>
                        <a
                          href={`/chat?bookingId=${b.id}`}
                          className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] text-emerald-100 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25"
                        >
                          Chat
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISTORIC */}
      <div className="rounded-2xl border border-zinc-900/80 bg-black/70 p-4 shadow-[0_16px_70px_rgba(0,0,0,0.85)] md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Istoric rezervări
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Ultimele evenimente finalizate sau anulate.
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
            ultimele {past.length} intrări
          </span>
        </div>

        {past.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            După finalizarea primului eveniment, istoricul va apărea aici.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-200">
              <thead className="sticky top-0 border-b border-white/5 bg-black/80 text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Artist / furnizor</th>
                  <th className="pb-2 pr-4">Oraș</th>
                  <th className="pb-2 pr-4">Preț</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-2 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {past.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 pr-4">
                      {b.date.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 pr-4">
                      {b.provider?.displayName ?? "Artist / furnizor"}
                    </td>
                    <td className="py-2.5 pr-4">{b.city ?? "—"}</td>
                    <td className="py-2.5 pr-4">
                      {formatMoney(b.priceGross)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/bookings/${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Detalii
                        </a>
                        <a
                          href={`/chat?bookingId=${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Chat
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* =====================================================================
   PROVIDER
===================================================================== */

async function ProviderBookings(props: { userId: string; email: string }) {
  const provider = await prisma.provider.findUnique({
    where: { userId: props.userId },
    select: {
      id: true,
      displayName: true,
      city: true,
      country: true,
    },
  });

  if (!provider) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 pb-12 pt-4">
        <div className="rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#120806] via-[#05030f] to-[#02010a] px-5 py-6 shadow-[0_30px_120px_rgba(0,0,0,0.95)]">
          <h1 className="text-[1.8rem] font-semibold text-zinc-50">
            Rezervări ca provider
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Nu am găsit un profil de provider atașat acestui cont. După ce
            finalizezi înrolarea ca artist/furnizor, rezervările vor apărea
            aici.
          </p>
          <a
            href="/onboarding/provider"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
          >
            Pornește înrolarea ca provider
          </a>
        </div>
      </section>
    );
  }

  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: { providerId: provider.id, date: { gte: now } },
      orderBy: { date: "asc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.booking.findMany({
      where: { providerId: provider.id, date: { lt: now } },
      orderBy: { date: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  const location = [provider.city, provider.country ?? "RO"]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="mx-auto max-w-6xl space-y-6 pb-12 pt-4">
      {/* HERO PROVIDER */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#02010a] via-[#05030f] to-[#120806] px-5 py-6 md:px-7 md:py-7 shadow-[0_30px_150px_rgba(0,0,0,0.95)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.3),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-10 bottom-[-35%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.22),transparent)] blur-3xl opacity-80" />
        </div>

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Rezervări provider
            </div>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
              Evenimente pentru {provider.displayName}
            </h1>
            <p className="mt-1 text-sm text-zinc-300">
              {location && <span>Locație: {location} · </span>}
              cont:{" "}
              <span className="font-medium text-zinc-50">
                {props.email}
              </span>
            </p>
          </div>
          <div className="mt-2 flex flex-col items-start gap-1 text-[11px] text-zinc-400 md:items-end">
            <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-300 ring-1 ring-white/10">
              {upcoming.length} viitoare · {past.length} în istoric
            </span>
            <p className="max-w-xs text-right">
              Aici vezi cererile și rezervările confirmate, gata de livrat.
            </p>
          </div>
        </div>
      </div>

      {/* VIITOARE */}
      <div className="rounded-2xl border border-zinc-900/80 bg-black/70 p-4 shadow-[0_18px_80px_rgba(0,0,0,0.9)] md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Rezervări viitoare
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Confirmări, cereri în așteptare și evenimente viitoare.
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
            {upcoming.length} rezervări
          </span>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            Nu ai încă rezervări viitoare. Completează-ți profilul și
            disponibilitatea pentru a primi cereri.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-200">
              <thead className="sticky top-0 border-b border-white/5 bg-black/80 text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Data & ora</th>
                  <th className="pb-2 pr-4">Oraș</th>
                  <th className="pb-2 pr-4">Client</th>
                  <th className="pb-2 pr-4">Preț</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-2 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {upcoming.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 pr-4 text-zinc-100">
                      {formatDateTime(b.date)}
                    </td>
                    <td className="py-2.5 pr-4">{b.city ?? "—"}</td>
                    <td className="py-2.5 pr-4">
                      {b.user?.name ?? b.user?.email ?? b.userId ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      {formatMoney(b.priceGross)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/bookings/${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Detalii
                        </a>
                        <a
                          href={`/chat?bookingId=${b.id}`}
                          className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] text-emerald-100 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25"
                        >
                          Chat
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISTORIC */}
      <div className="rounded-2xl border border-zinc-900/80 bg-black/70 p-4 shadow-[0_16px_70px_rgba(0,0,0,0.85)] md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Istoric rezervări
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Evenimente deja livrate sau anulate.
            </p>
          </div>
        </div>

        {past.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            După primele evenimente, istoricul va apărea aici.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-200">
              <thead className="sticky top-0 border-b border-white/5 bg-black/80 text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Oraș</th>
                  <th className="pb-2 pr-4">Client</th>
                  <th className="pb-2 pr-4">Preț</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-2 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {past.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 pr-4">
                      {b.date.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 pr-4">{b.city ?? "—"}</td>
                    <td className="py-2.5 pr-4">
                      {b.user?.name ?? b.user?.email ?? b.userId ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      {formatMoney(b.priceGross)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/bookings/${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Detalii
                        </a>
                        <a
                          href={`/chat?bookingId=${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Chat
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* =====================================================================
   ADMIN
===================================================================== */

async function AdminBookings(props: { email: string }) {
  const [recent, stats] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { email: true } },
        provider: { select: { displayName: true } },
      },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return (
    <section className="mx-auto max-w-6xl space-y-6 pb-12 pt-4">
      {/* HERO ADMIN */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#02010a] via-[#05030f] to-[#120806] px-5 py-6 md:px-7 md:py-7 shadow-[0_30px_150px_rgba(0,0,0,0.95)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.3),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-10 bottom-[-35%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.35),transparent)] blur-3xl opacity-80" />
        </div>

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Panou admin
            </div>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
              Rezervări în toată platforma
            </h1>
            <p className="mt-1 text-sm text-zinc-300">
              Logat ca{" "}
              <span className="font-medium text-zinc-50">
                {props.email}
              </span>
              .
            </p>
          </div>
          <p className="max-w-xs text-[11px] text-zinc-400 md:text-right">
            MVP: overview rapid cu număr de rezervări pe status + ultimele
            rezervări create.
          </p>
        </div>
      </div>

      {/* STATISTICI */}
      <div className="grid gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.status}
            className="rounded-2xl border border-zinc-900/80 bg-black/75 px-4 py-3 text-xs shadow-[0_18px_70px_rgba(0,0,0,0.85)]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                {s.status}
              </span>
              <StatusBadge status={s.status} />
            </div>
            <div className="text-2xl font-semibold text-zinc-50">
              {s._count._all}
            </div>
          </div>
        ))}
      </div>

      {/* LISTĂ RECENTĂ */}
      <div className="rounded-2xl border border-zinc-900/80 bg-black/75 p-4 shadow-[0_18px_80px_rgba(0,0,0,0.9)] md:p-5">
        <h2 className="text-sm font-semibold text-zinc-100">
          Ultimele {recent.length} rezervări
        </h2>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            Nu există încă rezervări în sistem.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-200">
              <thead className="sticky top-0 border-b border-white/5 bg-black/80 text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Creat la</th>
                  <th className="pb-2 pr-4">Data eveniment</th>
                  <th className="pb-2 pr-4">Oraș</th>
                  <th className="pb-2 pr-4">Client</th>
                  <th className="pb-2 pr-4">Artist</th>
                  <th className="pb-2 pr-4">Preț</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-2 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {recent.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 pr-4">
                      {b.createdAt.toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 pr-4">
                      {formatDateTime(b.date)}
                    </td>
                    <td className="py-2.5 pr-4">{b.city ?? "—"}</td>
                    <td className="py-2.5 pr-4">
                      {b.user?.email ?? b.userId ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      {b.provider?.displayName ?? b.providerId ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      {formatMoney(b.priceGross)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/bookings/${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Detalii
                        </a>
                        <a
                          href={`/chat?bookingId=${b.id}`}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-accent"
                        >
                          Chat
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
