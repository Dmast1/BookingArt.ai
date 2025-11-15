// src/app/(site)/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BookingArt.ai — Rezervări & plăți",
};

type Category = {
  key: string;
  label: string;
  emoji: string; // можно заменить на иконки/изображения
  href: string;
};

const CATEGORIES: Category[] = [
  { key: "dj", label: "DJ", emoji: "🎧", href: "/c/dj" },
  { key: "photo", label: "Fotograf", emoji: "📷", href: "/c/fotograf" },
  { key: "video", label: "Videograf", emoji: "🎥", href: "/c/videograf" },
  { key: "live", label: "Artiști Live", emoji: "🎤", href: "/c/live" },
  { key: "mc", label: "MC/Moderator", emoji: "🎙️", href: "/c/mc" },
  { key: "decor", label: "Decor", emoji: "🎈", href: "/c/decor" },
  { key: "light", label: "Lumini/Sunet", emoji: "✨", href: "/c/light" },
  { key: "halls", label: "Săli", emoji: "🏛️", href: "/c/sali" },
  { key: "tickets", label: "Bilete", emoji: "🎟️", href: "/c/bilete" },
  { key: "catering", label: "Catering", emoji: "🍽️", href: "/c/catering" },
  { key: "hostess", label: "Hostess", emoji: "💃", href: "/c/hostess" },
  { key: "yachts", label: "Yachts", emoji: "🛥️", href: "/c/yachts" },
];

function CategoryCard({ c }: { c: Category }) {
  return (
    <a
      href={c.href}
      className="
        group relative flex flex-col items-center justify-center
        h-36 rounded-2xl
        bg-white/[.03] ring-1 ring-white/[.06] shadow-card
        hover:bg-white/[.05] hover:ring-accent/40
        transition-colors duration-200
      "
    >
      <div
        className="
          mb-2 grid place-items-center
          size-16 rounded-2xl
          bg-black/40 ring-1 ring-white/[.06]
          group-hover:ring-accent/50
        "
      >
        <span className="text-2xl leading-none select-none">{c.emoji}</span>
      </div>
      <div className="text-sm font-medium text-zinc-200">{c.label}</div>

      {/* Акцентная подсветка снизу */}
      <span
        className="
          pointer-events-none absolute inset-x-0 -bottom-[1px] h-[2px]
          scale-x-0 group-hover:scale-x-100 origin-center
          bg-gradient-to-r from-transparent via-accent to-transparent
          transition-transform duration-300
        "
      />
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      {/* Поисковая панель */}
      <div className="mx-auto mt-6 flex max-w-5xl items-center gap-2 rounded-2xl bg-white/[.04] px-3 py-2 ring-1 ring-white/[.06]">
        <div className="i">🔍</div>
        <input
          className="w-full bg-transparent px-1 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
          placeholder="Search artists, venues, tickets…"
        />
        <a
          href="/search"
          className="rounded-xl bg-white/[.06] px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/[.08] hover:bg-white/[.1]"
        >
          Caută
        </a>
      </div>

      {/* Грид категорий — крупный, плотный, без белых полос */}
      <section className="mt-10">
        <div
          className="
            grid gap-4
            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8
          "
        >
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.key} c={c} />
          ))}
        </div>
      </section>

      {/* Промо-баннер */}
      <section className="mt-10">
        <div
          className="
            relative overflow-hidden rounded-2xl bg-gradient-to-r
            from-black/40 via-black/30 to-black/10
            ring-1 ring-white/[.06] shadow-card
          "
        >
          <div className="p-6 md:p-8">
            <div className="text-lg font-semibold text-zinc-100">
              Spaceman AFTERGRAVE
            </div>
            <div className="mt-1 text-sm text-zinc-400">SOUL BEACH · 31.10.2025</div>
            <div className="mt-2 text-sm">
              <span className="rounded-md bg-white/[.06] px-2 py-1 ring-1 ring-white/[.08]">
                −10% cu codul <span className="text-accent font-semibold">BOOKINGART</span> →
              </span>
            </div>
          </div>

          {/* Тонкая золотая полоса снизу — премиальный штрих */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
      </section>

      {/* Рекомендованные события */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Evenimente recomandate</h2>
          <a href="/events" className="text-sm text-zinc-400 hover:text-zinc-200">
            Vezi toate →
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["LATE CHECKOUT", "OPULENCE", "COTTON"].map((title) => (
            <a
              key={title}
              href="#"
              className="
                group relative block overflow-hidden rounded-2xl
                bg-white/[.03] ring-1 ring-white/[.06] shadow-card
                hover:bg-white/[.05] hover:ring-accent/40 transition
              "
            >
              <div className="aspect-[16/9] w-full" />
              <div className="p-4">
                <div className="text-sm text-zinc-400">Verde · Fri</div>
                <div className="mt-1 text-base font-semibold text-zinc-100">{title}</div>
              </div>
              <span
                className="
                  pointer-events-none absolute inset-x-0 bottom-0 h-[2px]
                  bg-gradient-to-r from-transparent via-accent to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity
                "
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
