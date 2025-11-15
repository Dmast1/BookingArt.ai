// src/app/admin/tickets/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — Comenzi bilete",
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth?next=/admin/tickets");
  }
  return user;
}

export default async function AdminTicketsPage() {
  await requireAdmin();

  const orders = await prisma.ticketOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      event: { select: { title: true, city: true, date: true } },
    },
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        Comenzi de bilete (ultimele {orders.length})
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Ordere pentru bilete vândute prin BookingArt.ai.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface/80 p-4 text-xs text-zinc-300">
        <table className="min-w-full text-left">
          <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="pb-2 pr-4">Creat la</th>
              <th className="pb-2 pr-4">Email client</th>
              <th className="pb-2 pr-4">Eveniment</th>
              <th className="pb-2 pr-4">Oraș</th>
              <th className="pb-2 pr-4">Data eveniment</th>
              <th className="pb-2 pr-4">Total</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">ID</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {orders.map((o) => (
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
                  {o.event ? o.event.title : "—"}
                </td>
                <td className="py-2 pr-4">
                  {o.event ? o.event.city : "—"}
                </td>
                <td className="py-2 pr-4">
                  {o.event
                    ? o.event.date.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="py-2 pr-4">
                  {o.total} {o.currency}
                </td>
                <td className="py-2 pr-4">{o.status}</td>
                <td className="py-2 pr-4 font-mono text-[11px] text-zinc-400">
                  {o.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
