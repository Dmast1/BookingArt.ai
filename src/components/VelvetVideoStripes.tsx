"use client";

import { useMemo } from "react";

/**
 * Диагональные «полосы» из видео. Ряды едут навстречу друг другу.
 * На мобилке автоматически снижаем плотность и скорость.
 */
type Stripe = { src: string; reverse?: boolean; speed?: number };

export default function VelvetVideoStripes({
  stripes,
  blur = 12,
  opacity = 0.28,
}: {
  stripes: Stripe[];
  blur?: number;
  opacity?: number;
}) {
  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

  const rows = useMemo(() => {
    const density = isMobile ? 2 : 3; // сколько видео в одной дорожке
    const repeats = isMobile ? 2 : 3;

    return stripes.map((s, i) => ({
      ...s,
      density,
      repeats,
      idx: i,
    }));
  }, [stripes, isMobile]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute -left-[20%] -right-[20%] -top-[10%] -bottom-[10%] origin-center"
        style={{ transform: "rotate(-10deg)" }}
      >
        {rows.map((row, i) => (
          <MarqueeRow
            key={i}
            src={row.src}
            reverse={row.reverse}
            blur={blur}
            opacity={opacity}
            speed={row.speed ?? (isMobile ? 36 : 52)}
            density={row.density}
            repeats={row.repeats}
            offsetPx={i * 160}
          />
        ))}
      </div>

      {/* тёплые градиентные вуали, чтобы фон не спорил с контентом */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(217,144,112,0.15),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(15,61,48,0.25),transparent_55%)]" />
      <div className="absolute inset-0" style={{ backdropFilter: `blur(${blur}px)` }} />
      <div className="absolute inset-0 bg-[var(--bg)]/60" />
    </div>
  );
}

function MarqueeRow({
  src,
  reverse,
  speed,
  density,
  repeats,
  offsetPx,
  blur,
  opacity,
}: {
  src: string;
  reverse?: boolean;
  speed: number;
  density: number;
  repeats: number;
  offsetPx: number;
  blur: number;
  opacity: number;
}) {
  const dir = reverse ? -1 : 1;
  const duration = Math.max(24, speed); // сек

  return (
    <div
      className="absolute left-[-10%] right-[-10%] h-[140px] md:h-[180px] flex gap-4"
      style={{ top: `${offsetPx}px` }}
    >
      <div
        className="flex min-w-full items-center"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          opacity,
        }}
      >
        {Array.from({ length: repeats }).map((_, r) => (
          <div key={r} className="flex shrink-0 gap-4 pr-4">
            {Array.from({ length: density }).map((__, i) => (
              <VideoTile key={i} src={src} blur={blur} />
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(${dir * 0}%);
          }
          100% {
            transform: translateX(${dir * -50}%);
          }
        }
      `}</style>
    </div>
  );
}

function VideoTile({ src, blur }: { src: string; blur: number }) {
  return (
    <div className="relative h-[140px] w-[260px] md:h-[180px] md:w-[340px] overflow-hidden rounded-xl ring-1 ring-white/10">
      <video
        src={src}
        playsInline
        muted
        autoPlay
        loop
        preload="metadata"
        className="h-full w-full object-cover"
        style={{ filter: `saturate(1.05) contrast(1.06)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 to-black/10" />
    </div>
  );
}
