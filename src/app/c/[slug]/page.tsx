// src/app/c/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categorie — BookingArt.ai",
};

type PageProps = {
  // В Next 16 params — Promise
  params: Promise<{ slug: string }>;
};

type CategoryMeta = {
  slug: string; // что в URL: /c/dj, /c/fotograf
  key: string; // короткий ключ
  label: string; // текст, который сохраняем в provider.categories
  emoji: string;
};

const CATEGORY_MAP: CategoryMeta[] = [
  { slug: "dj",        key: "dj",        label: "DJ",            emoji: "🎧" },
  { slug: "fotograf",  key: "photo",     label: "Fotograf",      emoji: "📷" },
  { slug: "videograf", key: "video",     label: "Videograf",     emoji: "🎥" },
  { slug: "live",      key: "live",      label: "Artiști Live",  emoji: "🎤" },
  { slug: "mc",        key: "mc",        label: "MC/Moderator",  emoji: "🎙️" },
  { slug: "decor",     key: "decor",     label: "Decor",         emoji: "🎈" },
  { slug: "light",     key: "light",     label: "Lumini/Sunet",  emoji: "✨" },
  { slug: "sali",      key: "halls",     label: "Săli",          emoji: "🏛️" },
  { slug: "bilete",    key: "tickets",   label: "Bilete",        emoji: "🎟️" },
  { slug: "catering",  key: "catering",  label: "Catering",      emoji: "🍽️" },
  { slug: "hostess",   key: "hostess",   label: "Hostess",       emoji: "💃" },
  { slug: "yachts",    key: "yachts",    label: "Yachts",        emoji: "🛥️" },
];

function resolveCategory(slug: string | undefined | null): CategoryMeta | null {
  if (!slug) return null;
  const s = slug.toLowerCase();

  return (
    CATEGORY_MAP.find((c) => c.slug === s) ||
    CATEGORY_MAP.find((c) => c.key === s) ||
    CATEGORY_MAP.find((c) => c.label.toLowerCase() === s) ||
    null
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = resolveCategory(slug);

  if (!category) notFound();

  const providers = await prisma.provider.findMany({
    where: {
      OR: [
        { categories: { has: category.label } },
        { categories: { has: category.key } },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      displayName: true,
      city: true,
      country: true,
      bio: true,
      categories: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const total = providers.length;

  return (
    <main className="mx-auto max-w-6xl min-h-[70vh] px-4 pb-12 pt-6 md:px-6">
      {/* HERO КАТЕГОРИИ */}
      <section
        className="
          relative overflow-hidden rounded-[30px]
          border border-[#16352a]
          bg-[radial-gradient(circle_at_0%_0%,rgba(15,70,49,0.6),transparent_55%),radial-gradient(circle_at_110%_120%,rgba(180,137,76,0.55),transparent_60%),#020806]
          px-5 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8
          shadow-[0_38px_160px_rgba(0,0,0,0.95)]
        "
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-black/70 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.22em] text-zinc-300 ring-1 ring-[#27513c]">
              <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-black/70 text-lg">
                {category.emoji}
              </span>
              <span className="text-[10px]">{category.label}</span>
            </div>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem] md:text-[2.35rem]">
              {category.label} pe{" "}
              <span className="text-[var(--accent)]">BookingArt</span>.
            </h1>
            <p className="mt-2 max-w-xl text-[13px] text-zinc-300">
              Artiști și furnizori selectați care lucrează pe zona de{" "}
              <span className="text-zinc-50">{category.label}</span> — pentru
              nunți, corporate, party-uri private și evenimente speciale.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 text-xs text-zinc-300 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] ring-1 ring-[#27513c]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {total === 0
                ? "Încă nu avem profiluri active în această categorie."
                : `${total} profil${total === 1 ? "" : "uri"} în această categorie`}
            </div>

            <div className="mt-1 flex flex-wrap gap-2">
              <a
                href="/categories"
                className="inline-flex items-center rounded-full bg-black/70 px-3 py-1.5 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:text-[var(--accent)]"
              >
                Toate categoriile →
              </a>
              <a
                href="/search"
                className="inline-flex items-center rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
              >
                Caută în toată platforma
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ЛИСТИНГ ПРОВАЙДЕРОВ */}
      {providers.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-[#1a3329] bg-black/80 px-4 py-5 text-sm text-zinc-300">
          Încă nu avem providerii în această categorie. Pe măsură ce artiștii și
          sălile se înrolează, profilurile lor vor apărea aici.
        </section>
      ) : (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => {
            const avatarFallback =
              p.displayName?.slice(0, 2).toUpperCase() ?? "PR";
            const location = [p.city, p.country ?? "RO"]
              .filter(Boolean)
              .join(", ");

            const sinceYear = p.createdAt.getFullYear();

            return (
              <a
                key={p.id}
                href={`/p/${p.id}`}
                className="
                  group relative flex h-full flex-col overflow-hidden
                  rounded-2xl border border-[#1a3a2e]
                  bg-[radial-gradient(circle_at_0%_0%,rgba(30,88,62,0.55),transparent_52%),radial-gradient(circle_at_120%_120%,rgba(170,135,82,0.45),transparent_60%),#030908]
                  p-3.5 md:p-4
                  shadow-[0_26px_110px_rgba(0,0,0,0.9)]
                  transition-transform duration-200
                  hover:-translate-y-1 hover:border-[var(--accent)]/85
                "
              >
                {/* Верх: аватар + имя + локация */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] rounded-2xl bg-[radial-gradient(circle_at_0%_0%,rgba(250,204,21,0.4),transparent_55%)] opacity-40 blur-xl" />
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/15 bg-black/80 shadow-[0_16px_55px_rgba(0,0,0,1)]">
                      <div className="grid h-full w-full place-items-center text-xs font-semibold tracking-wide text-zinc-100">
                        {avatarFallback}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-[15px] shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                      {category.emoji}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="truncate text-sm font-semibold text-zinc-50">
                        {p.displayName ?? "Artist / furnizor"}
                      </h2>
                      {location && (
                        <span className="flex-shrink-0 text-[10px] text-zinc-400">
                          {location}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Pe BookingArt din {sinceYear}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {p.bio && (
                  <p className="mt-3 line-clamp-3 text-[12px] leading-snug text-zinc-200">
                    {p.bio}
                  </p>
                )}

                {/* Категории / теги */}
                {p.categories && p.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.categories.slice(0, 3).map((raw) => (
                      <span
                        key={raw}
                        className="
                          rounded-full bg-black/70 px-2 py-[2px]
                          text-[10px] text-zinc-200
                          ring-1 ring-white/10
                        "
                      >
                        {raw}
                      </span>
                    ))}
                    {p.categories.length > 3 && (
                      <span className="rounded-full bg-black/60 px-2 py-[2px] text-[10px] text-zinc-400 ring-1 ring-white/5">
                        +{p.categories.length - 3} alte
                      </span>
                    )}
                  </div>
                )}

                {/* Низ: CTA */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="rounded-full bg-black/60 px-2.5 py-[5px] text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    Vezi profilul complet
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[13px] text-zinc-200 transition-colors group-hover:bg-[var(--accent)] group-hover:text-black">
                    →
                  </span>
                </div>
              </a>
            );
          })}
        </section>
      )}
    </main>
  );
}
