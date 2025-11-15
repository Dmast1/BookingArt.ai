import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Evenimentele mele — BookingArt.ai",
};

export default async function MyEventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/events/mine");

  const role = user.role ?? "GUEST";
  if (role !== "PROVIDER" && role !== "ADMIN") {
    redirect("/events");
  }

  let providerId: string | null = null;
  let providerName: string | null = null;

  if (role === "PROVIDER") {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true, displayName: true },
    });

    if (!provider) {
      return (
        <section className="mx-auto max-w-4xl space-y-4 pb-12 pt-4">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#120806] via-[#05030f] to-[#02010a] px-5 py-6 shadow-[0_28px_140px_rgba(0,0,0,0.95)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <div className="absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.35),transparent)] blur-3xl opacity-90" />
            </div>

            <h1 className="text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
              Evenimentele mele
            </h1>
            <p className="mt-2 text-sm text-zinc-300">
              Nu am găsit un profil de provider asociat acestui cont. După
              finalizarea onboarding-ului, vei putea crea și administra
              evenimente aici.
            </p>
            <a
              href="/onboarding/provider"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
            >
              Începe onboarding provider →
            </a>
          </div>
        </section>
      );
    }

    providerId = provider.id;
    providerName = provider.displayName;
  }

  const where =
    role === "PROVIDER"
      ? { providerId: providerId! }
      : {}; // admin vede toate

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return (
    <section className="mx-auto max-w-5xl space-y-5 pb-12 pt-4">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#020a06] via-[#050e0a] to-[#130c06] px-5 py-6 shadow-[0_28px_140px_rgba(0,0,0,0.95)] sm:px-7 sm:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.4),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-10 bottom-[-35%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.22),transparent)] blur-3xl opacity-80" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Evenimentele mele
              {providerName && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="text-[10px] font-normal normal-case tracking-normal text-zinc-300">
                    {providerName}
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
              Gestionează-ți evenimentele publice
            </h1>
            <p className="mt-1 text-sm text-zinc-300">
              Creează, actualizează și deschide paginile de eveniment pe care
              le promovezi prin BookingArt.ai.
            </p>
          </div>

          <a
            href="/events/new"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
          >
            + Eveniment nou
          </a>
        </div>
      </div>

      {/* LISTĂ EVENIMENTE */}
      {events.length === 0 ? (
        <div className="rounded-2xl border border-zinc-900/80 bg-black/70 px-4 py-4 text-sm text-zinc-300 shadow-[0_18px_80px_rgba(0,0,0,0.9)]">
          Momentan nu ai evenimente create. Poți adăuga primul tău eveniment cu
          butonul de mai sus.
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-zinc-900/80 bg-black/70 p-4 shadow-[0_18px_80px_rgba(0,0,0,0.9)]">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-100">
              Evenimente active
            </h2>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
              {events.length} evenimente
            </span>
          </div>

          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm transition hover:border-[var(--accent)]/60 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-50">
                    {e.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">
                    {e.city ?? "—"} ·{" "}
                    {e.date.toLocaleString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <a
                  href={`/events/${e.slug}`}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Deschide pagina →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
