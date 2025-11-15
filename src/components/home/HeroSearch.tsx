// src/components/home/HeroSearch.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeroSearch() {
  const [q, setQ] = useState("");

  return (
    <section
      aria-label="Căutare rapidă"
      className="relative mx-auto mt-6 max-w-6xl rounded-2xl ring-1 ring-white/10 overflow-hidden"
    >
      {/* глубина */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_130%_at_0%_0%,rgba(196,144,68,.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/[.03] via-transparent to-white/[.02]" />

      <form action="/search" className="relative z-10 flex items-center gap-3 p-3 md:p-4 backdrop-blur-sm">
        <span className="select-none text-xl md:text-2xl">🔍</span>
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută artiști, săli, bilete…"
          className="w-full bg-transparent px-1 py-2 text-[15px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="rounded-xl bg-white/7 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/10"
        >
          Caută
        </button>
        <Link
          href="/providers/new"
          className="hidden md:inline-flex rounded-xl px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/10"
        >
          Sunt artist!
        </Link>
      </form>
    </section>
  );
}
