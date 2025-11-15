// src/app/onboarding/role/RoleClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CARDS = [
  {
    key: "client" as const,
    title: "Client",
    subtitle: "Caut artiști și servicii pentru eveniment.",
    icon: "🎤", // TODO: сюда потом поставишь свою 3D-иконку
  },
  {
    key: "provider" as const,
    title: "Artist / Provider",
    subtitle: "Ofer servicii și colaborez la evenimente.",
    icon: "🎭",
  },
  {
    key: "venue" as const,
    title: "Locație / Corporate",
    subtitle: "Listare hoteluri, săli și evenimente corporate.",
    icon: "🏨",
  },
];

type RoleKey = (typeof CARDS)[number]["key"];

export default function RoleClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<RoleKey>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Eroare la salvarea rolului.");
        return;
      }

      if (selected === "client") router.push("/onboarding/client");
      else if (selected === "provider") router.push("/onboarding/provider");
      else router.push("/onboarding/venue");
    } catch (e) {
      console.error(e);
      setError("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  const client = CARDS[0];
  const provider = CARDS[1];
  const venue = CARDS[2];

  return (
    <>
      {/* верхний ряд: client + provider */}
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <RoleCard
            card={client}
            selected={selected}
            onSelect={setSelected}
            emphasis
          />
          <RoleCard
            card={provider}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* нижняя широкая карточка */}
        <RoleCard
          card={venue}
          selected={selected}
          onSelect={setSelected}
          wide
        />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/35 bg-red-500/8 px-3 py-2 text-[11px] text-red-100">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="
          mt-6 flex w-full items-center justify-center
          rounded-full px-6 py-3 text-sm font-semibold
          bg-[var(--accent)] text-black
          ring-1 ring-amber-200/50
          shadow-[0_18px_60px_rgba(0,0,0,0.9)]
          hover:brightness-110
          disabled:cursor-wait disabled:opacity-60
        "
      >
        Continuă
      </button>
    </>
  );
}

function RoleCard({
  card,
  selected,
  onSelect,
  wide,
  emphasis,
}: {
  card: (typeof CARDS)[number];
  selected: RoleKey;
  onSelect: (key: RoleKey) => void;
  wide?: boolean;
  emphasis?: boolean; // для client, чуть сильнее акцент
}) {
  const active = selected === card.key;

  const base =
    "relative overflow-hidden flex items-center gap-4 rounded-3xl px-4 py-4 sm:px-5 sm:py-5 transition-all duration-200";

  const inactive =
    "border border-white/10 bg-zinc-950/60 hover:border-white/25 hover:bg-zinc-900/80 shadow-[0_14px_40px_rgba(0,0,0,0.75)]";

  const activeStyle = emphasis
    ? "border border-amber-300/70 bg-zinc-950 shadow-[0_20px_70px_rgba(0,0,0,0.9)]"
    : "border border-white/40 bg-zinc-950 shadow-[0_20px_70px_rgba(0,0,0,0.9)]";

  return (
    <button
      type="button"
      onClick={() => onSelect(card.key)}
      className={wide ? `w-full ${base} ${active ? activeStyle : inactive}` : `${base} ${active ? activeStyle : inactive}`}
    >
      {/* тонкая глянцевая полоска сверху карточки */}
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-60" />

      {/* иконка — сюда потом можно поставить <img /> */}
      <div
        className="
          relative flex h-14 w-14 flex-shrink-0 items-center justify-center
          rounded-2xl
          bg-zinc-950
          ring-1 ring-white/10
          shadow-[0_16px_45px_rgba(0,0,0,0.9)]
        "
      >
        <span className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-white/70" />
        <span className="text-3xl leading-none">{card.icon}</span>
      </div>

      <div className="flex-1">
        <div
          className={`
            text-[19px] sm:text-[20px] font-semibold
            ${active ? "text-zinc-50" : "text-zinc-100"}
          `}
        >
          {card.title}
        </div>
        <p
          className={`
            mt-1 text-[13px] leading-snug
            ${active ? "text-zinc-300" : "text-zinc-500"}
          `}
        >
          {card.subtitle}
        </p>
      </div>
    </button>
  );
}
