// src/app/admin/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — BookingArt.ai",
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth?next=/admin");
  }
  return user;
}

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  const [
    usersCount,
    providersCount,
    venuesCount,
    leadsCount,
    bookingsCount,
    eventsCount,
    ticketOrdersCount,
    // новое: активити total и pending
    activitiesTotal,
    activitiesPending,
    // опционально: провайдеры, требующие верификации (KYC)
    providersKycPending,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.venue.count(),
    prisma.lead.count(),
    prisma.booking.count(),
    prisma.event.count(),
    prisma.ticketOrder.count(),
    prisma.activity.count(),
    prisma.activity.count({ where: { status: "pending" } }),
    prisma.provider.count({ where: { kycStatus: "pending" } }),
  ]);

  const [recentLeads, recentBookings, recentPendingActivities] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        venue: { select: { name: true, city: true } },
        provider: { select: { displayName: true, city: true } },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true } },
        provider: { select: { displayName: true } },
      },
    }),
    prisma.activity.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        city: true,
        status: true,
        createdAt: true,
        provider: { select: { displayName: true } },
      },
    }),
  ]);

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            BookingArt.ai — Admin
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Logat ca{" "}
            <span className="font-medium text-zinc-100">{user.email}</span>.
          </p>
        </div>
        <p className="text-xs text-zinc-500 md:text-right">
          Panou pentru monitorizare utilizatori, provideri, săli, lead-uri,
          rezervări, bilete și activități.
        </p>
      </header>

      {/* Статы */}
      <div className="grid gap-4 md:grid-cols-6">
        <StatCard title="Utilizatori" value={usersCount} accent />
        <StatCard title="Provideri" value={providersCount} />
        <StatCard title="Săli" value={venuesCount} />
        <StatCard title="Leads" value={leadsCount} />
        <StatCard title="Rezervări" value={bookingsCount} />
        <StatCard title="Comenzi bilete" value={ticketOrdersCount} />
      </div>

      {/* Доп. статы по Activități и KYC */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard title="Activități — total" value={activitiesTotal} />
        <StatCard
          title="Activități în așteptare"
          value={activitiesPending}
          accent
        />
        <StatCard title="Provideri KYC pending" value={providersKycPending} />
      </div>

      {/* Быстрые ссылки */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <LinkCard
          title="Leads & cereri"
          desc="Monitorizează cererile trimise către săli și artiști."
          href="/admin/leads"
          cta="Deschide tabela cu leads"
        />
        <LinkCard
          title="Provideri & artiști"
          desc="Vezi lista furnizorilor înrolați și profilele lor publice."
          href="/admin/providers"
          cta="Gestionează providerii"
        />
        <LinkCard
          title="Săli de evenimente"
          desc="Administrează locațiile listate pe BookingArt.ai."
          href="/admin/venues"
          cta="Vezi toate sălile"
        />
        <LinkCard
          title="Evenimente & bilete"
          desc="Concerte și show-uri cu bilete vândute prin platformă."
          href="/admin/events"
          cta="Administrează evenimentele"
        />
        <LinkCard
          title="Rezervări private"
          desc="Contracte între clienți și artiști / săli."
          href="/bookings"
          cta="Deschide lista de rezervări"
        />
        <LinkCard
          title="Comenzi de bilete"
          desc="Orderele de bilete vândute prin sistemul de ticketing."
          href="/admin/tickets"
          cta="Vezi comenzi bilete"
        />

        {/* Новый быстрый вход в модерацию Activități */}
        <LinkCard
          title="Activități — moderare"
          desc="Revizuiește și aprobă activitățile propuse (pending)."
          href="/admin/activities"
          cta={`Deschide (în așteptare: ${activitiesPending})`}
        />
      </div>

      {/* Превью-таблицы: свежие лиды, резервации, и заявки Activități */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface/80 p-4 text-xs">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              Ultimele leads
            </h2>
            <a
              href="/admin/leads"
              className="text-[11px] text-accent hover:underline"
            >
              Toate leads →
            </a>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-zinc-400">
              Încă nu există leads în sistem (cereri către săli / provider).
            </p>
          ) : (
            <ul className="space-y-2">
              {recentLeads.map((l) => (
                <li
                  key={l.id}
                  className="rounded-xl border border-white/5 bg-bg px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-400">
                      {l.id.slice(0, 8)}…
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {l.createdAt.toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-300">
                    {l.email} · {l.city ?? "—"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">
                    {l.venue
                      ? `Sala: ${l.venue.name} (${l.venue.city})`
                      : l.provider
                      ? `Provider: ${l.provider.displayName} (${l.provider.city ?? "—"})`
                      : "Fără destinație setată"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface/80 p-4 text-xs">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              Ultimele rezervări
            </h2>
            <a
              href="/bookings"
              className="text-[11px] text-accent hover:underline"
            >
              Toate rezervările →
            </a>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-zinc-400">
              Nu există încă rezervări în sistem.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentBookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border border-white/5 bg-bg px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-400">
                      {b.id.slice(0, 8)}…
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {b.createdAt.toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-300">
                    {b.city ?? "—"} ·{" "}
                    {b.date.toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {b.status}
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">
                    client: {b.user?.email ?? "—"} · provider:{" "}
                    {b.provider?.displayName ?? "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Превью очереди модерации Activități */}
      <div className="mt-8 rounded-2xl border border-line bg-surface/80 p-4 text-xs">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">
            Activități în așteptare (ultimele)
          </h2>
          <a
            href="/admin/activities"
            className="text-[11px] text-accent hover:underline"
          >
            Deschide lista completă →
          </a>
        </div>

        {recentPendingActivities.length === 0 ? (
          <p className="text-zinc-400">Nu există activități în așteptare.</p>
        ) : (
          <ul className="space-y-2">
            {recentPendingActivities.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-white/5 bg-bg px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-100">
                    {a.title}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {a.createdAt.toLocaleString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-400">
                  {a.city ?? "—"} · provider: {a.provider?.displayName ?? "—"} · {a.status}
                </div>
                <div className="mt-2">
                  <a
                    href={`/admin/activities/${a.id}`}
                    className="inline-flex items-center rounded-lg border border-white/10 px-2 py-1 text-[11px] text-accent hover:border-[var(--accent)]/60"
                  >
                    Deschide cardul →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatCard(props: {
  title: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-line px-4 py-3 ${
        props.accent
          ? "bg-gradient-to-br from-[var(--accent)]/15 to-bg"
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

function LinkCard(props: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <a
      href={props.href}
      className="group block rounded-2xl border border-line bg-surface/80 p-4 transition hover:border-[var(--accent)]/60 hover:bg-white/5"
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
