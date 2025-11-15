import CategoryGrid from "@/components/home/CategoryGrid";

const FEATURED_EVENTS = [
  {
    id: 1,
    title: "Late Checkout · Disco Night",
    city: "București",
    date: "Sâmbătă · 12 oct",
    image: "/images/hero/club.jpg",
    tag: "Highlight",
    priceFrom: "de la 80 Lei",
  },
  {
    id: 2,
    title: "Wedding Showcase Live Band",
    city: "Cluj-Napoca",
    date: "Duminică · 27 oct",
    image: "/images/hero/wedding.jpg",
    tag: "Recomandat",
    priceFrom: "de la 120 Lei",
  },
  {
    id: 3,
    title: "Sunset Yacht Party",
    city: "Constanța",
    date: "Vineri · 8 nov",
    image: "/images/hero/yacht.jpg",
    tag: "Limited",
    priceFrom: "Locuri limitate",
  },
];

const FEATURED_ACTIVITIES = [
  {
    id: 1,
    title: "Salt cu parașuta",
    city: "Brașov",
    duration: "4–5 ore",
    image: "/images/hero/skydiving.jpg",
    tag: "Adrenalină",
  },
  {
    id: 2,
    title: "Tur ghidat la muzeu",
    city: "București",
    duration: "2 ore",
    image: "/images/hero/museum.jpg",
    tag: "Cultură",
  },
  {
    id: 3,
    title: "Croazieră la apus pe iaht",
    city: "Constanța",
    duration: "Seara",
    image: "/images/hero/yacht-activity.jpg",
    tag: "Yacht",
  },
  {
    id: 4,
    title: "Scuba diving experience",
    city: "Mamaia",
    duration: "Half-day",
    image: "/images/hero/diving.jpg",
    tag: "Diving",
  },
];

const FEATURED_PROVIDERS = [
  {
    id: 1,
    name: "DJ Nova",
    role: "DJ · party / nunți",
    city: "București",
    rating: "4.9",
    avatar: "/images/hero/dj.jpg",
    slug: "dj-nova",
  },
  {
    id: 2,
    name: "Luma Events",
    role: "Foto + video",
    city: "Cluj-Napoca",
    rating: "4.8",
    avatar: "/images/hero/photographer.jpg",
    slug: "luma-events",
  },
  {
    id: 3,
    name: "Aurora Hall",
    role: "Sală evenimente",
    city: "Iași",
    rating: "5.0",
    avatar: "/images/hero/venue.jpg",
    slug: "aurora-hall",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-3 md:px-6 lg:pt-5">
      {/* КАТЕГОРИИ */}
      <section className="mb-7">
        <CategoryGrid />
      </section>

      {/* EVENIMENTE CU BILETE */}
      <section className="mt-2">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="chip chip--accent hidden sm:inline-flex">
              Bilete
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-main)] md:text-lg">
                Evenimente cu bilete
              </h2>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)] md:text-xs">
                Alege un eveniment deja confirmat și cumpără bilete direct.
              </p>
            </div>
          </div>
          <a
            href="/events"
            className="text-[11px] text-[var(--text-muted)] hover:text-accent md:text-xs"
          >
            Vezi toate →
          </a>
        </div>

        <div className="-mx-4 md:mx-0">
          <div
            className="
              flex md:grid md:grid-cols-3
              gap-3 md:gap-4
              overflow-x-auto md:overflow-visible
              snap-x snap-mandatory md:snap-none
              px-4 pb-2 md:px-0
            "
          >
            {FEATURED_EVENTS.map((ev, index) => (
              <a
                key={ev.id}
                href="/events"
                className={`
                  group relative
                  min-w-[88%] max-w-[88%] snap-center
                  sm:min-w-[260px] sm:max-w-none sm:snap-start
                  overflow-hidden rounded-[26px]
                  border border-[var(--border-subtle)]
                  bg-[rgba(3,17,13,0.96)]
                  shadow-[0_26px_90px_rgba(0,0,0,1)]
                  backdrop-blur-[22px]
                  transition-transform duration-300
                  hover:-translate-y-1
                  hover:border-[var(--border-accent)]
                  ${index === 0 ? "cat-pop" : ""}
                `}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative h-44 w-full overflow-hidden md:h-52">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />

                  {/* стеклянные градиенты */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020908] via-black/75 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020908]/98 via-[#03110D]/95 to-transparent" />

                  {/* бейдж и дата */}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[rgba(3,17,13,0.96)] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-main)]">
                    <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" />
                    {ev.tag}
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-[var(--text-main)]">
                    {ev.date}
                  </div>

                  {/* текст + CTA */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-3.5 pb-3.5 pt-5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-main)] md:text-sm">
                        {ev.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        {ev.city} · {ev.priceFrom}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="
                        inline-flex flex-shrink-0 items-center justify-center
                        rounded-full
                        bg-[var(--accent)]
                        px-3 py-1.5
                        text-[11px] font-semibold text-[#1b1207]
                        shadow-[0_14px_32px_rgba(0,0,0,0.7)]
                        transition-transform duration-150
                        group-hover:translate-y-[1px]
                      "
                    >
                      Detalii
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITĂȚI & EXPERIENȚE */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="chip hidden sm:inline-flex">Activități</div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-main)] md:text-lg">
                Activități &amp; experiențe
              </h2>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)] md:text-xs">
                De la salt cu parașuta și croaziere pe iaht până la tururi de
                muzeu și diving.
              </p>
            </div>
          </div>
          <a
            href="/activitati"
            className="text-[11px] text-[var(--text-muted)] hover:text-accent md:text-xs"
          >
            Vezi toate activitățile →
          </a>
        </div>

        <div className="-mx-4 md:mx-0">
          <div
            className="
              flex md:grid md:grid-cols-4
              gap-3 md:gap-4
              overflow-x-auto md:overflow-visible
              snap-x snap-mandatory md:snap-none
              px-4 pb-2 md:px-0
            "
          >
            {FEATURED_ACTIVITIES.map((act, index) => (
              <a
                key={act.id}
                href="/activitati"
                className={`
                  group relative
                  min-w-[70%] max-w-[70%] snap-center
                  sm:min-w-[220px] sm:max-w-none sm:snap-start
                  overflow-hidden rounded-[24px]
                  border border-[var(--border-subtle)]
                  bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.14),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(6,32,26,1),rgba(3,17,13,1))]
                  shadow-[0_20px_70px_rgba(0,0,0,0.95)]
                  backdrop-blur-[18px]
                  transition-transform duration-300
                  hover:-translate-y-1
                  hover:border-[var(--border-accent)]
                  ${index === 0 ? "cat-pop" : ""}
                `}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative h-32 w-full overflow-hidden md:h-36">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020908] via-black/75 to-transparent" />

                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[rgba(3,17,13,0.96)] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-main)]">
                    <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" />
                    {act.tag}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 px-3.5 py-3">
                  <p className="line-clamp-2 text-[13px] font-semibold text-[var(--text-main)] md:text-sm">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {act.city} · {act.duration}
                  </p>
                  <span className="mt-1 inline-flex text-[10px] text-[var(--text-muted)]">
                    Descoperă mai multe activități →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDERI RECOMANDAȚI */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="chip hidden sm:inline-flex">Top provideri</div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-main)] md:text-lg">
                Provideri recomandați
              </h2>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)] md:text-xs">
                Artiști și locații verificați, cu rating mare și feedback bun.
              </p>
            </div>
          </div>
          <a
            href="/providers"
            className="text-[11px] text-[var(--text-muted)] hover:text-accent md:text-xs"
          >
            Vezi toți →
          </a>
        </div>

        <div className="-mx-4 md:mx-0">
          <div
            className="
              flex md:grid md:grid-cols-3
              gap-3 md:gap-4
              overflow-x-auto md:overflow-visible
              snap-x snap-mandatory md:snap-none
              px-4 pb-2 md:px-0
            "
          >
            {FEATURED_PROVIDERS.map((p, index) => (
              <a
                key={p.id}
                href={`/p/${p.slug}`}
                className={`
                  group min-w-[88%] max-w-[88%] snap-center
                  sm:min-w-[260px] sm:max-w-none sm:snap-start
                  overflow-hidden rounded-[26px]
                  border border-[var(--border-subtle)]
                  bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.12),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.98),rgba(3,17,13,0.98))]
                  shadow-[0_26px_90px_rgba(0,0,0,1)]
                  backdrop-blur-[22px]
                  p-3.5 pr-4
                  text-sm text-[var(--text-main)]
                  flex items-center gap-3.5
                  transition-transform duration-300
                  hover:-translate-y-1
                  hover:border-[var(--border-accent)]
                  hover:bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.18),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(6,32,26,1),rgba(3,17,13,1))]
                  ${index === 0 ? "cat-pop" : ""}
                `}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {/* аватарка + кольцо + рейтинг-кружок */}
                <div className="relative flex-shrink-0">
                  <div
                    className="
                      pointer-events-none absolute inset-[-3px]
                      rounded-full
                      bg-[conic-gradient(from_140deg,var(--accent),transparent,rgba(217,176,112,0.05),var(--accent))]
                      opacity-0 blur-[2px]
                      transition-opacity duration-300
                      group-hover:opacity-100
                    "
                  />
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[rgba(245,245,245,0.12)] bg-[#020908] md:h-13 md:w-13">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                    {/* бейдж рейтинга */}
                    <div
                      className="
                        absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center
                        rounded-full bg-[rgba(3,17,13,0.98)]
                        border border-[rgba(217,176,112,0.6)]
                        text-[9px] font-semibold text-[var(--accent)]
                        shadow-[0_10px_25px_rgba(0,0,0,0.9)]
                      "
                    >
                      {p.rating}
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full border border-[#020908] bg-emerald-500" />
                </div>

                {/* текстовая часть */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold md:text-sm">
                    {p.name}
                  </p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    {p.role} · {p.city}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                    <span>Preferat de clienți</span>
                  </div>
                </div>

                <span className="ml-1 text-[18px] text-[var(--text-muted)] group-hover:text-accent">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* НИЖНИЙ CTA */}
      <section className="mt-12">
        <div
          className="
            card-panel card-panel--premium
            flex flex-col items-start justify-between gap-3
            bg-gradient-to-r from-[#06201A] via-[#020908] to-[#06201A]
            px-4 py-4 md:flex-row md:items-center md:px-6
          "
        >
          <div>
            <p className="text-[13px] text-[var(--text-main)] md:text-sm">
              Vrei să apari mai sus în rezultate și să primești mai multe
              lead-uri directe?
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)] md:text-xs">
              Completează-ți profilul și activează-ți vizibilitatea premium în
              BookingArt.ai.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/settings" className="btn-primary">
              Completează profilul
            </a>
            <a href="/dashboard" className="btn-ghost">
              Deschide dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
