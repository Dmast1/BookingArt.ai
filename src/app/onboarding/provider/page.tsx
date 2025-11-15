import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProviderOnboardingForm from "./ProviderOnboardingForm";

export default async function ProviderOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/onboarding/provider");

  return (
    <main
      className="
        relative min-h-[calc(100vh-3.5rem)]
        px-4 py-6 md:px-6 md:py-10
        bg-[radial-gradient(60%_60%_at_0%_0%,rgba(11,61,48,0.55),transparent_60%),radial-gradient(60%_60%_at_100%_100%,rgba(57,5,23,0.45),transparent_60%),var(--bg)]
      "
    >
      {/* декоративные гловы */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-8%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(217,176,112,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute -right-24 bottom-[-10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(15,61,48,0.6),transparent_65%)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2">
        {/* ЛЕВАЯ колонка — текст (на мобиле компактнее) */}
        <section className="order-2 md:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-black/40 px-3 py-1 text-[10px] text-[var(--text-muted)] backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Onboarding provider · 2 minute
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-main)] sm:text-[1.85rem]">
            Creează-ți profilul de <span className="text-[var(--accent)]">artist / provider</span>
          </h1>

          <p className="mt-2 text-[13px] text-[var(--text-muted)] sm:text-[14px]">
            Un profil complet îți aduce mai multe rezervări, poziții mai bune în listări și mesaje directe de la clienți
            pregătiți să rezerve.
          </p>

          {/* шаги — скрываем на очень узких, показываем с md */}
          <ol className="mt-5 hidden gap-5 text-[11px] text-[var(--text-muted)] md:flex">
            <li>
              <div className="text-[var(--accent)] text-xs font-semibold">1</div>
              Adaugi numele afișat și orașul.
            </li>
            <li>
              <div className="text-[var(--accent)] text-xs font-semibold">2</div>
              Alegi categoria principală.
            </li>
            <li>
              <div className="text-[var(--accent)] text-xs font-semibold">3</div>
              Primești lead-uri și setezi pachete / calendar.
            </li>
          </ol>
        </section>

        {/* ПРАВАЯ колонка — карточка с формой */}
        <section className="order-1 md:order-2">
          <div
            className="
              mx-auto w-full max-w-[560px]
              rounded-[26px] border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.94)] backdrop-blur-xl
              shadow-[0_26px_90px_rgba(0,0,0,0.95)]
            "
          >
            <header className="px-4 pb-2 pt-5 sm:px-5">
              <h2 className="text-base font-semibold text-[var(--text-main)] sm:text-lg">
                Detalii profil provider
              </h2>
              <p className="mt-1 text-[12px] text-[var(--text-muted)] sm:text-[13px]">
                Completează câmpurile de mai jos. Poți reveni ulterior pentru a completa mai multe detalii.
              </p>
            </header>

            <div className="px-4 pb-5 sm:px-5">
              {/* ВАЖНО: сама форма должна быть full-width и иметь внутренние отступы между полями */}
              <ProviderOnboardingForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
