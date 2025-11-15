// src/app/provider/calendar/[date]/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Setează disponibilitatea — BookingArt.ai",
};

type PageProps = {
  // ВАЖНО: params — это Promise
  params: Promise<{ date: string }>;
};

function parseAvailabilityNote(noteRaw: string | null) {
  if (!noteRaw) {
    return { timeFrom: "", timeTo: "", note: "" };
  }

  let note = noteRaw;
  let timeFrom = "";
  let timeTo = "";

  const lines = noteRaw.split("\n");
  const idx = lines.findIndex((line) =>
    line.trim().toLowerCase().startsWith("interval:")
  );

  if (idx >= 0) {
    const line = lines[idx].trim();
    const match = line.match(
      /Interval:\s*([0-9:?]{1,5})\s*-\s*([0-9:?]{1,5})/i
    );
    if (match) {
      timeFrom = match[1] !== "?" ? match[1] : "";
      timeTo = match[2] !== "?" ? match[2] : "";
    }
    lines.splice(idx, 1);
    note = lines.join("\n").trim();
  }

  return { timeFrom, timeTo, note };
}

export default async function ProviderAvailabilityDayPage({ params }: PageProps) {
  // params нужно await-нуть
  const { date: raw } = await params;

  console.log("[calendar page] raw date param =", raw);

  const parts = (raw || "").split("-");
  if (parts.length !== 3) {
    redirect("/profile");
  }

  const [yRaw, mRaw, dRaw] = parts;
  const y = Number(yRaw);
  const m = Number(mRaw);
  const d = Number(dRaw);

  if (!y || !m || !d || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    redirect("/profile");
  }

  // дата строго по URL, в UTC
  const date = new Date(Date.UTC(y, m - 1, d));

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=/provider/calendar/${raw}`);
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
  });

  if (!provider) {
    redirect("/providers/new");
  }

  const availability = await prisma.availability.findFirst({
    where: {
      providerId: provider.id,
      date,
    },
  });

  const { timeFrom, timeTo, note } = parseAvailabilityNote(
    availability?.note ?? null
  );

  const status =
    (availability?.status as "free" | "busy" | "partial") ?? "free";

  const humanDate = date.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const shortDate = date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 pb-10 pt-6">
      <a
        href="/profile"
        className="inline-flex items-center text-xs text-zinc-400 hover:text-accent"
      >
        ← Înapoi la cabinet
      </a>

      <div className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#050509] via-[#05030f] to-[#140a08] p-5 shadow-[0_26px_120px_rgba(0,0,0,0.9)] md:p-6">
        <header className="mb-4 flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
            Calendar provider · {shortDate}
          </div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            Setează disponibilitatea pentru {humanDate}
          </h1>
          <p className="text-xs text-zinc-400">
            {provider.displayName
              ? `${provider.displayName} · ${provider.city ?? "—"}`
              : `Provider ID ${provider.id}`}
          </p>
        </header>

        <form
          method="POST"
          action="/api/provider/calendar"
          className="space-y-5"
        >
          {/* ту же дату отправляем на API */}
          <input type="hidden" name="date" value={raw} />

          {/* STATUS */}
          <div>
            <div className="text-xs font-medium text-zinc-300">
              Status pentru această zi
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              {[
                {
                  value: "free",
                  label: "Liber",
                  desc: "Poți primi rezervări toată ziua.",
                },
                {
                  value: "partial",
                  label: "Parțial ocupat",
                  desc: "Ai deja un eveniment, dar mai poți lua unul.",
                },
                {
                  value: "busy",
                  label: "Ocupat",
                  desc: "Complet blocat, nu accepți alte evenimente.",
                },
              ].map((opt) => {
                const checked = status === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={
                      "flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-2 transition " +
                      (checked
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-line bg-surface/90 hover:border-[var(--accent)]/60")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        defaultChecked={checked}
                        className="h-3.5 w-3.5 rounded-full border border-zinc-500 text-[var(--accent)] focus:ring-0"
                      />
                      <span className="text-[11px] font-semibold text-zinc-100">
                        {opt.label}
                      </span>
                    </div>
                    <span className="pl-5 text-[10px] text-zinc-500">
                      {opt.desc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* INTERVAL ORAR */}
          <div>
            <div className="mb-2 text-xs font-medium text-zinc-300">
              Interval orar (opțional)
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-[11px] text-zinc-400">
                  De la
                </label>
                <input
                  type="time"
                  name="timeFrom"
                  defaultValue={timeFrom}
                  className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/70"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400">
                  Până la
                </label>
                <input
                  type="time"
                  name="timeTo"
                  defaultValue={timeTo}
                  className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/70"
                />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Dacă lași gol, considerăm că statusul este valabil pentru toată
              ziua (ex: blocat complet).
            </p>
          </div>

          {/* NOTE */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Note pentru această zi
            </label>
            <textarea
              name="note"
              defaultValue={note}
              placeholder="Ex: Nuntă confirmată în Cluj · 18:00–02:00 · 150 pers."
              className="mt-1 min-h-[100px] w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[var(--accent)]/70"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Momentan aceste note sunt doar pentru tine. În versiunea publică a
              calendarului le vom afișa într-un mod simplificat pentru clienți.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <a
              href="/profile"
              className="text-xs text-zinc-400 hover:text-accent"
            >
              Anulează
            </a>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110"
            >
              Salvează modificările
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
