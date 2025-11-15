import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TicketTypesEditor } from "@/components/admin/TicketTypesEditor";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function EventTicketsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      venue: { select: { name: true, city: true } },
      ticketTypes: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    return notFound();
  }

  const dateStr = event.date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const initialTypes = event.ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    price: t.price,
    currency: t.currency,
    total: t.total,
    sold: t.sold,
  }));

  return (
    <section className="mx-auto max-w-4xl pb-12 pt-4">
      <a
        href="/admin/events"
        className="text-xs text-zinc-500 hover:text-accent"
      >
        ← Înapoi la evenimente
      </a>

      <div className="mt-3 rounded-2xl border border-line bg-surface/80 p-4">
        <h1 className="text-lg font-semibold text-zinc-100">
          Bilete — {event.title}
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          {event.city} · {dateStr}
          {event.venue && (
            <> · sală: {event.venue.name} ({event.venue.city})</>
          )}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Configurează tipuri de bilete (ex. General, VIP), prețuri și
          numărul total de bilete disponibile. Vânzările efective se văd în
          comenzi.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface/80 p-4">
        <TicketTypesEditor eventId={event.id} initialTypes={initialTypes} />
      </div>
    </section>
  );
}
