// src/components/home/CategoryCard.tsx
type Props = { href: string; label: string; emoji: string };

export default function CategoryCard({ href, label, emoji }: Props) {
  return (
    <a
      href={href}
      className="
        group relative w-[172px] h-[172px]
        rounded-2xl bg-white/[.035]
        shadow-[0_22px_70px_rgba(0,0,0,.55)]
        outline outline-1 outline-transparent
        transition-transform duration-200
        hover:bg-white/[.06] hover:scale-[1.02]
        [box-shadow:inset_0_1px_0_rgba(255,255,255,.05),_0_22px_70px_rgba(0,0,0,.55)]
        grid place-items-center
      "
      style={{ willChange: "transform" }}
    >
      <div className="grid place-items-center gap-3">
        <span className="text-[56px] leading-none select-none drop-shadow-[0_8px_22px_rgba(0,0,0,.35)]">
          {emoji}
        </span>
        <div className="text-[15px] font-medium text-zinc-200">{label}</div>
      </div>

      {/* тонкая акцентная линия без артефактов */}
      <span
        className="
          pointer-events-none absolute inset-x-6 -bottom-[2px] h-[2px]
          scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300
          bg-gradient-to-r from-transparent via-accent to-transparent rounded-full
        "
      />
    </a>
  );
}
