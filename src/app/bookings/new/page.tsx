"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type DayStatus = "free" | "partial" | "busy";

export type PublicDay = {
  date: string; // ISO string
  status: DayStatus;
};

type Props = {
  providerId: string;
  days: PublicDay[];
};

type CalendarCell = {
  day?: number;
  iso?: string;
  status?: DayStatus;
};

function buildMonthGrid(opts: {
  year: number;
  month: number; // 0..11
  days: PublicDay[];
}): CalendarCell[] {
  const { year, month, days } = opts;
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = last.getUTCDate();

  const map = new Map<string, DayStatus>();
  days.forEach((d) => {
    const iso = d.date.slice(0, 10);
    map.set(iso, d.status);
  });

  const cells: CalendarCell[] = [];

  // Monday first
  const pad = (first.getUTCDay() + 6) % 7;
  for (let i = 0; i < pad; i++) cells.push({});

  for (let day = 1; day <= totalDays; day++) {
    const iso = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
    const status = map.get(iso) ?? undefined;
    cells.push({ day, iso, status });
  }

  return cells;
}

export default function PublicProviderCalendar({ providerId, days }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const monthLabel = current.toLocaleString("ro-RO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const grid = useMemo(
    () =>
      buildMonthGrid({
        year: current.getUTCFullYear(),
        month: current.getUTCMonth(),
        days,
      }),
    [current, days]
  );

  function changeMonth(delta: number) {
    setCurrent((prev) => {
      const y = prev.getUTCFullYear();
      const m = prev.getUTCMonth() + delta;
      return new Date(Date.UTC(y, m, 1));
    });
  }

  function handleDayClick(cell: CalendarCell) {
    if (!cell.iso || !cell.status) return;
    if (cell.status === "busy") return; // занято, не кликаем

    const dateParam = cell.iso; // YYYY-MM-DDTHH...
    router.push(
      `/bookings/new?providerId=${encodeURIComponent(
        providerId
      )}&date=${encodeURIComponent(dateParam)}`
    );
  }

  return (
    <div className="w-full rounded-2xl border border-line bg-bg/80 p-3 text-xs text-zinc-200">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-200" />
        </button>
        <span className="text-[13px] font-medium capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4 text-zinc-200" />
        </button>
      </div>

      {/* weekday header */}
      <div className="grid grid-cols-7 gap-1 text-[10px] text-zinc-500">
        {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
          <div key={d} className="py-1 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* days */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((cell, idx) => {
          if (!cell.day || !cell.iso) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-12 rounded-lg bg-white/[.02]"
              />
            );
          }

          let bg = "bg-white/[.03]";
          let border = "border-zinc-800/80";
          let text = "text-zinc-100";
          let label = "Fără date";

          if (cell.status === "busy") {
            bg = "bg-red-500/8";
            border = "border-red-500/40";
            text = "text-red-100";
            label = "Ocupat";
          } else if (cell.status === "partial") {
            bg = "bg-amber-500/8";
            border = "border-amber-500/50";
            text = "text-amber-50";
            label = "Parțial liber";
          } else if (cell.status === "free") {
            bg = "bg-emerald-500/7";
            border = "border-emerald-500/40";
            text = "text-emerald-50";
            label = "Liber";
          }

          const clickable = cell.status === "free" || cell.status === "partial";

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => clickable && handleDayClick(cell)}
              className={`flex h-12 flex-col rounded-lg border px-1.5 py-1 text-left transition ${
                bg
              } ${border} ${
                clickable
                  ? "hover:translate-y-[0.5px] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                  : "opacity-70"
              }`}
            >
              <span className="text-[11px] font-medium opacity-80">
                {cell.day}
              </span>
              <span className={`mt-auto text-[10px] leading-tight ${text}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}