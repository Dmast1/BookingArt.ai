"use client";

import { useState, FormEvent } from "react";

export default function SearchBar() {
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [plus5, setPlus5] = useState(true);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (city) params.set("city", city);
    if (country) params.set("country", country);
    if (plus5) params.set("flex", "5");
    // простая навигация на страницу поиска (можем заменить на router.push)
    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-center"
    >
      <input
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none ring-[accent]/30 placeholder:text-zinc-500 focus:ring-2"
        type="text"
        placeholder="Data ··.··.····"
        aria-label="Data"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none ring-[accent]/30 placeholder:text-zinc-500 focus:ring-2"
        type="text"
        placeholder="Oraș"
        aria-label="Oraș"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none ring-[accent]/30 placeholder:text-zinc-500 focus:ring-2"
        type="text"
        placeholder="Țară"
        aria-label="Țară"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-white/20 bg-black/60 text-[accent] focus:ring-[accent]"
          checked={plus5}
          onChange={(e) => setPlus5(e.target.checked)}
        />
        ±5 zile
      </label>
      <button
        className="rounded-xl bg-[accent] px-5 py-3 text-sm font-semibold text-black hover:brightness-110"
        type="submit"
      >
        Caută disponibilitate
      </button>
    </form>
  );
}
