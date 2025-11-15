// src/components/home/EventCard.tsx
import Link from "next/link";

type Props = { title: string; meta: string; href?: string };

export default function EventCard({ title, meta, href = "#" }: Props) {
  return (
    <Link
      href={href}
      className={[
        "group relative block overflow-hidden rounded-2xl",
        "bg-white/[.035] ring-1 ring-white/[.07] shadow-[0_18px_56px_rgba(0,0,0,.5)]",
        "transition-colors hover:bg-white/[.06] hover:ring-[var(--accent)]/35",
      ].join(" ")}
    >
      {/* постер-заглушка (в реале подменим картинкой) */}
      <div className="aspect-[16/9] w-full bg-[linear-gradient(135deg,rgba(255,255,255,.04),transparent)]" />
      <div className="p-4">
        <div className="text-sm text-zinc-400">{meta}</div>
        <div className="mt-1 text-base font-semibold text-zinc-100">{title}</div>
      </div>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}
