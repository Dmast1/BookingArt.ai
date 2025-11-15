// src/app/profile/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProviderAvailabilityCalendar, { Status } from "./ProviderAvailabilityCalendar";
import { MapPin, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cabinet — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

// ВАЖНО: в новых версиях Next searchParams — Promise
type ProfilePageProps = {
  searchParams?: Promise<{ upgraded?: string }>;
};

// те же категории, что и на главной
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
];

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

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/profile");

  const sp = (await searchParams) ?? {};
  const upgraded = sp.upgraded === "1";

  const role = (user.role as AppRole) ?? "GUEST";

  if (role === "ADMIN") {
    return <AdminCabinet email={user.email ?? ""} upgraded={upgraded} />;
  }

  if (role === "PROVIDER") {
    return (
      <ProviderCabinet
        userId={user.id}
        email={user.email ?? ""}
        upgraded={upgraded}
      />
    );
  }

  // USER / GUEST
  return (
    <ClientCabinet
      userId={user.id}
      email={user.email ?? ""}
      name={user.name ?? ""}
      avatarUrl={user.avatarUrl ?? null}
      premiumUntil={user.premiumUntil ?? null}
      role={role}
      upgraded={upgraded}
    />
  );
}

/* ---------- helpers ---------- */

function UpgradeBanner({ upgraded }: { upgraded: boolean }) {
  if (!upgraded) return null;
  return (
    <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
      Contul tău a fost actualizat. Noile opțiuni vor fi disponibile în curând.
    </div>
  );
}

function formatCurrencyEUR(amount: number) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/* =====================================================================
   CLIENT / GUEST CABINET
===================================================================== */

async function ClientCabinet(props: {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  premiumUntil: Date | null;
  role: AppRole;
  upgraded: boolean;
}) {
  const now = new Date();
  const isPremium = !!(props.premiumUntil && props.premiumUntil > now);

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: props.userId, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: {
        provider: {
          select: {
            displayName: true,
            city: true,
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: { userId: props.userId, date: { lt: now } },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        provider: {
          select: {
            displayName: true,
            city: true,
          },
        },
      },
    }),
  ]);

  const accountLabel =
    props.role === "GUEST" ? "Guest" : isPremium ? "Premium" : "Standard";

  const avatarFallback =
    (props.name || props.email || "U")[0]?.toUpperCase() ?? "U";

  const upcomingCount = upcoming.length;
  const pastCount = past.length;

  return (
    <section className="mx-auto max-w-6xl pb-12">
      <UpgradeBanner upgraded={props.upgraded} />

      {/* HERO client – стеклянная панель */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[radial-gradient(circle_at_0%_0%,rgba(22,48,43,0.9),transparent_60%),radial-gradient(circle_at_120%_120%,rgba(57,5,23,0.85),transparent_65%),rgba(3,17,13,0.96)]
          px-6 py-5 shadow-[0_36px_120px_rgba(0,0,0,0.95)]
          backdrop-blur-[26px]
          md:px-8 md:py-6
        "
      >
        {/* подсветки */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-[-30%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.18),transparent)] blur-3xl opacity-80" />
          <div className="absolute -right-16 bottom-[-30%] h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(12,148,136,0.5),transparent)] blur-3xl opacity-70" />
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* левый блок: аватар + имя */}
          <div className="flex items-center gap-4 md:gap-5">
            {props.avatarUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={props.avatarUrl}
                  alt={props.name || props.email || "Avatar"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black/60 text-lg font-semibold text-zinc-100 ring-1 ring-white/15 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
                {avatarFallback}
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Cont {accountLabel}</span>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[2px] text-[10px] font-medium text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    Premium
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
                Salut, {props.name || "invitat"}!
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Email: <span className="text-[var(--text-main)]">{props.email}</span>
              </p>
            </div>
          </div>

          {/* правый блок: мини-статы + действия */}
          <div className="flex flex-col gap-3 md:w-[320px]">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/55 px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Rezervări viitoare
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text-main)]">
                  {upcomingCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/55 px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Evenimente trecute
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text-main)]">
                  {pastCount}
                </div>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <a
                href="/profile/overview"
                className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-[var(--text-main)] hover:border-[var(--accent)]/80"
              >
                Vezi datele de profil
                <ArrowRight className="h-3 w-3 opacity-70 group-hover:translate-x-[1px] group-hover:opacity-100" />
              </a>
              <a
                href="/settings/account"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-3 py-2 text-[11px] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
              >
                Setări & securitate
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* GRID: слева брони, справа — онбординг */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[2.1fr_1.2fr]">
        {/* слева: брони */}
        <div className="space-y-6">
          {/* будущие */}
          <div className="rounded-2xl border border-line bg-surface/80 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Rezervările mele viitoare
              </h2>
              <a
                href="/bookings"
                className="text-xs text-zinc-400 hover:text-accent"
              >
                Vezi toate →
              </a>
            </div>

            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">
                Nu ai încă rezervări viitoare. Caută un artist sau o sală și
                începe prima rezervare.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcoming.map((b) => {
                  const dateStr = b.date.toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <li
                      key={b.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-bg px-3 py-2.5 text-sm"
                    >
                      <div>
                        <div className="font-medium text-zinc-100">
                          {b.provider?.displayName ?? "Artist / furnizor"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {b.city ?? "—"} · {dateStr}
                        </div>
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wide text-zinc-300">
                        {b.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* прошлые */}
          <div className="rounded-2xl border border-line bg-surface/80 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Istoric evenimente
              </h2>
              <span className="text-xs text-zinc-500">
                ultimele {past.length} rezervări
              </span>
            </div>
            {past.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">
                După finalizarea primului eveniment, istoricul va apărea aici.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2 md:grid-cols-2">
                {past.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-2xl border border-white/5 bg-bg px-3 py-2.5 text-xs"
                  >
                    <div className="font-medium text-zinc-100">
                      {b.provider?.displayName ?? "Artist / furnizor"}
                    </div>
                    <div className="mt-0.5 text-zinc-500">
                      {b.city ?? "—"} ·{" "}
                      {b.date.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* справа: онбординг / апгрейд */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm">
            <h3 className="text-sm font-semibold text-zinc-100">
              Tip cont & pași următori
            </h3>
            <ol className="mt-3 space-y-2 text-xs text-zinc-300">
              <li className="flex gap-2">
                <span className="mt-[2px] h-5 w-5 shrink-0 rounded-full bg-emerald-500/20 text-center text-[11px] leading-5 text-emerald-300">
                  1
                </span>
                <div>
                  <div className="font-medium text-zinc-100">
                    Completează profilul de bază
                  </div>
                  <p className="text-zinc-400">
                    Adaugă numele complet și confirmă numărul de telefon / email.
                  </p>
                  <a
                    href="/profile/overview"
                    className="mt-1 inline-flex text-[11px] text-accent hover:underline"
                  >
                    Deschide profilul →
                  </a>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] h-5 w-5 shrink-0 rounded-full bg-white/10 text-center text-[11px] leading-5 text-zinc-200">
                  2
                </span>
                <div>
                  <div className="font-medium text-zinc-100">
                    Alege tipul de cont (PF / Companie)
                  </div>
                  <p className="text-zinc-400">
                    În curând: formular dedicat pentru Persoană Fizică și
                    Companie cu date fiscale și IBAN.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] h-5 w-5 shrink-0 rounded-full bg-white/10 text-center text-[11px] leading-5 text-zinc-200">
                  3
                </span>
                <div>
                  <div className="font-medium text-zinc-100">
                    Activează contul Premium
                  </div>
                  <p className="text-zinc-400">
                    Acces complet la prețuri, rezervări și mesagerie cu
                    artiștii. Ulterior vom conecta plata abonamentului și KYC.
                  </p>
                  <a
                    href="/subscriptions"
                    className="mt-1 inline-flex text-[11px] text-accent hover:underline"
                  >
                    Vezi detalii abonamente →
                  </a>
                </div>
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm">
            <h3 className="text-sm font-semibold text-zinc-100">
              Ce vrei să faci acum?
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li>
                <a href="/search" className="hover:text-accent">
                  Caută artiști & furnizori pentru un eveniment
                </a>
              </li>
              <li>
                <a href="/venues" className="hover:text-accent">
                  Descoperă săli de evenimente potrivite
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-accent">
                  Vezi evenimente cu bilete disponibile
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* =====================================================================
   PROVIDER CABINET
===================================================================== */

async function ProviderCabinet(props: {
  userId: string;
  email: string;
  upgraded: boolean;
}) {
  const provider = await prisma.provider.findUnique({
    where: { userId: props.userId },
    include: {
      user: { select: { avatarUrl: true } },
      bookings: {
        orderBy: { date: "desc" },
        take: 200,
        include: { user: { select: { email: true } } },
      },
      events: {
        orderBy: { date: "asc" },
        take: 8,
      },
    },
  });

  const now = new Date();
  const upcomingBookings = (provider?.bookings ?? []).filter(
    (b) => b.date > now
  );

  // ====== ВАЖНО: определяем Activități по категориям провайдера
  const categories = provider?.categories ?? [];
  const categoriesLower = categories.map((c) => c?.toLowerCase?.() ?? "");
  const hasActivities =
    categoriesLower.includes("activitati") ||
    categoriesLower.includes("activități");

  // точечная доступность — только если НЕ режим Activități
  let days: { date: string; status: Status }[] = [];
  if (provider && !hasActivities) {
    const availability = await prisma.availability.findMany({
      where: { providerId: provider.id },
      orderBy: { date: "asc" },
      take: 120,
    });

    const availabilityMap = new Map<string, Status>();
    for (const slot of availability) {
      const key = slot.date.toISOString().slice(0, 10); // YYYY-MM-DD
      availabilityMap.set(key, (slot.status as Status) ?? "free");
    }

    // диапазон 60 дней вперёд
    const start = new Date();
    const startUtc = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
    );

    for (let i = 0; i < 60; i++) {
      const d = new Date(startUtc);
      d.setUTCDate(startUtc.getUTCDate() + i);

      const key = d.toISOString().slice(0, 10);
      const status = availabilityMap.get(key) ?? "free";

      days.push({
        date: d.toISOString(),
        status,
      });
    }
  }

  // заявки (leads) для этого провайдера
  const leads = provider
    ? await prisma.lead.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let totalBookings = 0;
  let revenueLast30 = 0;

  if (provider) {
    totalBookings = provider.bookings.length;
    provider.bookings.forEach((b) => {
      if (b.date >= thirtyDaysAgo) {
        if (typeof (b as any).priceGross === "number") {
          revenueLast30 += (b as any).priceGross as number;
        }
      }
    });
  }

  const totalEvents = provider
    ? await prisma.event.count({ where: { providerId: provider.id } })
    : 0;

  const avatarUrl = provider?.user?.avatarUrl ?? null;
  const avatarFallback =
    provider?.displayName?.slice(0, 2).toUpperCase() ?? "PR";

  const primaryCategory =
    categories.length > 0 ? resolveCategoryMeta(categories[0]) : null;

  return (
    <section className="mx-auto max-w-6xl pb-12">
      <UpgradeBanner upgraded={props.upgraded} />

      {/* HERO provider – более «панель» как на Dribbble */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[radial-gradient(circle_at_0%_0%,rgba(22,48,43,0.9),transparent_60%),radial-gradient(circle_at_120%_120%,rgba(57,5,23,0.9),transparent_65%),rgba(3,17,13,0.98)]
          px-6 py-5 shadow-[0_40px_140px_rgba(0,0,0,0.98)]
          backdrop-blur-[26px]
          md:px-8 md:py-6
        "
      >
        {/* подсветки */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-35%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2),transparent)] blur-3xl opacity-80" />
          <div className="absolute -right-20 bottom-[-35%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(12,148,136,0.55),transparent)] blur-3xl opacity-80" />
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Левая часть: аватар, имя, теги */}
          <div className="flex items-center gap-4 md:gap-5">
            {avatarUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-black/70 shadow-[0_22px_70px_rgba(0,0,0,0.95)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={provider?.displayName ?? "Artist / furnizor"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black/70 text-lg font-semibold text-zinc-100 ring-1 ring-white/15 shadow-[0_22px_70px_rgba(0,0,0,0.95)]">
                {avatarFallback}
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-white/12">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Cont provider activ</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[2px] text-[10px] font-medium text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Trusted
                </span>
              </div>

              <h1 className="mt-2 text-[1.9rem] font-semibold leading-tight text-zinc-50 sm:text-[2.1rem]">
                {provider?.displayName ?? "Artist / furnizor"}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                {primaryCategory && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-[3px] text-[11px] text-[var(--accent)] ring-1 ring-[var(--accent)]/60">
                    <span>{primaryCategory.emoji}</span>
                    <span>{primaryCategory.label}</span>
                  </span>
                )}
                {provider?.city && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-[3px] text-[11px] text-[var(--text-main)] ring-1 ring-white/10">
                    <MapPin className="h-3 w-3 opacity-75" />
                    {provider.city},{" "}
                    {provider.country ?? "RO"}
                  </span>
                )}
                <span className="text-[var(--text-muted)]">
                  {props.email}
                </span>
              </div>

              {categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categories.slice(0, 6).map((raw) => {
                    const meta = resolveCategoryMeta(raw);
                    if (!meta) return null;
                    return (
                      <span
                        key={raw}
                        className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-[2px] text-[11px] text-zinc-100 ring-1 ring-white/10"
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Правая часть: 4 мини-статы + быстрые действия */}
          <div className="flex flex-col gap-3 md:w-[360px]">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <ProviderStat
                label="Rezervări viitoare"
                value={upcomingBookings.length}
              />
              <ProviderStat label="Rezervări totale" value={totalBookings} />
              <ProviderStat
                label="Venit 30 zile"
                value={formatCurrencyEUR(revenueLast30)}
              />
              <ProviderStat label="Evenimente publice" value={totalEvents} />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="/settings/provider"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-[var(--text-main)] hover:border-[var(--accent)]/80"
              >
                Setări profil provider
                <ArrowRight className="h-3 w-3 opacity-70 group-hover:translate-x-[1px]" />
              </a>

              {hasActivities ? (
                <>
                  <a
                    href="/provider/activities"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-3 py-2 text-[11px] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
                  >
                    Activitățile mele
                  </a>
                  <a
                    href="/provider/activities/new"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold text-zinc-100 ring-1 ring-white/12 hover:bg-white/15"
                  >
                    + Adaugă activitate
                  </a>
                </>
              ) : (
                <a
                  href="/events/mine"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-3 py-2 text-[11px] font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
                >
                  Evenimentele mele
                </a>
              )}

              <a
                href="/bookings"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-black/60 px-3 py-2 text-[11px] font-medium text-[var(--text-main)] ring-1 ring-white/10 hover:border-[var(--accent)]/70 hover:text-[var(--accent)]"
              >
                Toate rezervările
              </a>
            </div>
          </div>
        </div>

        {/* Badge verificat – в том же стиле, но спокойнее */}
        <div
          className="
            relative mt-5 flex flex-col gap-3
            rounded-2xl border border-[var(--border-subtle)]
            bg-black/45 px-4 py-3
            backdrop-blur-[20px]
            md:flex-row md:items-center md:justify-between
          "
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Badge verificat</span>
              <span className="text-[10px] text-[var(--accent)]/85">
                în curând
              </span>
            </div>
            <p className="mt-2 max-w-xl text-xs text-[var(--text-muted)]">
              Marchează-ți profilul ca verificat prin documente oficiale (CI /
              firmă). Clienții văd badge-ul de încredere lângă numele tău în
              rezultate și pe pagina publică.
            </p>
          </div>
          <a
            href="/verification"
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110"
          >
            Cumpără verificarea contului
          </a>
        </div>
      </div>

      {/* GRID: календарь слева, либо блок Activități; справа — leads + брони + события + шаги */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
        {/* слева */}
        <div>
          {!hasActivities ? (
            <ProviderAvailabilityCalendar days={days} />
          ) : (
            <div className="rounded-2xl border border-line bg-surface/80 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Activități & programări
                </h2>
                <a
                  href="/provider/activities/new"
                  className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-black"
                >
                  + Adaugă activitate
                </a>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Gestionează sloturile direct pe pagina fiecărei activități (nu aici).
              </p>
              <div className="mt-3 flex gap-2">
                <a
                  href="/provider/activities"
                  className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-2 text-[12px] font-medium text-zinc-100 ring-1 ring-white/12 hover:bg-white/15"
                >
                  Deschide „Activitățile mele”
                </a>
                <a
                  href="/activitati"
                  className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-2 text-[12px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
                >
                  Vitrină publică Activități
                </a>
              </div>
            </div>
          )}
        </div>

        {/* справа: Leads + Rezervări + Evenimente + Pași */}
        <div className="space-y-6">
          {/* Cereri / Leads */}
          <div className="rounded-2xl border border-line bg-surface/80 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Cereri noi de rezervare
              </h2>
              <a
                href="/admin/leads"
                className="text-xs text-zinc-400 hover:text-accent"
              >
                Vezi toate leads-urile →
              </a>
            </div>
            {leads.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">
                Încă nu ai cereri noi. Clienții îți pot trimite o cerere din
                pagina ta publică folosind calendarul.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {leads.slice(0, 6).map((lead) => {
                  const dateVal =
                    lead.date && lead.date instanceof Date
                      ? lead.date
                      : null;
                  const dateStr = dateVal
                    ? dateVal.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";
                  return (
                    <li
                      key={lead.id}
                      className="rounded-2xl border border-white/5 bg-bg px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-zinc-500">
                            {dateStr} · {lead.city ?? "—"}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {(lead as any).email ?? "-"}
                          </div>
                        </div>
                        <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-300">
                          {(lead as any).status ?? "nou"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Rezervări viitoare */}
          <div className="rounded-2xl border border-line bg-surface/80 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Rezervări viitoare
              </h2>
            <a
                href="/bookings"
                className="text-xs text-zinc-400 hover:text-accent"
              >
                Gestionează toate cererile →
              </a>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">
                Încă nu ai rezervări viitoare. Completează-ți profilul și
                disponibilitatea pentru a primi cereri.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcomingBookings.slice(0, 6).map((b) => {
                  const dateStr = b.date.toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <li
                      key={b.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-bg px-3 py-2.5 text-sm"
                    >
                      <div>
                        <div className="font-medium text-zinc-100">
                          {b.city ?? "—"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {dateStr} · {b.user?.email ?? "client"}
                        </div>
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wide text-zinc-300">
                        {b.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Evenimente cu bilete */}
          <div className="rounded-2xl border border-line bg-surface/80 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Evenimente cu bilete
              </h2>
              <a
                href="/events"
                className="text-xs text-zinc-400 hover:text-accent"
              >
                Secțiunea Bilete →
              </a>
            </div>
            {provider?.events && provider.events.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                {provider.events.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-2xl border border-white/5 bg-bg px-3 py-2.5"
                  >
                    <div className="font-medium text-zinc-100">{e.title}</div>
                    <div className="mt-0.5 text-zinc-500">
                      {e.city} ·{" "}
                      {e.date.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <a
                        href={`/events/${e.slug}`}
                        className="block text-[11px] text-accent hover:underline"
                      >
                        Deschide pagina publică →
                      </a>
                      <a
                        href={`/events/${e.slug}/tickets`}
                        className="block text-[11px] text-accent/90 hover:underline"
                      >
                        Gestionează biletele →
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">
                Momentan nu ai evenimente cu bilete publicate. Creează un
                eveniment în secțiunea „Evenimentele mele”, apoi adaugă tipuri
                de bilete pentru vânzare.
              </p>
            )}
          </div>

          {/* Pași pentru un profil complet */}
          <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm">
            <h3 className="text-sm font-semibold text-zinc-100">
              Pași pentru un profil complet
            </h3>
            <ol className="mt-3 space-y-2 text-xs text-zinc-300">
              <li>
                <span className="font-medium text-zinc-100">
                  1. Completează profilul public
                </span>
                <p className="text-zinc-400">
                  Gen muzical, echipament, link-uri YouTube/Instagram — toate
                  apar pe pagina ta publică.
                </p>
                <a
                  href="/settings/provider"
                  className="mt-1 inline-flex text-[11px] text-accent hover:underline"
                >
                  Mergi la setări provider →
                </a>
              </li>
              <li>
                <span className="font-medium text-zinc-100">
                  2. Încarcă documentele (KYC)
                </span>
                <p className="text-zinc-400">
                  În viitor: verificare CI/pașaport sau documente companie
                  pentru plăți sigure și contracte standardizate.
                </p>
              </li>
              <li>
                <span className="font-medium text-zinc-100">
                  3. Setează prețuri & pachete
                </span>
                <p className="text-zinc-400">
                  Poți folosi evenimentele cu bilete și viitoarele module de
                  pachete pentru a-ți structura ofertele.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProviderStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/65 px-4 py-2">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-zinc-50">{value}</div>
    </div>
  );
}

/* =====================================================================
   ADMIN CABINET
===================================================================== */

async function AdminCabinet(props: { email: string; upgraded: boolean }) {
  const [usersCount, providersCount, venuesCount, leadsCount, bookingsCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.venue.count(),
      prisma.lead.count(),
      prisma.booking.count(),
    ]);

  return (
    <section className="mx-auto max-w-6xl pb-12">
      <UpgradeBanner upgraded={props.upgraded} />

      {/* HERO admin */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[radial-gradient(circle_at_0%_0%,rgba(22,48,43,0.85),transparent_60%),radial-gradient(circle_at_120%_120%,rgba(57,5,23,0.85),transparent_65%),rgba(3,17,13,0.98)]
          px-6 py-5 shadow-[0_38px_140px_rgba(0,0,0,0.98)]
          backdrop-blur-[26px]
          md:px-8 md:py-6
        "
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-[-35%] h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.26),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-24 bottom-[-35%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.18),transparent)] blur-3xl opacity-80" />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] ring-1 ring-white/12">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Admin console
            </div>
            <h1 className="mt-2 text-[2rem] font-semibold leading-tight text-zinc-50">
              BookingArt.ai — Control Panel
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Logat ca{" "}
              <span className="font-medium text-[var(--text-main)]">
                {props.email}
              </span>
              .
            </p>
          </div>

          <p className="text-xs text-zinc-500 md:text-right max-w-xs">
            MVP Admin. Ulterior: grafice live, export, filtre avansate și audit
            log complet pentru toate acțiunile critice.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <AdminStat title="Utilizatori" value={usersCount} accent />
        <AdminStat title="Provideri" value={providersCount} />
        <AdminStat title="Săli" value={venuesCount} />
        <AdminStat title="Leads" value={leadsCount} />
        <AdminStat title="Rezervări" value={bookingsCount} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <AdminCard
          title="Leads & cereri"
          desc="Monitorizează cererile de la clienți către săli și artiști."
          href="/admin/leads"
          cta="Deschide tabela cu leads"
        />
        <AdminCard
          title="Provideri"
          desc="Vezi lista furnizorilor înrolați și verifică profilele lor."
          href="/admin/providers"
          cta="Gestionează providerii"
        />
        <AdminCard
          title="Disponibilitate artiști"
          desc="Intră în modulul de disponibilitate pentru a ajusta calendarul artiștilor."
          href="/admin/availability"
          cta="Deschide calendarul"
        />
      </div>
    </section>
  );
}

function AdminStat(props: { title: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-line px-4 py-3 ${
        props.accent
          ? "bg-gradient-to-br from-[var(--accent)]/18 to-bg"
          : "bg-surface/80"
      }`}
    >
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        {props.title}
      </div>
      <div className="mt-1 text-xl font-semibold text-zinc-50">
        {props.value}
      </div>
    </div>
  );
}

function AdminCard(props: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <a
      href={props.href}
      className="group block rounded-2xl border border-line bg-surface/80 p-4 transition hover:border-[var(--accent)]/60 hover:bg-white/[0.03]"
    >
      <div className="text-sm font-semibold text-zinc-100">
        {props.title}
      </div>
      <p className="mt-2 text-xs text-zinc-400">{props.desc}</p>
      <div className="mt-3 text-xs font-medium text-accent group-hover:underline">
        {props.cta} →
      </div>
    </a>
  );
}
