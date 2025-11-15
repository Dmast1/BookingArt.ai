// src/app/onboarding/role/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RoleClient from "./RoleClient";

export default async function RoleOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/start"); // или /auth?next=/onboarding/role — как было задумано
  }

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
      {/* фоновые глоу */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-10%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,176,112,0.3),transparent_65%)] blur-3xl opacity-80" />
        <div className="absolute -right-24 bottom-[-15%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,61,48,0.65),transparent_65%)] blur-3xl opacity-80" />
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 md:flex-row md:items-center">
        {/* LEFT: контекст / смысл выбора роли */}
        <div className="md:w-1/2 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.9)] px-3 py-1 text-[10px] text-[var(--text-muted)] shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span>Pas 1 · Alege tipul de cont</span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[var(--text-main)] sm:text-[1.7rem]">
              Cum vrei să folosești{" "}
              <span className="text-[var(--accent)]">BookingArt</span>?
            </h1>
            <p className="mt-2 text-[13px] text-[var(--text-muted)] sm:text-[14px]">
              Poți oricând să revii și să-ți extinzi rolul: de la client la
              artist, de la artist la gazdă de locații. Acum alege doar punctul
              de start.
            </p>
          </div>

          <div className="hidden md:flex gap-4 text-[11px] text-[var(--text-muted)]">
            <div>
              <div className="text-[var(--accent)] text-xs font-semibold">Client</div>
              <p>Cauți artiști, săli și bilete pentru evenimentele tale.</p>
            </div>
            <div>
              <div className="text-[var(--accent)] text-xs font-semibold">Artist / Provider</div>
              <p>Oferi servicii (DJ, band, foto, video, decor, lumini etc.).</p>
            </div>
            <div>
              <div className="text-[var(--accent)] text-xs font-semibold">Locație / Corporate</div>
              <p>Administrezi săli, hoteluri sau spații de evenimente.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: стеклянный блок с выбором ролей */}
        <div className="md:w-1/2 md:pl-8 md:border-l md:border-[var(--border-subtle)]">
          <section
            className="
              rounded-[26px]
              border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)]
              shadow-[0_26px_90px_rgba(0,0,0,0.95)]
              backdrop-blur-[22px]
              px-4 py-5 sm:px-5 sm:py-6
            "
          >
            <div className="mb-4 text-left">
              <h2 className="text-base font-semibold text-[var(--text-main)] sm:text-lg">
                Alege rolul tău inițial
              </h2>
              <p className="mt-1 text-[12px] text-[var(--text-muted)] sm:text-[13px]">
                Nu e definitiv. Îți poți activa ulterior și alte roluri din
                setările contului.
              </p>
            </div>

            <RoleClient />
          </section>
        </div>
      </div>
    </main>
  );
}
