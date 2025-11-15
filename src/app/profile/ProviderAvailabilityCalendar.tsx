// src/app/profile/ProviderAvailabilityCalendar.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export type Status = "free" | "partial" | "busy";

export type DayInput = {
  date: string;   // ISO full: "2025-11-19T00:00:00.000Z"
  status: Status;
};

type MonthDay = {
  iso: string;   // "YYYY-MM-DD"
  day: number;   // 1..31
  status: Status;
};

type Month = {
  key: string;
  title: string;
  leading: number;
  days: MonthDay[];
};

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export default function ProviderAvailabilityCalendar({
  days,
}: {
  days: DayInput[];
}) {
  const router = useRouter();

  // карта: "YYYY-MM-DD" -> status
  const statusByKey = new Map<string, Status>();
  for (const d of days || []) {
    const isoKey = new Date(d.date).toISOString().slice(0, 10);
    statusByKey.set(isoKey, d.status);
  }

  const months = buildMonths(statusByKey);

  function openDay(iso: string) {
    // iso уже формата YYYY-MM-DD
    router.push(`/provider/calendar/${iso}`);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface/80 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">
          Calendar disponibilitate
        </h2>
        <div className="flex gap-2 text-[10px] text-zinc-500">
          <Legend color="bg-emerald-400" label="Liber" />
          <Legend color="bg-amber-400" label="Parțial" />
          <Legend color="bg-red-500" label="Ocupat" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {months.map((m) => (
          <div
            key={m.key}
            className="rounded-2xl border border-white/5 bg-black/40 p-3 text-xs"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[12px] font-semibold text-zinc-100">
                {m.title}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[10px] text-zinc-500">
              {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
                <div key={d} className="py-1 text-center">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: m.leading }, (_, i) => (
                <div key={`lead-${i}`} className="h-9 rounded-md bg-white/0" />
              ))}

              {m.days.map((d) => {
                const isBusy = d.status === "busy";
                const isPartial = d.status === "partial";
                const isFree = d.status === "free";

                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => openDay(d.iso)}
                    className={cn(
                      "h-9 rounded-md border text-[11px] leading-9 transition focus:outline-none",
                      isBusy &&
                        "border-red-500/50 bg-red-500/10 text-red-100 hover:border-red-400",
                      isPartial &&
                        "border-amber-500/50 bg-amber-500/10 text-amber-100 hover:border-amber-400",
                      isFree &&
                        "border-emerald-500/40 bg-emerald-500/8 text-emerald-100 hover:border-emerald-400/80"
                    )}
                    title={statusLabel(d.status)}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      <span>{label}</span>
    </span>
  );
}

function statusLabel(s: Status) {
  switch (s) {
    case "free":
      return "Liber";
    case "partial":
      return "Parțial liber";
    case "busy":
      return "Ocupat";
  }
}

function buildMonths(statusByKey: Map<string, Status>): Month[] {
  const now = new Date();
  const year1 = now.getUTCFullYear();
  const month1 = now.getUTCMonth(); // 0..11

  const year2 = month1 === 11 ? year1 + 1 : year1;
  const month2 = (month1 + 1) % 12;

  const specs = [
    { year: year1, month: month1 },
    { year: year2, month: month2 },
  ];

  return specs.map(({ year, month }) => {
    const first = new Date(Date.UTC(year, month, 1));
    const last = new Date(Date.UTC(year, month + 1, 0));
    const totalDays = last.getUTCDate();

    const leading = (first.getUTCDay() + 6) % 7; // Lu = 0
    const title = first.toLocaleString("ro-RO", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    const days: MonthDay[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const iso = new Date(Date.UTC(year, month, d))
        .toISOString()
        .slice(0, 10); // YYYY-MM-DD
      const status = statusByKey.get(iso) ?? "free";
      days.push({ iso, day: d, status });
    }

    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      title,
      leading,
      days,
    };
  });
}
