import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewEventForm from "./NewEventForm";

export const metadata: Metadata = { title: "Creează eveniment — BookingArt.ai" };

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/events/new");
  if (user.role !== "PROVIDER" && user.role !== "ADMIN") redirect("/events");

  let provider: { id: string; displayName: string | null; city: string | null; country: string | null } | null = null;
  if (user.role === "PROVIDER") {
    provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true, displayName: true, city: true, country: true },
    });
  }

  if (user.role === "PROVIDER" && !provider) {
    return (
      <section className="mx-auto max-w-4xl pb-12 pt-4">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#120806] via-[#05030f] to-[#02010a] px-5 py-6 shadow-[0_28px_140px_rgba(0,0,0,0.95)]">
          <h1 className="text-[1.9rem] font-semibold leading-tight text-zinc-50">Creează eveniment</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Nu am găsit un profil provider asociat contului tău. Te rugăm să finalizezi înrolarea ca artist / furnizor.
          </p>
          <a href="/onboarding/provider" className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black">
            Pornește înrolarea ca provider →
          </a>
        </div>
      </section>
    );
  }

  const locationHint =
    provider && (provider.city || provider.country)
      ? [provider.city, provider.country ?? "RO"].filter(Boolean).join(", ")
      : "";

  return (
    <section className="mx-auto max-w-5xl space-y-6 pb-12 pt-4">
      <div className="rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#020a06] via-[#050e0a] to-[#130c06] px-5 py-6 shadow-[0_28px_140px_rgba(0,0,0,0.95)] sm:px-7 sm:py-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Eveniment nou {provider?.displayName && <><span className="opacity-40">•</span><span className="text-[10px] text-zinc-300">{provider.displayName}</span></>}
        </div>
        <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">Creează un nou eveniment public</h1>
        <p className="mt-1 text-sm text-zinc-300">Completează detaliile de bază. Ulterior — ticketing, contracte și plăți.</p>
      </div>

      <NewEventForm
        isAdmin={user.role === "ADMIN"}
        defaultCity={locationHint}
        defaultCurrency="EUR"
        myProviderId={provider?.id ?? null}
      />
    </section>
  );
}
