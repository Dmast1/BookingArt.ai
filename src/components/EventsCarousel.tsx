"use client";

const cards = [
  { title: "LATE CHECKOUT", venue: "Disco Hotel", day: "Tue", img: "/img/late.jpg", href: "/tickets/late" },
  { title: "OPULENCE", venue: "Coucou", day: "Mon", img: "/img/opulence.jpg", href: "/tickets/opulence" },
  { title: "COTTON", venue: "Verde", day: "Fri", img: "/img/cotton.jpg", href: "/tickets/cotton" },
];

export default function EventsCarousel() {
  return (
    <div className="-mx-4 px-4 flex gap-3 snap-x overflow-x-auto pb-1">
      {cards.map((c) => (
        <a
          key={c.title}
          href={c.href}
          className="snap-start min-w-[70%] sm:min-w-[340px] rounded-3xl overflow-hidden border border-white/5 bg-[#111] shadow-[0_12px_40px_rgba(0,0,0,.6)]"
        >
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${c.img})` }}
          />
          <div className="p-4">
            <div className="text-lg font-semibold tracking-tight">{c.title}</div>
            <div className="text-xs text-zinc-400">{c.venue} · {c.day}</div>
          </div>
        </a>
      ))}
    </div>
  );
}
