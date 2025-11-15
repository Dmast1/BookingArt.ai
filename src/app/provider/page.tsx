// src/app/provider/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import ProviderCompanyForm from "./ProviderCompanyForm";

export const metadata: Metadata = {
  title: "Devino provider — BookingArt.ai",
};

export default async function ProviderSignupPage() {
  const user = await getCurrentUser();

  // если юзер не залогинен — отправляем логиниться, потом вернётся сюда
  if (!user) {
    redirect("/auth?next=/provider");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-6">
      {/* Hero block */}
      <section className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#050509] via-[#05030f] to-[#140a08] px-6 py-6 shadow-[0_26px_120px_rgba(0,0,0,0.9)] md:px-8 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Înregistrare provider / firmă
            </div>
            <h1 className="mt-3 text-2xl font-semibold leading-tight text-zinc-50 md:text-[2rem]">
              Creează-ți contul de provider cu date oficiale de firmă.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400 md:text-[15px]">
              Completează datele companiei pentru contracte, facturare și badge
              „Verificat”. Clientul vede că lucrează cu un furnizor serios,
              la fel ca pe Booking.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-50">
            <div className="font-semibold uppercase tracking-wide text-emerald-200">
              Cont logat
            </div>
            <div className="mt-1 text-[13px] text-emerald-50/90">
              Vei înrola firma pe adresa:{" "}
              <span className="font-medium text-emerald-100">
                {user.email ?? "—"}
              </span>
              . Datele pot fi editate ulterior în setări.
            </div>
          </div>
        </div>
      </section>

      {/* Форма компании */}
      <section className="mt-8">
        <ProviderCompanyForm userEmail={user.email ?? ""} />
      </section>
    </main>
  );
}