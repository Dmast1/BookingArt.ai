// src/app/events/[slug]/tickets/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bilete eveniment — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";
type PageProps = { params: { slug: string } };

// int (bani / cents) -> "10.000,00 EUR"
function formatMoney(amount: number, currency: string) {
  const value = amount / 100;
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function EventTicketsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=/events/${params.slug}/tickets`);
  }

  const role = (user.role as AppRole) ?? "GUEST";
  if (role !== "PROVIDER" && role !== "ADMIN") {
    // клиент/гость сюда не должен попадать
    redirect(`/events/${params.slug}`);
  }

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      provider: { select: { id: true, userId: true, displayName: true } },
      ticketTypes: { orderBy: { price: "asc" } },
      ticketOrders: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!event) {
    redirect("/events");
  }

  // безопасность: провайдер может управлять только своими событиями
  if (
    role === "PROVIDER" &&
    event.provider &&
    event.provider.userId !== user.id
  ) {
    redirect(`/events/${event.slug}`);
  }

  const dateStr = event.date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">
            Bilete — {event.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {event.city} · {dateStr}
            <br />
            Organizator:{" "}
            <span className="text-zinc-100">
              {event.provider?.displayName ?? "—"}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 text-xs md:items-end">
          <a
            href={`/events/${event.slug}`}
            className="text-zinc-400 hover:text-accent"
          >
            ← Înapoi la pagina evenimentului
          </a>
          <a
            href={`/events/${event.slug}/edit`}
            className="inline-flex items-center rounded-xl border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:border-accent/70 hover:text-accent"
          >
            Editează detaliile evenimentului
          </a>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tipuri de bilete */}
        <div className="rounded-2xl border border-line bg-surface/80 p-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Tipuri de bilete
          </h2>

          {event.ticketTypes.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              Încă nu există tipuri de bilete pentru acest eveniment.
            </p>
          ) : (
            <table className="mt-3 w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Nume</th>
                  <th className="pb-2 pr-4">Preț</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2 pr-4">Vândute</th>
                </tr>
              </thead>
              <tbody>
                {event.ticketTypes.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2 pr-4 text-zinc-100">{t.name}</td>
                    <td className="py-2 pr-4">
                      {formatMoney(t.price, t.currency)}
                    </td>
                    <td className="py-2 pr-4">{t.total}</td>
                    <td className="py-2 pr-4">{t.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Comenzi recente */}
        <div className="rounded-2xl border border-line bg-surface/80 p-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Comenzi recente
          </h2>

          {event.ticketOrders.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              Nu există încă comenzi pentru acest eveniment.
            </p>
          ) : (
            <table className="mt-3 w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Creat la</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {event.ticketOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2 pr-4">
                      {o.createdAt.toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4">{o.email}</td>
                    <td className="py-2 pr-4">
                      {formatMoney(o.total, o.currency)}
                    </td>
                    <td className="py-2 pr-4">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}