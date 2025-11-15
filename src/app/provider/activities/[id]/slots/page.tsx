// src/app/provider/activities/[id]/slots/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ActivitySlotsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/provider/activities");

  const activity = await prisma.activity.findFirst({
    where: { id: params.id, provider: { userId: user.id } },
    select: { id: true, title: true },
  });
  if (!activity) redirect("/provider/activities");

  const slots = await prisma.activitySlot.findMany({
    where: { activityId: activity.id },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      status: true,
      note: true,
      startAt: true,
      endAt: true,
      // capacity: true, // ❌ такого поля нет в типах, убираем
    },
  });

  return (
    <section className="mx-auto max-w-3xl px-4 pb-8 pt-5 md:px-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-main)] md:text-2xl">
            Sloturi — {activity.title}
          </h1>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
            Definește zilele și orele în care activitatea ta este disponibilă.
          </p>
        </div>
      </div>

      {/* FORMULAR ADĂUGARE SLOT */}
      <form
        method="POST"
        action="/api/provider/activities/slots"
        className="
          mt-2 grid gap-3 rounded-[22px]
          border border-[var(--border-subtle)]
          bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.10),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.96),rgba(3,17,13,0.98))]
          p-4 text-sm shadow-[0_20px_70px_rgba(0,0,0,0.95)]
        "
      >
        <input type="hidden" name="activityId" value={activity.id} />

        <label className="grid gap-1">
          <span className="text-xs text-[var(--text-muted)]">Data</span>
          <input
            type="date"
            name="date"
            className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-black/40 px-3 text-[13px]"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-[var(--text-muted)]">De la</span>
            <input
              type="time"
              name="timeFrom"
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-black/40 px-3 text-[13px]"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-[var(--text-muted)]">Până la</span>
            <input
              type="time"
              name="timeTo"
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-black/40 px-3 text-[13px]"
            />
          </label>
        </div>

        {/* Блок с capacity оставляю в форме, вдруг API его уже принимает.
            Это не ломает типы, т.к. форма — обычный HTML */}
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-[var(--text-muted)]">Capacitate</span>
            <input
              type="number"
              name="capacity"
              min={0}
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-black/40 px-3 text-[13px]"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-[var(--text-muted)]">Status</span>
            <select
              name="status"
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-black/40 px-3 text-[13px]"
            >
              <option value="free">Liber</option>
              <option value="partial">Parțial</option>
              <option value="busy">Ocupat</option>
              <option value="closed">Închis</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-xs text-[var(--text-muted)]">Notă internă</span>
          <input
            name="note"
            className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-black/40 px-3 text-[13px]"
            placeholder="Ex: doar grupuri mici, vreme bună etc."
          />
        </label>

        <div className="flex justify-end pt-1">
          <button
            className="
              rounded-full bg-[var(--accent)]
              px-4 py-2 text-sm font-semibold text-[#1b1207]
              shadow-[0_16px_40px_rgba(0,0,0,0.9)]
              hover:brightness-110
            "
          >
            Adaugă slot
          </button>
        </div>
      </form>

      {/* LISTĂ SLOTURI EXISTENTE */}
      <div className="mt-6 space-y-2">
        {slots.map((s) => {
          const d = formatDate(s.startAt);
          const from = formatTime(s.startAt);
          const to = s.endAt ? formatTime(s.endAt) : "—";

          return (
            <div
              key={s.id}
              className="
                flex items-center justify-between gap-3
                rounded-[18px] border border-[var(--border-subtle)]
                bg-black/40 px-3.5 py-2.5 text-[13px]
              "
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black/60 px-2 py-[2px] text-[11px] text-[var(--text-main)]">
                    {d}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {from} – {to}
                  </span>
                  <StatusPill status={s.status} />
                </div>
                {s.note && (
                  <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                    {s.note}
                  </div>
                )}
              </div>
              {/* capacity в слоте убран, чтобы типов не было */}
            </div>
          );
        })}

        {slots.length === 0 && (
          <div className="rounded-[18px] border border-[var(--border-subtle)] bg-black/40 px-3.5 py-3 text-sm text-[var(--text-muted)]">
            Încă nu sunt sloturi definite pentru această activitate.
          </div>
        )}
      </div>
    </section>
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
    return date.toISOString().slice(0, 10);
  }
}

function formatTime(date: Date) {
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";

  if (s === "free") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Liber
      </span>
    );
  }
  if (s === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        Parțial
      </span>
    );
  }
  if (s === "busy") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-red-300">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Ocupat
      </span>
    );
  }
  if (s === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/25 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-zinc-300">
        Închis
      </span>
    );
  }

  return null;
}
