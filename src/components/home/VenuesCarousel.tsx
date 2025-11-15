"use client";

import { useRef } from "react";

type Venue = {
  id: string;
  name: string;
  city: string;
  rating?: number;
  image?: string; // placeholder, можно подставить реальную картинку
};

const demo: Venue[] = [
  { id: "v1", name: "Verde", city: "București" },
  { id: "v2", name: "Coucou", city: "București" },
  { id: "v3", name: "Disco Hotel", city: "Cluj" },
  { id: "v4", name: "Soul Beach", city: "Constanța" },
  { id: "v5", name: "Cotton", city: "București" },
  { id: "v6", name: "Opulence", city: "Iași" },
];

export default function VenuesCarousel() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => {
    scroller.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Săli de evenimente</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-480)}
            className="rounded-xl border border-line bg-white/[.04] px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/[.08]"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollBy(480)}
            className="rounded-xl border border-line bg-white/[.04] px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/[.08]"
          >
            →
          </button>
          <a href="/venues" className="ml-2 text-sm text-zinc-400 hover:text-zinc-200">
            Vezi toate →
          </a>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {demo.map((v) => (
          <a
            key={v.id}
            href={`/venues/${v.id}`}
            className="
              group relative h-44 w-[280px] snap-start shrink-0 overflow-hidden
              rounded-2xl border border-line bg-white/[.03]
              shadow-[0_16px_48px_rgba(0,0,0,.45)]
              transition hover:bg-white/[.06] hover:ring-1 hover:ring-[var(--accent)]/40
            "
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent" />
            <div className="p-3 absolute bottom-0 left-0 right-0">
              <div className="text-sm text-zinc-300">{v.city}</div>
              <div className="text-base font-semibold text-zinc-100">{v.name}</div>
            </div>
            {/* Имитация изображения */}
            <div className="h-full w-full bg-[linear-gradient(120deg,#1a1a1a,#0f0f0f)]" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </section>
  );
}
