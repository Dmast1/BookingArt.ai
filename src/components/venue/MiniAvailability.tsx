"use client";

type DayStatus = "free" | "partial" | "busy";

export default function MiniAvailability({
  year,
  month, // 0..11
  map,   // { [day: number]: DayStatus }
}: {
  year: number;
  month: number;
  map: Record<number, DayStatus>;
}) {
  const days = new Date(year, month + 1, 0).getDate();
  const wd = (new Date(year, month, 1).getDay() + 6) % 7; // Пн=0
  const total = wd + days;
  const rows = Math.ceil(total / 7);

  return (
    <div className="rounded-2xl border border-line bg-white/[.03] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-200">
          {new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric" })
            .format(new Date(year, month, 1))}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/70" /> Liber
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/80" /> Parțial
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500/80" /> Rezervat
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-400">
        {["Lu","Ma","Mi","Jo","Vi","Sâ","Du"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: rows * 7 }).map((_, i) => {
          const d = i - wd + 1;
          const inMonth = d >= 1 && d <= days;
          const st: DayStatus | undefined = inMonth ? map[d] : undefined;

          const tone =
            st === "busy" ? "bg-rose-500/15 border-rose-500/30" :
            st === "partial" ? "bg-amber-500/15 border-amber-500/30" :
            st === "free" ? "bg-emerald-500/10 border-emerald-500/25" :
            "bg-transparent border-transparent";

          return (
            <div
              key={i}
              className={`min-h-[42px] grid place-items-center rounded-lg border text-[13px] text-zinc-200 ${tone}`}
              title={
                st === "busy" ? "Rezervat integral"
                  : st === "partial" ? "Rezervare parțială"
                  : st === "free" ? "Liber"
                  : ""
              }
            >
              {inMonth ? d : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
