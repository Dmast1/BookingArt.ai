"use client";
type Props = { title: string; subtitle?: string; cta?: string; href: string };

export default function PromoBanner({ title, subtitle, cta, href }: Props) {
  return (
    <a href={href} className="block overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#151515] to-[#0d0d0d] shadow-card">
      <div className="relative p-5">
        <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
        {cta && <span className="mt-3 ba-cta">{cta} →</span>}
      </div>
      <div className="h-[2px] w-full bg-gradient-to-r from-accent to-transparent opacity-60" />
    </a>
  );
}
