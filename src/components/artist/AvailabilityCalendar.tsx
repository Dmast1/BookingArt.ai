"use client";

import { useMemo, useState } from "react";

// Простейшая имитация статусов на месяц
type DayStatus = "free" | "partial" | "busy";
type Map = Record<number, DayStatus>;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function AvailabilityCalendar() {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth()); // 0..11

  const days = getDaysInMonth(year, month);

  // демо-данные статуса дней
  const statuses: Map = useMemo(() => {
    const map: Map = {};
    for (let d = 1; d <= days; d++) {
      if (d % 7 === 0) map[d] = "busy";         // занято
      else if (d % 5 === 0) map[d] = "partial"; // частично
      else map[d] = "free";
    }
    return map;
  }, [days]);

  const wd = (new Date(year, month, 1).getDay() + 6) % 7; // понедельник-старт
  const totalCells = wd + days;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="rounded-2xl border border-line bg-white/[.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-200">
          {new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric" }).format(new Date(year, month, 1))}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-full bg-emerald-500/60" /> Liber
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-full bg-amber-500/70" /> Parțial
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-full bg-rose-500/70" /> Rezervat
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-400">
        {["Lu","Ma","Mi","Jo","Vi","Sâ","Du"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: rows * 7 }).map((_, i) => {
          const d = i - wd + 1;
          const inside = d >= 1 && d <= days;
          const st = inside ? statuses[d] : undefined;
          const tone =
            st === "busy" ? "bg-rose-500/15 border-rose-500/30" :
            st === "partial" ? "bg-amber-500/15 border-amber-500/30" :
            st === "free" ? "bg-emerald-500/10 border-emerald-500/25" : "bg-transparent border-transparent";

          return (
            <div
              key={i}
              className={`min-h-[56px] rounded-xl border ${tone} grid place-items-center text-sm text-zinc-200`}
              title={
                st === "busy"
                  ? "Rezervat integral"
                  : st === "partial"
                  ? "Rezervare parțială (ex. 12:00–14:00)"
                  : st === "free"
                  ? "Liber"
                  : ""
              }
            >
              {inside ? d : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
