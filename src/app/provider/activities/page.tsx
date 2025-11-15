// src/app/provider/activities/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getProviderCapabilities } from "@/lib/capabilities";

export default async function ActivitiesDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/provider/activities");

  const { hasActivities } = await getProviderCapabilities(user.id);
  if (!hasActivities) redirect("/profile");

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!provider) redirect("/onboarding/provider");

  const acts = await prisma.activity.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      city: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main
      className="
        mx-auto max-w-5xl
        px-4 pb-10 pt-4 md:px-6 md:pt-6
        min-h-[calc(100vh-140px)]
      "
    >
      {/* HEADER STRIP */}
      <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Provider · Activități
          </div>
          <h1 className="mt-2 text-xl font-semibold text-[var(--text-main)] md:text-2xl">
            Activitățile mele
          </h1>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
            Creează experiențe (yacht, salt cu parașuta, tururi, ateliere) și
            administrează-le dintr-un singur loc.
          </p>
        </div>

        <a
          href="/provider/activities/new"
          className="
            inline-flex items-center justify-center
            rounded-full bg-[var(--accent)]
            px-4 py-2.5
            text-sm font-semibold text-[#1b1207]
            shadow-[0_18px_40px_rgba(0,0,0,0.9)]
            hover:brightness-110
          "
        >
          + Adaugă activitate
        </a>
      </div>

      {/* LISTĂ ACTIVITĂȚI */}
      {acts.length > 0 ? (
        <div className="space-y-3">
          {acts.map((a) => {
            const chip = getStatusChip(a.status);
            const created = formatDate(a.createdAt);

            return (
              <a
                key={a.id}
                href={`/provider/activities/${a.id}/edit`}
                className="
                  group block
                  rounded-[22px]
                  border border-[var(--border-subtle)]
                  bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.10),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.96),rgba(3,17,13,0.98))]
                  px-4 py-3.5 md:px-5 md:py-4
                  text-sm text-[var(--text-main)]
                  shadow-[0_20px_70px_rgba(0,0,0,0.95)]
                  transition-all duration-200
                  hover:border-[var(--border-accent)]
                  hover:bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.18),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(6,32,26,1),rgba(3,17,13,1))]
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[14px] font-semibold md:text-[15px]">
                        {a.title || "Fără titlu"}
                      </h2>
                      {chip && (
                        <span
                          className={`
                            inline-flex items-center gap-1
                            rounded-full px-2 py-[2px]
                            text-[10px] uppercase tracking-[0.16em]
                            ${chip.className}
                          `}
                        >
                          {chip.dot && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                          {chip.label}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      {a.city && (
                        <span className="rounded-full bg-black/40 px-2 py-[2px]">
                          {a.city}
                        </span>
                      )}
                      <span className="rounded-full bg-black/40 px-2 py-[2px]">
                        Creată: {created}
                      </span>
                    </div>
                  </div>

                  <span className="ml-2 text-[18px] text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]">
                    ↗
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Editare / detalii activitate</span>
                  <span className="h-[1px] w-16 rounded-full bg-white/10 group-hover:bg-[var(--accent)]" />
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div
          className="
            mt-3 flex flex-col items-start gap-3 rounded-[22px]
            border border-[var(--border-subtle)]
            bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.06),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.96),rgba(3,17,13,0.98))]
            px-4 py-5 md:px-5
            text-sm text-[var(--text-main)]
            shadow-[0_20px_70px_rgba(0,0,0,0.95)]
          "
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/60 text-lg">
              ✨
            </div>
            <div>
              <p className="text-[14px] font-semibold">
                Nu ai încă activități publicate
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                Pornește cu prima ta experiență: yacht, tur, atelier,
                degustare sau orice altă activitate pe care o oferi.
              </p>
            </div>
          </div>
          <a
            href="/provider/activities/new"
            className="
              mt-2 inline-flex items-center justify-center
              rounded-full bg-[var(--accent)]
              px-4 py-2
              text-xs font-semibold text-[#1b1207]
              shadow-[0_16px_40px_rgba(0,0,0,0.9)]
              hover:brightness-110
            "
          >
            + Creează prima activitate
          </a>
        </div>
      )}
    </main>
  );
}

/* ---------- helpers ---------- */

function formatDate(date: Date) {
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

function getStatusChip(status: string | null) {
  if (!status) return null;
  const s = status.toLowerCase();

  if (s.includes("draft")) {
    return {
      label: "Draft",
      className: "bg-black/40 text-[var(--text-muted)] ring-1 ring-white/10",
      dot: false,
    };
  }
  if (s.includes("publish") || s === "active") {
    return {
      label: "Publicat",
      className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/60",
      dot: true,
    };
  }
  if (s.includes("hidden") || s.includes("inactive")) {
    return {
      label: "Ascuns",
      className: "bg-zinc-700/25 text-zinc-300 ring-1 ring-zinc-500/50",
      dot: false,
    };
  }

  return {
    label: status,
    className: "bg-black/40 text-[var(--text-muted)] ring-1 ring-white/10",
    dot: false,
  };
}
