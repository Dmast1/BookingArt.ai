// src/app/admin/events/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — Evenimente",
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth?next=/admin/events");
  }
  return user;
}

export default async function AdminEventsPage() {
  await requireAdmin();

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    take: 100,
    include: {
      venue: { select: { name: true, city: true } },
      provider: { select: { displayName: true } },
    },
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        Evenimente (ultimele {events.length})
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Lista evenimentelor publice cu bilete sau afiș pe platformă.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface/80 p-4 text-xs text-zinc-300">
        <table className="min-w-full text-left">
          <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="pb-2 pr-4">Data</th>
              <th className="pb-2 pr-4">Titlu</th>
              <th className="pb-2 pr-4">Oraș</th>
              <th className="pb-2 pr-4">Locație</th>
              <th className="pb-2 pr-4">Organizator</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Slug</th>
              <th className="pb-2 pr-4">ID</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {events.map((e) => (
              <tr
                key={e.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="py-2 pr-4">
                  {e.date.toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2 pr-4">{e.title}</td>
                <td className="py-2 pr-4">{e.city}</td>
                <td className="py-2 pr-4">
                  {e.venue
                    ? `${e.venue.name} (${e.venue.city})`
                    : "—"}
                </td>
                <td className="py-2 pr-4">
                  {e.provider?.displayName ?? "—"}
                </td>
                <td className="py-2 pr-4">{e.status ?? "—"}</td>
                <td className="py-2 pr-4">{e.slug}</td>
                <td className="py-2 pr-4 font-mono text-[11px] text-zinc-400">
                  {e.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
