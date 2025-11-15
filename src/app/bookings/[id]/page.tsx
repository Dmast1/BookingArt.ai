// src/app/bookings/[id]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Detalii rezervare — BookingArt.ai",
};

type PageProps = {
  params: { id: string };
};

/* маленький helper, такой же как на /bookings */
function StatusBadge({ status }: { status: string }) {
  let cls =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide";
  let label = status;

  switch (status) {
    case "pending":
      cls += " border-amber-400/40 bg-amber-500/10 text-amber-100";
      label = "În așteptare";
      break;
    case "confirmed":
      cls += " border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
      label = "Confirmat";
      break;
    case "cancelled":
    case "canceled":
      cls += " border-red-400/40 bg-red-500/10 text-red-100";
      label = "Anulat";
      break;
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

export default async function BookingDetailsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=/bookings/${params.id}`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      provider: {
        select: {
          id: true,
          displayName: true,
          city: true,
          country: true,
          userId: true,
        },
      },
    },
  });

  if (!booking) return notFound();

  const isOwner =
    booking.userId === user.id ||
    booking.provider?.userId === user.id ||
    user.role === "ADMIN";

  if (!isOwner) {
    // чтобы чужие брони не светить
    return notFound();
  }

  const dateStr = formatDateTime(booking.date);
  const createdStr = formatDateTime(booking.createdAt);

  const shortId = booking.id.slice(0, 8);
  const priceLabel =
    typeof booking.priceGross === "number"
      ? `${booking.priceGross} €`
      : "—";
  const feeLabel =
    typeof booking.fee === "number" ? `${booking.fee} €` : "—";

  return (
    <section className="mx-auto max-w-3xl pb-12 pt-4">
      <a
        href="/bookings"
        className="text-xs text-zinc-500 hover:text-accent"
      >
        ← Înapoi la lista de rezervări
      </a>

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface/80 shadow-[0_30px_120px_rgba(0,0,0,.85)]">
        {/* header */}
        <div className="border-b border-line px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Rezervare #{shortId}
            </div>
            <h1 className="mt-1 text-xl font-semibold text-zinc-50">
              Eveniment în {booking.city ?? "—"}
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Creată la {createdStr}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          {/* Info eveniment */}
          <div className="space-y-3 text-sm text-zinc-300">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Detalii eveniment
            </h2>
            <dl className="space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Data & ora</dt>
                <dd className="text-zinc-100">{dateStr}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Oraș</dt>
                <dd className="text-zinc-100">
                  {booking.city ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Buget (brut)</dt>
                <dd className="text-zinc-100">{priceLabel}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Comision platformă</dt>
                <dd className="text-zinc-100">{feeLabel}</dd>
              </div>
            </dl>
          </div>

          {/* Client + provider */}
          <div className="space-y-3 text-sm text-zinc-300">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Părți implicate
            </h2>
            <div className="rounded-2xl border border-line bg-bg/80 px-3 py-2.5 text-xs">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Client
              </div>
              <div className="mt-1 text-zinc-100">
                {booking.user?.name ?? "Client BookingArt.ai"}
              </div>
              <div className="text-zinc-400">
                {booking.user?.email ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-bg/80 px-3 py-2.5 text-xs">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Artist / provider
              </div>
              <div className="mt-1 text-zinc-100">
                {booking.provider?.displayName ?? "Artist / furnizor"}
              </div>
              <div className="text-zinc-400">
                {[booking.provider?.city, booking.provider?.country ?? "RO"]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="border-t border-line px-5 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-zinc-500">
            În curând: atașarea contractelor, facturilor și timeline detaliat al
            plăților.
          </div>
          <div className="flex gap-2">
            <a
              href="/messages"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:border-accent/60 hover:text-accent"
            >
              Deschide chat pentru această rezervare
            </a>
            <a
              href="/bookings"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-black hover:brightness-110"
            >
              Înapoi la listă
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
