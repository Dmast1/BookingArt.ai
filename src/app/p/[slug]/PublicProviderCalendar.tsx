"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export type Status = "free" | "partial" | "busy";

export type DayInput = {
  date: string; // ISO
  status: Status;
};

type MonthDay = {
  iso: string; // "YYYY-MM-DD"
  day: number;
  status?: Status;
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

export default function PublicProviderCalendar({
  providerSlug,
  days,
}: {
  providerSlug: string;
  days: DayInput[];
}) {
  const router = useRouter();

  if (!days || days.length === 0) {
    return (
      <p className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 ring-1 ring-white/5">
        Providerul nu a setat încă disponibilitatea publică în calendar. După
        ce își actualizează zilele libere în cabinet, acestea vor apărea aici.
      </p>
    );
  }

  const months = buildMonths(days);
  const [index, setIndex] = useState(0);
  const active = months[Math.min(index, months.length - 1)];

  function goPrev() {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }

  function goNext() {
    setIndex((i) => (i < months.length - 1 ? i + 1 : i));
  }

  function onDayClick(dayIso: string, status?: Status) {
    // занятые или без статуса — не кликаем
    if (!status || status === "busy") return;
    router.push(`/providers/${providerSlug}?date=${dayIso}`);
  }

  return (
    <div className="rounded-[22px] bg-[radial-gradient(circle_at_top,#0d2c20,transparent_70%)] px-3 py-3.5 text-[11px] text-zinc-300 ring-1 ring-[#223c30] sm:px-4 sm:py-4">
      {/* верхняя строка: месяц + стрелки */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="truncate text-sm font-medium text-zinc-100">
          {active.title}
        </div>
        <div className="flex items-center gap-1.5">
          <MonthNavButton onClick={goPrev} disabled={index === 0}>
            ‹
          </MonthNavButton>
          <MonthNavButton
            onClick={goNext}
            disabled={index === months.length - 1}
          >
            ›
          </MonthNavButton>
        </div>
      </div>

      {/* дни недели */}
      <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
        {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((w) => (
          <div key={w} className="py-1 text-center">
            {w}
          </div>
        ))}
      </div>

      {/* дни месяца */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: active.leading }, (_, i) => (
          <div key={`lead-${i}`} className="h-9 rounded-[10px] bg-black/10" />
        ))}

        {active.days.map((d) => {
          const isBusy = d.status === "busy" || !d.status;
          const isPartial = d.status === "partial";
          const isFree = d.status === "free";

          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => onDayClick(d.iso, d.status)}
              disabled={isBusy}
              className={cn(
                "flex h-9 items-center justify-center rounded-[10px] bg-black/20 text-[11px] transition focus:outline-none",
                "shadow-[0_0_0_1px_rgba(0,0,0,0.45)]",
                !isBusy && "hover:bg-black/30",
                isBusy && "cursor-default opacity-60"
              )}
              title={d.status ? statusLabel(d.status) : "Fără informații"}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] shadow-sm",
                  isFree &&
                    "border-emerald-400 bg-emerald-500/90 text-emerald-50",
                  isPartial &&
                    "border-sky-400 bg-sky-500/90 text-sky-50",
                  isBusy &&
                    "border-zinc-600 bg-zinc-700/60 text-zinc-200"
                )}
              >
                {d.day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------- вспомогательные компоненты и функции ---------- */

function MonthNavButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border border-[#2a5040] bg-black/60 text-[11px] text-zinc-100 shadow-[0_0_0_1px_rgba(0,0,0,0.55)]",
        "hover:border-emerald-400 hover:text-emerald-100",
        disabled && "cursor-default opacity-40 hover:border-[#2a5040]"
      )}
    >
      {children}
    </button>
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

function buildMonths(days: DayInput[]): Month[] {
  if (!days || days.length === 0) return [];

  const statusMap = new Map<string, Status>();
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  for (const d of days) {
    const dt = new Date(d.date);
    if (Number.isNaN(dt.getTime())) continue;
    const key = dt.toISOString().slice(0, 10);
    statusMap.set(key, d.status);

    if (!minDate || dt < minDate) minDate = dt;
    if (!maxDate || dt > maxDate) maxDate = dt;
  }

  if (!minDate || !maxDate) return [];

  const start = new Date(
    Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), 1)
  );

  const months: Month[] = [];

  for (
    let cursor = start;
    cursor <= end;
    cursor = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)
    )
  ) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth();

    const key = `${y}-${String(m + 1).padStart(2, "0")}`;

    const first = new Date(Date.UTC(y, m, 1));
    const last = new Date(Date.UTC(y, m + 1, 0));
    const leading = (first.getUTCDay() + 6) % 7;
    const daysInMonth = last.getUTCDate();

    const daysArr: MonthDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = new Date(Date.UTC(y, m, day)).toISOString().slice(0, 10);
      const status = statusMap.get(iso);
      daysArr.push({ iso, day, status });
    }

    const title = first.toLocaleString("ro-RO", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    months.push({ key, title, leading, days: daysArr });
  }

  return months;
}
