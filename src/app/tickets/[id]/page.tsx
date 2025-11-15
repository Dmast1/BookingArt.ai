// src/app/tickets/[id]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: "Detalii bilet — BookingArt.ai",
};

export default async function TicketOrderPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=/tickets/${params.id}`);
  }

  const order = await prisma.ticketOrder.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      items: {
        include: {
          ticketType: true,
        },
      },
    },
  });

  if (!order) return notFound();

  // доступ: владелец или админ
  const isOwner = order.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return notFound();
  }

  const createdAt = order.createdAt.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventDate = order.event
    ? order.event.date.toLocaleString("ro-RO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const totalFormatted = (order.total / 100).toFixed(2);

  return (
    <section className="mx-auto max-w-3xl pb-12 pt-4">
      <a
        href="/tickets"
        className="text-xs text-zinc-400 hover:text-accent"
      >
        ← Înapoi la biletele mele
      </a>

      <div className="mt-4 rounded-3xl border border-line bg-surface/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,.85)]">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">
              Comandă bilete #{order.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Plasată la {createdAt}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </header>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm text-zinc-300">
            <h2 className="text-sm font-semibold text-zinc-100">
              Eveniment
            </h2>
            {order.event ? (
              <>
                <p className="text-zinc-200">{order.event.title}</p>
                <p className="text-xs text-zinc-400">
                  {order.event.city}
                </p>
                {eventDate && (
                  <p className="text-xs text-zinc-400">
                    Data: {eventDate}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-zinc-400">
                Evenimentul nu mai este disponibil.
              </p>
            )}

            <div className="pt-2 text-xs text-zinc-500">
              Email comandă:{" "}
              <span className="text-zinc-200">{order.email}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-zinc-300">
            <h2 className="text-sm font-semibold text-zinc-100">
              Rezumat plată
            </h2>
            <ul className="space-y-1 text-xs">
              {order.items.map((it) => {
                const type = it.ticketType;
                const name = type?.name ?? "Bilet";
                const priceFormatted = (it.unitPrice / 100).toFixed(2);

                return (
                  <li
                    key={it.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {name} × {it.quantity}
                    </span>
                    <span>
                      {priceFormatted} {it.currency}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-zinc-400">Total</span>
              <span className="text-sm font-semibold text-zinc-50">
                {totalFormatted} {order.currency}
              </span>
            </div>

            <p className="mt-2 text-[11px] text-zinc-500">
              Pentru MVP, plata online nu este încă integrată. Statusul
              poate fi actualizat manual în backend (paid / canceled).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let color =
    "border-zinc-600 bg-zinc-800/60 text-zinc-100";
  let label = status;

  if (normalized === "paid") {
    color =
      "border-emerald-500/50 bg-emerald-500/10 text-emerald-200";
    label = "Plătit";
  } else if (normalized === "pending") {
    color =
      "border-amber-500/50 bg-amber-500/10 text-amber-200";
    label = "În așteptare";
  } else if (normalized === "canceled") {
    color = "border-red-500/50 bg-red-500/10 text-red-200";
    label = "Anulat";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] ${color}`}
    >
      {label}
    </span>
  );
}
