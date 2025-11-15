// src/app/dashboard/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/dashboard");

  const role = (user.role as AppRole) ?? "GUEST";

  if (role === "ADMIN") {
    return <AdminDashboard email={user.email ?? ""} />;
  }

  if (role === "PROVIDER") {
    return <ProviderDashboard userId={user.id} email={user.email ?? ""} />;
  }

  return (
    <ClientDashboard
      userId={user.id}
      email={user.email ?? ""}
      name={user.name ?? ""}
      role={role}
    />
  );
}

/* =====================================================================
   CLIENT DASHBOARD (USER / GUEST)
===================================================================== */

async function ClientDashboard(props: {
  userId: string;
  email: string;
  name: string;
  role: AppRole;
}) {
  const now = new Date();

  const [upcoming, pastCount] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: props.userId, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 4,
      include: {
        provider: { select: { displayName: true } },
      },
    }),
    prisma.booking.count({
      where: { userId: props.userId, date: { lt: now } },
    }),
  ]);

  const accountLabel = props.role === "GUEST" ? "Guest" : "Client";

  return (
    <main
      className="
        mx-auto max-w-6xl min-h-[70vh]
        px-4 pb-14 pt-6 md:px-6
      "
    >
      {/* HERO DASHBOARD */}
      <section
        className="
          relative overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[rgba(3,17,13,0.97)]
          px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8
          shadow-[0_32px_140px_rgba(0,0,0,0.95)]
          backdrop-blur-[26px]
        "
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-[-40%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(22,48,43,0.75),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-24 bottom-[-45%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.55),transparent)] blur-3xl opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.7),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {accountLabel} dashboard
            </p>
            <h1 className="mt-1 text-[1.9rem] font-semibold leading-tight text-[var(--text-main)] sm:text-[2.1rem]">
              Salut,{" "}
              <span className="text-[var(--accent)]">
                {props.name || props.email || "invitat"}
              </span>{" "}
              👋
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
              Rezervări, evenimente și bilete – tot ce ține de evenimentele tale
              într-un singur loc.
            </p>
          </div>

          <div className="mt-2 flex flex-col items-start gap-1 text-xs text-[var(--text-muted)] md:items-end">
            <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] ring-1 ring-[var(--border-subtle)]">
              Logat cu:{" "}
              <span className="font-mono text-[var(--text-main)]">
                {props.email}
              </span>
            </span>
            <a
              href="/profile"
              className="inline-flex items-center text-[11px] text-[var(--accent)] hover:text-[var(--accent)]/85"
            >
              Deschide profilul complet →
            </a>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 md:grid-cols-3">
          <ClientStat
            label="Rezervări viitoare"
            value={upcoming.length}
            hint="Ai deja programate"
          />
          <ClientStat
            label="Evenimente trecute"
            value={pastCount}
            hint="Finalizate prin BookingArt"
          />
          <ClientStat
            label="Bilete & plăți"
            value="Vezi detalii"
            linkHref="/tickets"
            hint="Comenzile tale de bilete"
            isLink
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1.1fr]">
        {/* Rezervări viitoare */}
        <div
          className="
            rounded-[24px] border border-[var(--border-subtle)]
            bg-[rgba(3,17,13,0.96)] p-4 md:p-5
            shadow-[0_22px_80px_rgba(0,0,0,0.9)]
            backdrop-blur-[22px]
          "
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">
              Rezervările mele viitoare
            </h2>
            <a
              href="/bookings"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
            >
              Vezi toate rezervările →
            </a>
          </div>

          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Nu ai încă rezervări viitoare. Caută un artist sau o sală și
              rezervă data dorită.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5 text-sm">
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
                    className="
                      flex items-center justify-between gap-3
                      rounded-2xl border border-[var(--border-subtle)]
                      bg-black/60 px-3 py-2.5
                    "
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[var(--text-main)]">
                        {b.provider?.displayName ?? "Eveniment"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        {b.city ?? "—"} · {dateStr}
                      </div>
                    </div>
                    <span className="rounded-full bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                      {b.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Быстрые действия */}
        <aside className="space-y-4 text-sm">
          <div
            className="
              rounded-[24px] border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)] p-4 md:p-5
              shadow-[0_20px_70px_rgba(0,0,0,0.9)]
              backdrop-blur-[20px]
            "
          >
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Ce vrei să faci acum?
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <a href="/search" className="hover:text-[var(--accent)]">
                  Caută artiști sau furnizori pentru un eveniment
                </a>
              </li>
              <li>
                <a href="/venues" className="hover:text-[var(--accent)]">
                  Găsește o sală de evenimente
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-[var(--accent)]">
                  Vezi evenimente cu bilete
                </a>
              </li>
              <li>
                <a href="/tickets" className="hover:text-[var(--accent)]">
                  Deschide biletele mele
                </a>
              </li>
            </ul>
          </div>

          <div
            className="
              rounded-[24px] border border-[var(--border-subtle)]
              bg-[rgba(2,9,8,0.96)] p-4 md:p-5
              text-xs text-[var(--text-muted)]
              shadow-[0_18px_65px_rgba(0,0,0,0.9)]
              backdrop-blur-[20px]
            "
          >
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Setări rapide
            </h3>
            <ul className="mt-3 space-y-1.5">
              <li>
                <a
                  href="/settings/account"
                  className="text-[var(--accent)] hover:underline"
                >
                  Actualizează datele de cont
                </a>
              </li>
              <li>
                <a
                  href="/settings/security"
                  className="text-[var(--accent)] hover:underline"
                >
                  Schimbă parola
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ClientStat(props: {
  label: string;
  value: number | string;
  hint?: string;
  isLink?: boolean;
  linkHref?: string;
}) {
  const content = (
    <div
      className="
        h-full rounded-2xl border border-[var(--border-subtle)]
        bg-[rgba(2,9,8,0.96)]
        px-4 py-3
        shadow-[0_20px_70px_rgba(0,0,0,0.9)]
        backdrop-blur-[20px]
      "
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {props.label}
      </div>
      <div className="mt-1 text-lg font-semibold text-[var(--text-main)]">
        {props.value}
      </div>
      {props.hint && (
        <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
          {props.hint}
        </div>
      )}
    </div>
  );

  if (props.isLink && props.linkHref) {
    return (
      <a href={props.linkHref} className="block transition hover:brightness-110">
        {content}
      </a>
    );
  }

  return content;
}

/* =====================================================================
   PROVIDER DASHBOARD
===================================================================== */

async function ProviderDashboard(props: { userId: string; email: string }) {
  const provider = await prisma.provider.findUnique({
    where: { userId: props.userId },
  });

  if (!provider) {
    return (
      <main className="mx-auto max-w-3xl min-h-[70vh] px-4 pb-14 pt-6 md:px-6">
        <section
          className="
            relative overflow-hidden rounded-[30px]
            border border-[var(--border-subtle)]
            bg-[rgba(3,17,13,0.97)]
            px-5 py-6 md:px-7 md:py-8
            shadow-[0_32px_140px_rgba(0,0,0,0.95)]
            backdrop-blur-[26px]
          "
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-20 top-[-40%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(22,48,43,0.75),transparent)] blur-3xl opacity-90" />
            <div className="absolute -right-24 bottom-[-45%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.55),transparent)] blur-3xl opacity-90" />
          </div>

          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Provider dashboard
            </p>
            <h1 className="mt-1 text-[2rem] font-semibold leading-tight text-[var(--text-main)]">
              Salut! 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              Nu am găsit încă un profil de provider pentru acest cont. Poți
              începe procesul de înrolare ca artist / furnizor.
            </p>
            <a
              href="/onboarding/provider"
              className="
                mt-4 inline-flex rounded-xl bg-[var(--accent)]
                px-4 py-2.5 text-sm font-semibold text-black
                hover:brightness-110
              "
            >
              Începe înrolarea ca provider
            </a>
          </div>
        </section>
      </main>
    );
  }

  const now = new Date();

  const [bookings, events] = await Promise.all([
    prisma.booking.findMany({
      where: { providerId: provider.id, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: {
        user: { select: { email: true } },
      },
    }),
    prisma.event.findMany({
      where: { providerId: provider.id },
      orderBy: { date: "asc" },
      take: 4,
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl min-h-[70vh] px-4 pb-14 pt-6 md:px-6">
      {/* HEADER */}
      <section
        className="
          relative overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[rgba(3,17,13,0.97)]
          px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8
          shadow-[0_32px_140px_rgba(0,0,0,0.95)]
          backdrop-blur-[26px]
        "
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-[-40%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(22,48,43,0.78),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-24 bottom-[-45%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.6),transparent)] blur-3xl opacity-90" />
        </div>

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Provider dashboard
            </p>
            <h1 className="mt-1 text-[1.9rem] font-semibold leading-tight text-[var(--text-main)] sm:text-[2.1rem]">
              Salut,{" "}
              <span className="text-[var(--accent)]">
                {provider.displayName ?? "artist / furnizor"}
              </span>{" "}
              👋
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
              Vezi rapid cererile viitoare, evenimentele cu bilete și linkuri
              către setările profilului.
            </p>
          </div>

          <div className="mt-2 flex flex-col items-start gap-1 text-xs text-[var(--text-muted)] md:items-end">
            <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] ring-1 ring-[var(--border-subtle)]">
              Cont:{" "}
              <span className="font-mono text-[var(--text-main)]">
                {props.email}
              </span>
            </span>
            <a
              href="/settings/provider"
              className="inline-flex items-center text-[11px] text-[var(--accent)] hover:text-[var(--accent)]/85"
            >
              Editează profilul public →
            </a>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 md:grid-cols-3">
          <ClientStat
            label="Rezervări viitoare"
            value={bookings.length}
            hint="Cererile aprobate în următoarea perioadă"
          />
          <ClientStat
            label="Evenimente listate"
            value={events.length}
            hint="Evenimente publice cu bilete"
          />
          <ClientStat
            label="Calendar & disponibilitate"
            value="Deschide"
            hint="Blochează datele ocupate"
            isLink
            linkHref="/admin/availability"
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.9fr_1.1fr]">
        {/* Rezervări */}
        <div
          className="
            rounded-[24px] border border-[var(--border-subtle)]
            bg-[rgba(3,17,13,0.96)] p-4 md:p-5
            shadow-[0_22px_80px_rgba(0,0,0,0.9)]
            backdrop-blur-[22px]
          "
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">
              Rezervări viitoare
            </h2>
            <a
              href="/bookings"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
            >
              Deschide lista completă →
            </a>
          </div>

          {bookings.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Nu ai încă rezervări viitoare. Completează-ți profilul și
              disponibilitatea pentru a primi cereri noi.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5 text-sm">
              {bookings.map((b) => {
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
                    className="
                      flex items-center justify-between gap-3
                      rounded-2xl border border-[var(--border-subtle)]
                      bg-black/60 px-3 py-2.5
                    "
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[var(--text-main)]">
                        {b.city ?? "—"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        {dateStr} · {b.user?.email ?? "client"}
                      </div>
                    </div>
                    <span className="rounded-full bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                      {b.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Events + setări */}
        <aside className="space-y-4 text-sm">
          <div
            className="
              rounded-[24px] border border-[var(--border-subtle)]
              bg-[rgba(3,17,13,0.96)] p-4 md:p-5
              shadow-[0_20px_70px_rgba(0,0,0,0.9)]
              backdrop-blur-[20px]
            "
          >
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Evenimente cu bilete
            </h3>
            {events.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Nu ai încă evenimente publice cu bilete. Poți folosi secțiunea
                „Evenimente” pentru a le crea (MVP – doar listare).
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-xs text-[var(--text-main)]/85">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="
                      rounded-xl border border-[var(--border-subtle)]
                      bg-black/60 px-3 py-2
                    "
                  >
                    <div className="font-medium text-[var(--text-main)]">
                      {e.title}
                    </div>
                    <div className="mt-0.5 text-[var(--text-muted)]">
                      {e.city} ·{" "}
                      {e.date.toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <a
                      href={`/events/${e.slug}`}
                      className="mt-1 inline-block text-[11px] text-[var(--accent)] hover:underline"
                    >
                      Deschide pagina evenimentului →
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="
              rounded-[24px] border border-[var(--border-subtle)]
              bg-[rgba(2,9,8,0.96)] p-4 md:p-5
              text-xs text-[var(--text-muted)]
              shadow-[0_18px_65px_rgba(0,0,0,0.9)]
              backdrop-blur-[20px]
            "
          >
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Setări rapide provider
            </h3>
            <ul className="mt-3 space-y-1.5">
              <li>
                <a
                  href="/settings/provider"
                  className="text-[var(--accent)] hover:underline"
                >
                  Editează profilul public
                </a>
              </li>
              <li>
                <a
                  href="/admin/availability"
                  className="text-[var(--accent)] hover:underline"
                >
                  Modulul de disponibilitate
                </a>
              </li>
              <li>
                <a
                  href="/events/new"
                  className="text-[var(--accent)] hover:underline"
                >
                  Creează eveniment cu bilete
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

/* =====================================================================
   ADMIN DASHBOARD
===================================================================== */

async function AdminDashboard(props: { email: string }) {
  const [users, providers, venues, events, bookings, leads] =
    await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.venue.count(),
      prisma.event.count(),
      prisma.booking.count(),
      prisma.lead.count(),
    ]);

  const pendingProviderApprovals = 0;
  const pendingEventPromos = 0;
  const pendingProviderPromos = 0;

  return (
    <main className="mx-auto max-w-6xl min-h-[70vh] px-4 pb-14 pt-6 md:px-6">
      {/* HEADER */}
      <section
        className="
          relative overflow-hidden rounded-[30px]
          border border-[var(--border-subtle)]
          bg-[rgba(3,17,13,0.97)]
          px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8
          shadow-[0_32px_140px_rgba(0,0,0,0.95)]
          backdrop-blur-[26px]
        "
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-18 top-[-40%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(22,48,43,0.8),transparent)] blur-3xl opacity-90" />
          <div className="absolute -right-22 bottom-[-45%] h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,133,96,0.6),transparent)] blur-3xl opacity-90" />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Admin dashboard
            </p>
            <h1 className="mt-1 text-[2rem] font-semibold leading-tight text-[var(--text-main)]">
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

          <div className="grid gap-2 text-[11px] text-[var(--text-main)] sm:grid-cols-3">
            <AdminBadge
              label="Aplicări provider"
              value={pendingProviderApprovals}
            />
            <AdminBadge
              label="Promo evenimente"
              value={pendingEventPromos}
            />
            <AdminBadge
              label="Promo provideri"
              value={pendingProviderPromos}
            />
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <AdminStat label="Utilizatori" value={users} accent />
          <AdminStat label="Provideri" value={providers} />
          <AdminStat label="Săli" value={venues} />
          <AdminStat label="Evenimente" value={events} />
          <AdminStat label="Rezervări" value={bookings} />
          <AdminStat label="Leads" value={leads} />
        </div>
      </section>

      {/* Основные админ-блоки */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminCard
          title="Leads & cereri"
          desc="Vezi toate cererile de la clienți către săli și artiști."
          href="/admin/leads"
          cta="Deschide tabela cu leads"
        />
        <AdminCard
          title="Provideri"
          desc="Monitorizează profilurile providerilor și statusul lor."
          href="/admin/providers"
          cta="Gestionează providerii"
        />
        <AdminCard
          title="Disponibilitate & calendar"
          desc="Intră în modulul de disponibilitate și verifică agendele."
          href="/admin/availability"
          cta="Deschide calendarul"
        />
      </section>
    </main>
  );
}

function AdminStat(props: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl border border-[var(--border-subtle)]
        px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.9)]
        ${
          props.accent
            ? "bg-gradient-to-br from-[var(--accent)]/20 to-black/80"
            : "bg-[rgba(2,9,8,0.96)]"
        }
      `}
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {props.label}
      </div>
      <div className="mt-1 text-xl font-semibold text-[var(--text-main)]">
        {props.value}
      </div>
    </div>
  );
}

function AdminBadge(props: { label: string; value: number }) {
  const hasItems = props.value > 0;
  return (
    <div
      className={`
        inline-flex items-center justify-between gap-2 rounded-full
        border px-3 py-1.5
        ${
          hasItems
            ? "border-[var(--accent)]/70 bg-[var(--accent)]/15"
            : "border-[var(--border-subtle)] bg-black/55"
        }
      `}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {props.label}
      </span>
      <span
        className={`
          rounded-full px-2 py-[1px] text-[11px] font-semibold
          ${
            hasItems
              ? "bg-black text-[var(--accent)]"
              : "bg-zinc-800 text-[var(--text-main)]"
          }
        `}
      >
        {props.value}
      </span>
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
      className="
        group block rounded-[22px]
        border border-[var(--border-subtle)]
        bg-[rgba(3,17,13,0.96)]
        p-4 text-xs
        shadow-[0_20px_70px_rgba(0,0,0,0.9)]
        backdrop-blur-[20px]
        transition
        hover:border-[var(--accent)]/70 hover:bg-white/[0.03]
      "
    >
      <div className="text-sm font-semibold text-[var(--text-main)]">
        {props.title}
      </div>
      <p className="mt-2 text-[var(--text-muted)]">{props.desc}</p>
      <div className="mt-3 text-[11px] font-medium text-[var(--accent)] group-hover:underline">
        {props.cta} →
      </div>
    </a>
  );
}
