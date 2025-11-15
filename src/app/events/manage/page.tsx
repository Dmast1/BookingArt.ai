// src/app/events/manage/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Evenimentele mele — BookingArt.ai",
};

export default async function ManageEventsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/events/manage");
  }

  if (user.role !== "PROVIDER" && user.role !== "ADMIN") {
    redirect("/events");
  }

  let where: any = {};
  let providerName: string | null = null;

  if (user.role === "PROVIDER") {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true, displayName: true },
    });

    if (!provider) {
      return (
        <section className="mx-auto max-w-3xl pb-12 pt-4">
          <h1 className="text-xl font-semibold text-zinc-50">
            Evenimentele mele
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Nu am găsit un profil provider asociat. După înrolare poți adăuga
            concerte și show-uri aici.
          </p>
          <a
            href="/onboarding/provider"
            className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
          >
            Pornește înrolarea ca provider
          </a>
        </section>
      );
    }

    where.providerId = provider.id;
    providerName = provider.displayName;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            {user.role === "PROVIDER"
              ? "Evenimentele mele"
              : "Evenimente (Admin)"}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {user.role === "PROVIDER"
              ? providerName
                ? `Listă de evenimente publice pentru ${providerName}.`
                : "Evenimentele tale publice."
              : "Toate evenimentele din platformă."}
          </p>
        </div>
        <a
          href="/events/new"
          className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          + Creează eveniment
        </a>
      </header>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm text-zinc-400">
          Momentan nu ai evenimente active. Creează primul concert sau show cu
          butonul de mai sus.
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface/80 p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 pr-4">Titlu</th>
                  <th className="pb-2 pr-4">Oraș</th>
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Preț de la</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Link public</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {events.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2 pr-4 text-zinc-100">{e.title}</td>
                    <td className="py-2 pr-4">{e.city}</td>
                    <td className="py-2 pr-4">
                      {e.date.toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      {typeof e.priceFrom === "number"
                        ? `${e.priceFrom} ${e.currency ?? "EUR"}`
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-zinc-200">
                      {e.status ?? "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <a
                        href={`/events/${e.slug}`}
                        className="text-[11px] text-accent hover:underline"
                      >
                        Deschide →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            În viitor vom adăuga editare/ștergere, management de bilete și
            export de rapoarte.
          </p>
        </div>
      )}
    </section>
  );
}
