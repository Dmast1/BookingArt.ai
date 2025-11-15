import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ClientOnboardingForm from "./ClientOnboardingForm";

export default async function ClientOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/onboarding/client");

  return (
    <main
      className="
        relative overflow-hidden
        min-h-[calc(100vh-3.5rem)]
        md:min-h-[calc(100vh-4rem)]
        px-4 py-4 md:px-6 md:py-8
        flex items-start md:items-center justify-center
        bg-[radial-gradient(circle_at_top,rgba(11,61,48,0.6),transparent_60%),radial-gradient(circle_at_bottom,rgba(57,5,23,0.55),transparent_65%),var(--bg)]
      "
    >
      {/* фоновые гловы */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-10%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,176,112,0.3),transparent_65%)] blur-3xl opacity-80" />
        <div className="absolute -right-24 bottom-[-15%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,61,48,0.65),transparent_65%)] blur-3xl opacity-80" />
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 md:flex-row md:items-center">
        {/* LEFT: текст / смысл */}
        <div className="md:w-1/2 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.9)] px-3 py-1 text-[10px] text-[var(--text-muted)] shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span>Onboarding client · 1 minut</span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)] sm:text-[1.7rem]">
              Personalizăm{" "}
              <span className="text-[var(--accent)]">BookingArt</span> pentru tine
            </h1>
            <p className="mt-2 text-[13px] text-[var(--text-muted)] sm:text-[14px]">
              Cu câteva detalii despre tine putem recomanda artiști, săli și
              evenimente mai relevante pentru stilul și orașul tău.
            </p>
          </div>

          <div className="hidden md:flex gap-4 text-[11px] text-[var(--text-muted)]">
            <div>
              <div className="text-[var(--accent)] text-xs font-semibold">1</div>
              <p>Completezi nume, email și oraș.</p>
            </div>
            <div>
              <div className="text-[var(--accent)] text-xs font-semibold">2</div>
              <p>Primești recomandări filtrate pe zona ta.</p>
            </div>
            <div>
              <div className="text-[var(--accent)] text-xs font-semibold">3</div>
              <p>Salvezi preferințe și evenimente în cont.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: стеклянная панель с формой */}
        <div className="md:w-1/2 md:pl-8 md:border-l md:border-[var(--border-subtle)]">
          <div
            className="
              rounded-[26px]
              border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)]
              shadow-[0_26px_90px_rgba(0,0,0,0.95)]
              backdrop-blur-[22px]
              px-4 py-5 sm:px-5 sm:py-6
            "
          >
            <h2 className="text-base font-semibold text-[var(--text-main)] sm:text-lg">
              Detalii profil client
            </h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)] sm:text-[13px]">
              Poți schimba aceste informații oricând în setările contului.
            </p>

            <div className="mt-4">
              <ClientOnboardingForm
                defaultName={user.name ?? ""}
                defaultEmail={user.email ?? ""}
                // если в типе User нет city – просто прилетит пустая строка
                // @ts-ignore
                defaultCity={user.city ?? ""}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
