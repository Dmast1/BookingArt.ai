// src/app/admin/venues/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — Săli de evenimente",
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth?next=/admin/venues");
  }
  return user;
}

export default async function AdminVenuesPage() {
  await requireAdmin();

  const venues = await prisma.venue.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        Săli de evenimente (ultimele {venues.length})
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Locații listate pe BookingArt.ai.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface/80 p-4 text-xs text-zinc-300">
        <table className="min-w-full text-left">
          <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="pb-2 pr-4">Creat la</th>
              <th className="pb-2 pr-4">Nume</th>
              <th className="pb-2 pr-4">Oraș</th>
              <th className="pb-2 pr-4">Țară</th>
              <th className="pb-2 pr-4">Capacitate</th>
              <th className="pb-2 pr-4">Preț</th>
              <th className="pb-2 pr-4">Rating</th>
              <th className="pb-2 pr-4">ID</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {venues.map((v) => (
              <tr
                key={v.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="py-2 pr-4">
                  {v.createdAt.toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="py-2 pr-4">{v.name}</td>
                <td className="py-2 pr-4">{v.city}</td>
                <td className="py-2 pr-4">{v.country ?? "—"}</td>
                <td className="py-2 pr-4">
                  {v.capacityMin ?? "?"} – {v.capacityMax ?? "?"}
                </td>
                <td className="py-2 pr-4">
                  {v.priceFrom ?? "?"} – {v.priceTo ?? "?"} {v.currency}
                </td>
                <td className="py-2 pr-4">
                  {typeof v.rating === "number"
                    ? v.rating.toFixed(1)
                    : "—"}
                </td>
                <td className="py-2 pr-4 font-mono text-[11px] text-zinc-400">
                  {v.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
