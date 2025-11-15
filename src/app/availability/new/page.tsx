import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Setează disponibilitatea — BookingArt.ai",
};

type PageProps = {
  searchParams?: { date?: string };
};

// yyyy-mm-dd
function normalizeDate(raw?: string | null) {
  if (!raw) return "";
  const d = raw.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  return d;
}

// ---------------- SERVER ACTION ----------------

async function saveAvailability(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/profile");
  if (user.role !== "PROVIDER") redirect("/profile");

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!provider) redirect("/profile");

  const rawDate = normalizeDate(String(formData.get("date") || ""));
  if (!rawDate) redirect("/profile");

  const status = (formData.get("status") || "free") as
    | "free"
    | "partial"
    | "busy";

  const fullDay = formData.get("fullDay") === "1";

  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");

  const priceGross = Number(formData.get("priceGross") || 0) || 0;
  const depositPercent = Number(formData.get("depositPercent") || 0) || 0;
  const minHours = Number(formData.get("minHours") || 0) || 0;
  const note = String(formData.get("note") || "").trim();

  const applyMode = String(formData.get("applyMode") || "single");

  const rangeStart = normalizeDate(
    String(formData.get("rangeStart") || rawDate)
  );
  const rangeEnd = normalizeDate(String(formData.get("rangeEnd") || ""));
  const weekdayStart = normalizeDate(
    String(formData.get("weekdayStart") || rawDate)
  );
  const weekdayEnd = normalizeDate(String(formData.get("weekdayEnd") || ""));
  const weekdayRaw = String(formData.get("weekday") || "same");

  function parseYMD(s: string) {
    return new Date(s + "T00:00:00.000Z");
  }

  const dates: Date[] = [];

  // режим: диапазон
  if (applyMode === "range" && rangeStart && rangeEnd) {
    const start = parseYMD(rangeStart);
    const end = parseYMD(rangeEnd);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      const cur = new Date(start);
      while (cur <= end) {
        dates.push(new Date(cur));
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }
  }
  // режим: повтор по дню недели
  else if (applyMode === "weekday" && weekdayStart && weekdayEnd) {
    const start = parseYMD(weekdayStart);
    const end = parseYMD(weekdayEnd);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      let targetDow: number;
      if (weekdayRaw === "same") {
        targetDow = parseYMD(rawDate).getUTCDay();
      } else {
        targetDow = Number(weekdayRaw) || 0;
      }

      const cur = new Date(start);
      while (cur <= end) {
        if (cur.getUTCDay() === targetDow) {
          dates.push(new Date(cur));
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }
  }

  // по умолчанию — только выбранная дата
  if (dates.length === 0) {
    dates.push(parseYMD(rawDate));
  }

  // предполагаем Prisma-схему:
  //
  // model Calendar {
  //   id             String   @id @default(cuid())
  //   provider       Provider @relation(fields: [providerId], references: [id])
  //   providerId     String
  //   date           DateTime
  //   status         String   // "free" | "partial" | "busy"
  //   fullDay        Boolean  @default(true)
  //   startTime      String?
  //   endTime        String?
  //   priceGross     Int?
  //   depositPercent Int?
  //   minHours       Int?
  //   note           String?
  //
  //   @@unique([providerId, date])
  // }
  //
  // и в Provider:
  // calendars Calendar[]

  const commonUpdate = {
    status,
    fullDay,
    startTime: fullDay ? null : startTime || null,
    endTime: fullDay ? null : endTime || null,
    priceGross: priceGross || null,
    depositPercent: depositPercent || null,
    minHours: minHours || null,
    note: note || null,
  };

  for (const d of dates) {
    await prisma.provider.update({
      where: { id: provider.id },
      data: {
        calendars: {
          upsert: {
            where: {
              providerId_date: {
                providerId: provider.id,
                date: d,
              },
            },
            update: commonUpdate,
            create: {
              date: d,
              ...commonUpdate,
            },
          },
        },
      },
    });
  }

  revalidatePath("/profile");
  redirect("/profile?calendarSaved=1");
}

// ---------------- PAGE ----------------

export default async function AvailabilityNewPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/profile");
  if (user.role !== "PROVIDER") redirect("/profile");

  const safeDate = normalizeDate(searchParams?.date);
  let prettyDate = safeDate;

  try {
    if (safeDate) {
      const d = new Date(safeDate + "T00:00:00Z");
      prettyDate = d.toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
  } catch {
    // ignore
  }

  return (
    <section className="mx-auto max-w-4xl pb-12 pt-8">
      <a href="/profile" className="text-xs text-zinc-500 hover:text-accent">
        ← Înapoi la calendar
      </a>

      <header className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            Setează disponibilitatea
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Dată selectată:{" "}
            <span className="font-medium capitalize text-zinc-100">
              {prettyDate || safeDate || "fără dată"}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface/80 px-4 py-2 text-xs text-zinc-400">
          <div className="font-semibold text-zinc-200">
            Stil Booking.com pentru artiști
          </div>
          <p className="mt-1">
            Aici definești regulile de disponibilitate: status, interval orar,
            preț, avans și aplicare pe mai multe zile.
          </p>
        </div>
      </header>

      <form
        action={saveAvailability}
        className="mt-6 space-y-6 rounded-3xl border border-line bg-surface/80 p-5 text-sm"
      >
        <input type="hidden" name="date" value={safeDate} />

        {/* 1. STATUS ZI */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Status zi
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-100">
              <input
                type="radio"
                name="status"
                value="free"
                defaultChecked
                className="h-3 w-3 accent-emerald-400"
              />
              <span>
                <div className="font-semibold">Liber</div>
                <div className="text-[11px] text-emerald-200/80">
                  Poți primi rezervări pentru această dată.
                </div>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-100">
              <input
                type="radio"
                name="status"
                value="partial"
                className="h-3 w-3 accent-amber-400"
              />
              <span>
                <div className="font-semibold">Parțial ocupat</div>
                <div className="text-[11px] text-amber-100/80">
                  Doar o parte din zi este liberă.
                </div>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-100">
              <input
                type="radio"
                name="status"
                value="busy"
                className="h-3 w-3 accent-red-400"
              />
              <span>
                <div className="font-semibold">Ocupat</div>
                <div className="text-[11px] text-red-100/80">
                  Nu ești disponibil deloc pentru rezervări.
                </div>
              </span>
            </label>
          </div>

          <label className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              name="fullDay"
              value="1"
              defaultChecked
              className="h-3 w-3 accent-accent"
            />
            <span>Valabil pentru toată ziua (fără oră exactă)</span>
          </label>
        </section>

        {/* 2. INTERVAL & PREȚ */}
        <section className="space-y-3 rounded-2xl border border-line bg-bg/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Interval orar & preț pachet
          </h2>
          <p className="text-[11px] text-zinc-500">
            Intervalul tipic de lucru și prețurile orientative pentru această
            dată / regulă.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                De la (ora)
              </label>
              <input
                type="time"
                name="startTime"
                defaultValue="18:00"
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Până la (ora)
              </label>
              <input
                type="time"
                name="endTime"
                defaultValue="23:00"
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Preț pachet (EUR)
              </label>
              <input
                type="number"
                name="priceGross"
                min={0}
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="ex: 800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Avans minim (%)
              </label>
              <input
                type="number"
                name="depositPercent"
                min={0}
                max={100}
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="ex: 30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Ore minime de rezervare
              </label>
              <input
                type="number"
                name="minHours"
                min={0}
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="ex: 3"
              />
            </div>
          </div>
        </section>

        {/* 3. UNDE SE APLICĂ REGULA */}
        <section className="space-y-3 rounded-2xl border border-line bg-bg/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Aplicare regulă
          </h2>
          <p className="text-[11px] text-zinc-500">
            Poți copia aceeași regulă pe mai multe zile (interval sau doar
            weekenduri).
          </p>

          <div className="space-y-2 text-xs text-zinc-200">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="applyMode"
                value="single"
                defaultChecked
                className="mt-[3px] h-3 w-3 accent-accent"
              />
              <span>
                <div className="font-medium">Doar această dată</div>
                <div className="text-[11px] text-zinc-500">
                  Se salvează o singură înregistrare în calendar.
                </div>
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="applyMode"
                value="range"
                className="mt-[3px] h-3 w-3 accent-accent"
              />
              <span className="w-full">
                <div className="font-medium">Interval de date</div>
                <div className="text-[11px] text-zinc-500">
                  Aceeași regulă pentru fiecare zi dintre două date.
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-zinc-500">
                      De la
                    </label>
                    <input
                      type="date"
                      name="rangeStart"
                      defaultValue={safeDate}
                      className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent/70"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500">
                      Până la
                    </label>
                    <input
                      type="date"
                      name="rangeEnd"
                      className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent/70"
                    />
                  </div>
                </div>
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="applyMode"
                value="weekday"
                className="mt-[3px] h-3 w-3 accent-accent"
              />
              <span className="w-full">
                <div className="font-medium">
                  Repetă pe un anumit tip de zi (ex: toate sâmbetele)
                </div>
                <div className="text-[11px] text-zinc-500">
                  Alege intervalul și ziua săptămânii.
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-[2fr_1fr]">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="block text-[11px] text-zinc-500">
                        De la
                      </label>
                      <input
                        type="date"
                        name="weekdayStart"
                        defaultValue={safeDate}
                        className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent/70"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-500">
                        Până la
                      </label>
                      <input
                        type="date"
                        name="weekdayEnd"
                        className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-500">
                      Ziua săptămânii
                    </label>
                    <select
                      name="weekday"
                      className="mt-1 w-full rounded-xl border border-line bg-surface px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent/70"
                      defaultValue="same"
                    >
                      <option value="same">
                        La fel ca data selectată
                      </option>
                      <option value="1">Luni</option>
                      <option value="2">Marți</option>
                      <option value="3">Miercuri</option>
                      <option value="4">Joi</option>
                      <option value="5">Vineri</option>
                      <option value="6">Sâmbătă</option>
                      <option value="0">Duminică</option>
                    </select>
                  </div>
                </div>
              </span>
            </label>
          </div>
        </section>

        {/* 4. NOTĂ INTERNĂ */}
        <section className="space-y-2 rounded-2xl border border-line bg-bg/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Notă internă (opțional)
          </h2>
          <p className="text-[11px] text-zinc-500">
            Nu este vizibilă clienților. Poți nota tipul evenimentului,
            specificul pachetului etc.
          </p>
          <textarea
            name="note"
            className="mt-1 min-h-[80px] w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            placeholder="Ex: deja confirmat eveniment privat până la ora 21:00, liber după."
          />
        </section>

        {/* SUBMIT */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
          >
            Salvează disponibilitatea
          </button>
          <span className="text-[11px] text-zinc-500">
            După salvare, calendarul din Dashboard va fi actualizat automat.
          </span>
        </div>
      </form>
    </section>
  );
}