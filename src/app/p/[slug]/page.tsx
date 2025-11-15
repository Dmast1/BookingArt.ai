// src/app/p/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import PublicProviderCalendar, {
  type DayInput,
  type Status,
} from "./PublicProviderCalendar";
import {
  Globe2,
  Instagram,
  Youtube,
  Facebook,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Profil provider — BookingArt.ai",
};

/* ---------- categorii pentru badge / filtre ---------- */
const CATS = [
  { key: "dj", label: "DJ", emoji: "🎧", href: "/c/dj" },
  { key: "photo", label: "Fotograf", emoji: "📷", href: "/c/fotograf" },
  { key: "video", label: "Videograf", emoji: "🎥", href: "/c/videograf" },
  { key: "live", label: "Artiști Live", emoji: "🎤", href: "/c/live" },
  { key: "mc", label: "MC/Moderator", emoji: "🎙️", href: "/c/mc" },
  { key: "decor", label: "Decor", emoji: "🎈", href: "/c/decor" },
  { key: "light", label: "Lumini/Sunet", emoji: "✨", href: "/c/light" },
  { key: "halls", label: "Săli", emoji: "🏛️", href: "/c/sali" },
  { key: "tickets", label: "Bilete", emoji: "🎟️", href: "/c/bilete" },
  { key: "catering", label: "Catering", emoji: "🍽️", href: "/c/catering" },
  { key: "hostess", label: "Hostess", emoji: "💃", href: "/c/hostess" },
  { key: "yachts", label: "Yachts", emoji: "🛥️", href: "/c/yachts" },
] as const;

function resolveCategoryMeta(raw: string | null | undefined) {
  if (!raw) return null;
  const val = raw.trim();
  if (!val) return null;
  const lower = val.toLowerCase();

  return (
    CATS.find((c) => c.key === lower) ||
    CATS.find((c) => c.label.toLowerCase() === lower) || {
      key: lower,
      label: val,
      emoji: "🎭",
      href: "#",
    }
  );
}

/* ---------- format preț ---------- */
function formatPrice(amount: number, currencyRaw?: string | null) {
  const currency = currencyRaw || "EUR";
  const value = amount / 100;
  const formatted = value.toLocaleString("ro-RO", {
    minimumFractionDigits: value % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return currency === "EUR" ? `${formatted} €` : `${formatted} ${currency}`;
}

/* ---------- pagina ---------- */

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ requested?: string; date?: string }>;
};

export default async function ProviderPublicPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const sp = (await searchParams) ?? {};
  const requested = sp.requested === "1";
  const requestedDate = sp.date ?? null;

  const [provider, currentUser] = await Promise.all([
    prisma.provider.findUnique({
      where: { id: slug },
      select: {
        id: true,
        userId: true,
        displayName: true,
        city: true,
        country: true,
        bio: true,
        categories: true,
        websiteUrl: true,
        youtubeUrl: true,
        instagramUrl: true,
        facebookUrl: true,
        avatarUrl: true,
        verified: true,
        user: { select: { avatarUrl: true } },
        packages: {
          where: { isPublic: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            imageUrl: true,
            tag: true,
            durationHours: true,
            maxPeople: true,
            isHighlight: true,
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!provider) notFound();

  const availability = await prisma.availability.findMany({
    where: { providerId: provider.id },
    orderBy: { date: "asc" },
    take: 120,
    select: { date: true, status: true },
  });

  const days: DayInput[] = availability.map((a) => ({
    date: a.date.toISOString(),
    status: a.status as Status,
  }));

  const avatarUrl = provider.avatarUrl ?? provider.user?.avatarUrl ?? null;
  const avatarFallback =
    provider.displayName?.slice(0, 2).toUpperCase() ?? "PR";

  const categories = provider.categories ?? [];
  const primaryCategory =
    categories.length > 0 ? resolveCategoryMeta(categories[0]) : null;

  const isVerified = provider.verified ?? false;
  const locationLabel = [provider.city, provider.country ?? "RO"]
    .filter(Boolean)
    .join(", ");

  const role = (currentUser?.role as
    | "GUEST"
    | "USER"
    | "PROVIDER"
    | "ADMIN"
    | undefined) ?? "GUEST";

  let ctaHref = `/auth?mode=signup&next=/p/${provider.id}`;
  let ctaLabel = "Creează cont și rezervă";

  if (currentUser) {
    if (currentUser.id === provider.userId) {
      ctaHref = "/profile";
      ctaLabel = "Deschide cabinetul tău";
    } else if (role === "USER" || role === "GUEST") {
      ctaHref = `/providers/${provider.id}`;
      ctaLabel = "Trimite cerere de rezervare";
    } else if (role === "PROVIDER") {
      ctaHref = "/profile";
      ctaLabel = "Vezi cererile de rezervare";
    } else if (role === "ADMIN") {
      ctaHref = "/admin/providers";
      ctaLabel = "Deschide în panoul admin";
    }
  }

  const metaChips: string[] = [];
  if (locationLabel) metaChips.push(locationLabel);
  if (primaryCategory) metaChips.push(primaryCategory.label);
  if (categories.length > 1)
    metaChips.push(
      categories
        .slice(1, 4)
        .map((c) => resolveCategoryMeta(c)?.label ?? c)
        .join(" · ")
    );

  const shortBio =
    provider.bio && provider.bio.length > 260
      ? provider.bio.slice(0, 260) + "…"
      : provider.bio || "";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-6">
      {requested && (
        <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Cererea ta a fost trimisă către acest provider. Vei primi răspuns pe
          email după ce verifică disponibilitatea.
          {requestedDate && (
            <span className="ml-1 text-emerald-200">
              Dată cerută: {requestedDate}
            </span>
          )}
        </div>
      )}

      {/* ===== HERO provider: avatar mare + about bubble ===== */}
      <section
        className="
          relative overflow-hidden rounded-[32px]
          border border-[#16352a]
          bg-[radial-gradient(circle_at_0%_0%,rgba(15,70,49,0.7),transparent_55%),radial-gradient(circle_at_110%_120%,rgba(180,137,76,0.55),transparent_60%),#020806]
          px-5 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8
          shadow-[0_38px_160px_rgba(0,0,0,0.95)]
        "
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.55),transparent_70%)]" />
        </div>

        <div className="relative grid gap-6 md:grid-cols-[minmax(0,1.7fr),minmax(260px,1.1fr)] md:items-start">
          {/* LEFT: avatar + nume + social */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center md:items-start md:gap-6">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-[28px] border border-white/18 bg-black/50 shadow-[0_28px_90px_rgba(0,0,0,0.96)] sm:h-28 sm:w-28 md:h-32 md:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={provider.displayName ?? "Artist / furnizor"}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10" />
                </div>
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-white/5 text-2xl font-semibold text-zinc-100 ring-1 ring-white/15 shadow-[0_28px_90px_rgba(0,0,0,0.96)] sm:h-28 sm:w-28 md:h-32 md:w-32">
                  {avatarFallback}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300 ring-1 ring-[#27513c]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Profil public provider
                {primaryCategory && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-200">
                      <span>{primaryCategory.emoji}</span>
                      <span>{primaryCategory.label}</span>
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[2.1rem] font-semibold leading-tight text-zinc-50 sm:text-[2.3rem] md:text-[2.5rem]">
                  {provider.displayName ?? "Artist / furnizor"}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200 ring-1 ring-emerald-500/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Verificat
                  </span>
                )}
              </div>

              {metaChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-200">
                  {metaChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-black/60 px-2 py-[2px] ring-1 ring-white/10"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {/* social icons */}
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-300">
                {provider.websiteUrl && (
                  <SocialPill
                    href={provider.websiteUrl}
                    icon={<Globe2 className="h-3.5 w-3.5" />}
                    label="Website"
                  />
                )}
                {provider.instagramUrl && (
                  <SocialPill
                    href={provider.instagramUrl}
                    icon={<Instagram className="h-3.5 w-3.5" />}
                    label="Instagram"
                  />
                )}
                {provider.youtubeUrl && (
                  <SocialPill
                    href={provider.youtubeUrl}
                    icon={<Youtube className="h-3.5 w-3.5" />}
                    label="YouTube"
                  />
                )}
                {provider.facebookUrl && (
                  <SocialPill
                    href={provider.facebookUrl}
                    icon={<Facebook className="h-3.5 w-3.5" />}
                    label="Facebook"
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: about bubble + CTA */}
          <div className="mt-1 space-y-3 md:mt-0">
            <div className="relative rounded-[26px] border border-[#2a5140] bg-black/75 px-4 py-3 text-xs text-zinc-200 shadow-[0_22px_80px_rgba(0,0,0,0.9)] sm:px-5 sm:py-4">
              {/* уголок */}
              <div className="pointer-events-none absolute -right-6 top-6 hidden h-8 w-8 rotate-6 rounded-2xl border border-[#2a5140] bg-black/85 md:block" />
              <div className="text-sm font-semibold text-zinc-50">
                Despre {provider.displayName ?? "provider"}
              </div>
              {shortBio ? (
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-200">
                  {shortBio}
                </p>
              ) : (
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">
                  Adaugă o descriere a stilului, experienței și tipurilor de
                  evenimente. Clienții văd acest text înainte de a trimite o
                  cerere de rezervare.
                </p>
              )}
            </div>

            <a
              href={ctaHref}
              className="inline-flex w-full items-center justify-center rounded-[18px] bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </section>

      {/* ===== CALENDAR + TESTIMONIALS + GALLERY ===== */}
      <section className="mt-8 grid gap-6 md:grid-cols-[1.6fr_1.4fr]">
        {/* LEFT: calendar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1a3a2e] bg-black/80 p-4 shadow-[0_26px_110px_rgba(0,0,0,0.9)]">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Calendar disponibilitate
              </h2>
              <span className="hidden text-[11px] text-zinc-500 sm:inline">
                Alege o dată pentru a începe rezervarea
              </span>
            </div>

            <div className="mt-3">
              <PublicProviderCalendar providerSlug={provider.id} days={days} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-500">
              <span className="rounded-full bg-white/[0.03] px-2 py-[2px]">
                Verde = liber
              </span>
              <span className="rounded-full bg-white/[0.03] px-2 py-[2px]">
                Albastru = în curs de confirmare
              </span>
              <span className="rounded-full bg-white/[0.03] px-2 py-[2px]">
                Roșu/Gri = ocupat
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: testimonials + gallery (placeholder) */}
        <div className="space-y-4">
          {/* Testimonials */}
          <div className="relative rounded-[26px] border border-[#2a5140] bg-black/82 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Testimoniale (în curând)
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Social proof
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs text-zinc-200">
              <TestimonialSkeleton
                name="James Loran"
                rating={5}
                text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Evenimentul a fost organizat impecabil..."
              />
              <div className="h-px w-full bg-white/10" />
              <TestimonialSkeleton
                name="Ana Popescu"
                rating={4}
                text="Show foarte bun, comunicare clară și profesionistă. Recomand pentru nunți și evenimente corporate."
              />
            </div>

            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center rounded-[999px] border border-[var(--border-accent)] bg-transparent px-4 py-1.5 text-[12px] font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              Vezi toate testimonialele (curând)
            </button>
          </div>

          {/* Gallery placeholder */}
          <div className="rounded-[24px] border border-[#1a3329] bg-black/82 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Galerie foto &amp; video
              </h2>
              <span className="text-[10px] text-zinc-500">
                în pregătire
              </span>
            </div>
            <p className="mt-2 text-[12px] text-zinc-300">
              Aici vor apărea imagini și clipuri din evenimentele la care a
              participat {provider.displayName ?? "providerul"}.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-16 rounded-xl bg-gradient-to-br from-zinc-700/40 to-black/80 ring-1 ring-white/10" />
              <div className="h-16 rounded-xl bg-gradient-to-br from-emerald-700/35 via-black/70 to-black/95 ring-1 ring-[#2a5140]" />
              <div className="h-16 rounded-xl bg-gradient-to-br from-amber-600/35 via-black/70 to-black/95 ring-1 ring-amber-500/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== PACHETE + info suplimentară ===== */}
      <section className="mt-8 grid gap-6 md:grid-cols-[1.6fr_1.4fr]">
        {/* Pachete */}
        <div className="space-y-4">
          {provider.packages.length > 0 && (
            <div className="rounded-2xl border border-[#1a3a2e] bg-black/80 p-4 shadow-[0_26px_110px_rgba(0,0,0,0.9)]">
              <h2 className="text-sm font-semibold text-zinc-100">
                Pachete &amp; prețuri
              </h2>
              <div className="mt-3 space-y-3">
                {provider.packages.map((p) => {
                  const highlight = p.isHighlight;

                  return (
                    <div
                      key={p.id}
                      className={`flex gap-3 rounded-2xl px-3 py-3 ${
                        highlight
                          ? "bg-[radial-gradient(circle_at_top,#241706,transparent_70%)] ring-1 ring-[var(--accent)]/85 shadow-[0_18px_70px_rgba(0,0,0,0.95)]"
                          : "bg-white/[0.03] ring-1 ring-white/[0.06]"
                      }`}
                    >
                      <div className="flex flex-1 gap-3">
                        {p.imageUrl && (
                          <div className="hidden h-16 w-24 overflow-hidden rounded-xl bg-black/60 sm:block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={p.title || "Imagine pachet"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-medium text-zinc-50">
                              {p.title}
                            </div>
                            {highlight && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/18 px-2 py-[1px] text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/70">
                                Highlight
                              </span>
                            )}
                          </div>

                          {p.description && (
                            <p className="mt-1 line-clamp-3 text-xs text-zinc-300">
                              {p.description}
                            </p>
                          )}

                          {(p.tag || p.durationHours || p.maxPeople) && (
                            <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-zinc-200">
                              {p.tag && (
                                <span className="rounded-full bg-black/50 px-2 py-[1px]">
                                  {p.tag}
                                </span>
                              )}
                              {p.durationHours && (
                                <span className="rounded-full bg-black/50 px-2 py-[1px]">
                                  ~ {p.durationHours} ore
                                </span>
                              )}
                              {p.maxPeople && (
                                <span className="rounded-full bg-black/50 px-2 py-[1px]">
                                  până la {p.maxPeople} persoane
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between gap-1">
                        <span className="rounded-full bg-black/70 px-2.5 py-[3px] text-[12px] font-semibold text-zinc-50">
                          {formatPrice(p.price, p.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Prețurile sunt orientative. Suma finală se stabilește în funcție
                de detalii.
              </p>
            </div>
          )}
        </div>

        {/* Info suplimentară + link-uri */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1a3329] bg-black/80 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Detalii suplimentare
            </h2>
            {provider.bio ? (
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">
                {provider.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">
                Providerul nu a adăugat încă o descriere detaliată. În curând
                vei vedea aici mai multe informații despre stil și experiență.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#1a3329] bg-black/80 p-4 text-sm">
            <h3 className="text-sm font-semibold text-zinc-100">Link-uri</h3>
            <div className="mt-3 grid gap-2 text-xs text-zinc-300">
              {provider.websiteUrl && (
                <a
                  href={provider.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.06] hover:bg-white/[0.07]"
                >
                  <span>Website</span>
                  <span className="truncate text-[11px] text-zinc-400">
                    {provider.websiteUrl.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}
              {provider.youtubeUrl && (
                <a
                  href={provider.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.06] hover:bg-white/[0.07]"
                >
                  <span>YouTube</span>
                  <span className="text-[11px] text-zinc-400">
                    video / playlist
                  </span>
                </a>
              )}
              {provider.instagramUrl && (
                <a
                  href={provider.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.06] hover:bg-white/[0.07]"
                >
                  <span>Instagram</span>
                  <span className="text-[11px] text-zinc-400">@profil</span>
                </a>
              )}
              {provider.facebookUrl && (
                <a
                  href={provider.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.06] hover:bg-white/[0.07]"
                >
                  <span>Facebook</span>
                  <span className="text-[11px] text-zinc-400">
                    pagină / evenimente
                  </span>
                </a>
              )}
              {!provider.websiteUrl &&
                !provider.youtubeUrl &&
                !provider.instagramUrl &&
                !provider.facebookUrl && (
                  <p className="text-xs text-zinc-500">
                    Providerul nu a adăugat încă link-uri externe.
                  </p>
                )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- mici sub-componente pentru look & feel ---------- */

function SocialPill({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-[3px] text-[11px] text-zinc-100 ring-1 ring-white/15 hover:bg-black/80"
    >
      <span className="text-zinc-300">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function TestimonialSkeleton({
  name,
  rating,
  text,
}: {
  name: string;
  rating: number;
  text: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-zinc-100">
          {name}
        </span>
        <div className="flex items-center gap-[2px] text-[var(--accent)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < rating
                  ? "fill-[var(--accent)] text-[var(--accent)]"
                  : "text-zinc-600"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-300 line-clamp-2">
        {text}
      </p>
    </div>
  );
}
