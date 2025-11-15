// src/components/home/CategoryGrid.tsx
"use client";

import React from "react";

const CATS = [
  { key: "dj",        label: "DJ",       emoji: "🎧", hint: "Nunți, party" },
  { key: "fotograf", label: "Foto",     emoji: "📷", hint: "Evenimente" },
  { key: "videograf",label: "Video",    emoji: "🎥", hint: "Aftermovie" },
  { key: "live",     label: "Live",     emoji: "🎤", hint: "Trupe" },
  { key: "mc",       label: "MC",       emoji: "🎙️", hint: "Moderare" },
  { key: "decor",    label: "Decor",    emoji: "🎈", hint: "Setup" },
  { key: "light",    label: "Lumini",   emoji: "✨", hint: "Stage" },
  { key: "halls",    label: "Săli",     emoji: "🏛️", hint: "Venue" },
  { key: "tickets",  label: "Bilete",   emoji: "🎟️", hint: "Evenimente" },
  { key: "catering", label: "Catering", emoji: "🍽️", hint: "Food" },
  { key: "hostess",  label: "Hostess",  emoji: "💃", hint: "Promo" },
  { key: "yachts",   label: "Yacht",    emoji: "🛥️", hint: "Boat party" },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
      {CATS.map((c, idx) => (
        <a
          key={c.key}
          href={`/c/${c.key}`}
          style={{ animationDelay: `${idx * 70}ms` }}
          className="
            cat-pop
            group relative flex flex-col items-center justify-between
            rounded-3xl
            border border-zinc-800/80
            bg-[radial-gradient(circle_at_top,#18181b,transparent_55%),radial-gradient(circle_at_bottom,#020617,transparent_55%)]
            px-3 py-3 sm:px-4 sm:py-4
            shadow-[0_18px_60px_rgba(0,0,0,0.75)]
            transition-transform duration-200
            hover:-translate-y-1 active:scale-95
            hover:border-[var(--accent)]/90
          "
        >
          {/* мягкий внутренний тёплый glow */}
          <div className="pointer-events-none absolute inset-px rounded-[22px] opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_0%_0%,rgba(196,144,68,0.35),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(244,244,245,0.06),transparent_55%)]" />
          </div>

          {/* иконка */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-black/80 text-[1.8rem] shadow-[0_14px_40px_rgba(0,0,0,0.9)] sm:h-14 sm:w-14 sm:text-[2rem] transition-transform duration-200 group-hover:scale-105">
            {c.emoji}
          </div>

          {/* подписи – минимум текста, быстро считываются */}
          <div className="relative mt-2 flex flex-col items-center">
            <span className="text-[13px] font-semibold text-zinc-50 sm:text-sm">
              {c.label}
            </span>
            <span className="mt-0.5 text-[10px] text-zinc-500 sm:text-[11px]">
              {c.hint}
            </span>
          </div>

          {/* маленький намёк «нажми меня» */}
          <div className="relative mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100">
            →
          </div>
        </a>
      ))}
    </div>
  );
}
