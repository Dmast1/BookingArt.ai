"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, Ticket, Users } from "lucide-react";

/* ---------- types ---------- */
type Phase = "phone" | "code";
type SmsMode = "existing" | "new" | null;

const COUNTRIES = [
  { code: "RO", name: "România", dial: "+40", flag: "🇷🇴" },
  { code: "FR", name: "Franța", dial: "+33", flag: "🇫🇷" },
  { code: "MD", name: "Moldova", dial: "+373", flag: "🇲🇩" },
  { code: "BG", name: "Bulgaria", dial: "+359", flag: "🇧🇬" },
  { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪" },
];

/* ---------- Backdrop: ленивые видео-ленты без hydration-конфликтов ---------- */

function VideoClip({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const saveData = (navigator as any)?.connection?.saveData;
    if (saveData) return; // экономия трафика — не грузим видео

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // подменяем data-src на реальный src при входе
            if (el.dataset.src && !el.src) el.src = el.dataset.src;
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { rootMargin: "200px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      data-src={src}
      src="" // будет подставлен лениво
      poster={poster}
      muted
      playsInline
      loop
      preload="none"
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.1)" }}
    />
  );
}

function BackdropReels() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tracks = Array.from(root.querySelectorAll<HTMLElement>(".diag-track"));
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 3;
      tracks.forEach((t, i) => {
        t.style.transform = `translate3d(${i % 2 ? x : -x}px, ${i % 2 ? -y : y}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const Row = ({
    dir,
    items,
  }: {
    dir: "a" | "b";
    items: { src: string; poster?: string }[];
  }) => (
    <div className="diag-row">
      <div className={`diag-track ${dir}`}>
        {items.map((it, i) => (
          <div className="diag-clip" key={`${dir}-1-${i}`}>
            <VideoClip src={`/media/auth/${it.src}`} poster={it.poster ? `/media/auth/${it.poster}` : undefined} />
          </div>
        ))}
      </div>
      <div className={`diag-track ${dir}`} aria-hidden>
        {items.map((it, i) => (
          <div className="diag-clip" key={`${dir}-2-${i}`}>
            <VideoClip src={`/media/auth/${it.src}`} poster={it.poster ? `/media/auth/${it.poster}` : undefined} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div ref={rootRef} className="auth-backdrop">
        <Row
          dir="a"
          items={[
            { src: "row1-a.mov", poster: "row1-a.jpg" },
            { src: "row1-b.mp4", poster: "row1-b.jpg" },
            { src: "row1-a.mov", poster: "row1-a.jpg" },
            { src: "row1-b.mp4", poster: "row1-b.jpg" },
          ]}
        />
        <Row
          dir="b"
          items={[
            { src: "row2-a.mov", poster: "row2-a.jpg" },
            { src: "row2-b.mp4", poster: "row2-b.jpg" },
            { src: "row2-a.mov", poster: "row2-a.jpg" },
            { src: "row2-b.mp4", poster: "row2-b.jpg" },
          ]}
        />
        <Row
          dir="a"
          items={[
            { src: "row3-a.mov", poster: "row3-a.jpg" },
            { src: "row3-b.mov", poster: "row3-b.jpg" },
            { src: "row3-a.mov", poster: "row3-a.jpg" },
            { src: "row3-b.mov", poster: "row3-b.jpg" },
          ]}
        />
      </div>
      <div className="auth-vignette" />
      <div className="auth-grain" />
    </>
  );
}

/* ---------- page ---------- */
export default function AuthPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("next") ?? "/";

  const [phase, setPhase] = useState<Phase>("phone");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const [localPhone, setLocalPhone] = useState("");
  const [code, setCode] = useState("");
  const [smsMode, setSmsMode] = useState<SmsMode>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const phoneFull = `${country.dial}${localPhone.replace(/\D/g, "").replace(/^0+/, "")}`;

  async function onPhone(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/sms/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneFull }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Send failed");
      setSmsMode(data.mode === "new" ? "new" : "existing");
      setPhase("code");
    } catch (e: any) {
      setErr(e?.message || "Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  async function onCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneFull, code }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Invalid code");
      router.push(smsMode === "new" ? "/onboarding/role" : callbackUrl);
    } catch (e: any) {
      setErr(e?.message || "Cod invalid.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100svh] px-3 py-6 md:px-6 md:py-12 text-[var(--text-main)]">
      {/* ↓ ленивые фоновые ленты */}
      <BackdropReels />

      {/* Мобилка: INFO → FORM. Десктоп: две колонки. Снизу — меньше паддинга. */}
      <div className="relative z-[2] mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[1.25fr_1fr] md:gap-10 pb-10">
        {/* INFO */}
        <section className="order-1 md:order-1 flex flex-col justify-center wow wow-1">
          <span className="chip-glass mb-2 w-fit text-[10px] leading-none">Platformă pentru evenimente</span>

          <h1 className="text-[1.9rem] font-semibold leading-[1.15] sm:text-[2.2rem] md:text-[2.6rem]">
            <span className="gold-underline">Descoperi și rezervi tot ce ai nevoie pentru evenimentul tău.</span>
          </h1>

          <p className="mt-2 max-w-xl text-[13px] text-[var(--text-muted)]">
            Un singur cont pentru clienți, artiști și săli. Cote rapide, disponibilitate, contracte, bilete — totul în aceeași interfață.
          </p>

          {/* Компактная сетка фич — 2 колонки и меньше воздуха */}
          <ul className="feature-grid mt-4">
            <li className="feature-card wow wow-2">
              <span className="feature-ic"><ShieldCheck className="h-4 w-4" /></span>
              <div>
                <div className="feature-ttl">Verificare & KYC</div>
                <div className="feature-sub">profiluri de încredere</div>
              </div>
            </li>
            <li className="feature-card wow wow-2">
              <span className="feature-ic"><Users className="h-4 w-4" /></span>
              <div>
                <div className="feature-ttl">Matching inteligent</div>
                <div className="feature-sub">cerere → ofertă</div>
              </div>
            </li>
            <li className="feature-card wow wow-3">
              <span className="feature-ic"><Ticket className="h-4 w-4" /></span>
              <div>
                <div className="feature-ttl">Bilete & plăți</div>
                <div className="feature-sub">cashless & raportare</div>
              </div>
            </li>
            <li className="feature-card wow wow-3">
              <span className="feature-ic"><Sparkles className="h-4 w-4" /></span>
              <div>
                <div className="feature-ttl">Calendar & pachete</div>
                <div className="feature-sub">management simplu</div>
              </div>
            </li>
          </ul>

          {/* Статистика тоже компактнее */}
          <div className="stats-grid mt-4 wow wow-4">
            <div className="stat-card">
              <div className="text-base md:text-lg font-semibold">2.4k+</div>
              <div className="text-[11px] text-[var(--text-muted)]">artiști & provideri</div>
            </div>
            <div className="stat-card">
              <div className="text-base md:text-lg font-semibold">650+</div>
              <div className="text-[11px] text-[var(--text-muted)]">săli & locații</div>
            </div>
            <div className="stat-card">
              <div className="text-base md:text-lg font-semibold">12k+</div>
              <div className="text-[11px] text-[var(--text-muted)]">rezervări procesate</div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="order-2 md:order-2 rounded-[16px] border border-[var(--border-subtle)] p-3 md:rounded-[22px] md:p-6 bg-transparent wow wow-2">
          <h2 className="text-[13px] font-semibold">Intrare rapidă</h2>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">Primești un cod SMS. Fără parole.</p>

          {phase === "phone" ? (
            <form onSubmit={onPhone} className="mt-3 space-y-3">
              <CountryPhoneInput
                country={country}
                setCountry={setCountry}
                open={open}
                setOpen={setOpen}
                value={localPhone}
                onChange={setLocalPhone}
              />
              {error && <ErrorBox msg={error} />}
              <button type="submit" className="btn-velvet btn-velvet--shine w-full" disabled={loading}>
                {loading ? "Se procesează…" : "Continuă"} {!loading && <ArrowRight className="ml-1 inline h-4 w-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={onCode} className="mt-3 space-y-3">
              <div className="input-glass">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="w-full bg-transparent text-center text-lg tracking-[0.6em] outline-none"
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit" className="btn-velvet btn-velvet--shine w-full" disabled={loading}>
                {loading ? "Se procesează…" : "Confirmă și intră"} {!loading && <ArrowRight className="ml-1 inline h-4 w-4" />}
              </button>
            </form>
          )}

          <div className="mt-4 space-y-2.5 text-[11px] text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/12" />
              <span>Sau</span>
              <div className="h-px flex-1 bg-white/12" />
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.href = `/api/auth/google/start?next=${encodeURIComponent(callbackUrl)}`;
              }}
              className="input-glass flex w-full items-center justify-center gap-2"
            >
              <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-white text-[10px] font-bold text-[#4285F4]">G</span>
              Continuă cu Google
            </button>
          </div>

          <p className="mt-3 text-[10px] text-[var(--text-muted)]">
            Prin autentificare, ești de acord cu{" "}
            <a className="underline hover:text-[var(--accent-gold)]" href="/legal/terms">Termenii</a> și{" "}
            <a className="underline hover:text-[var(--accent-gold)]" href="/legal/privacy">Politica de confidențialitate</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

/* ---------- subcomponents ---------- */

function CountryPhoneInput({
  country, setCountry, open, setOpen, value, onChange,
}: any) {
  return (
    <div className="input-glass flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-[11px]"
        >
          <span className="mr-1">{country.flag}</span>
          <span className="font-medium">{country.dial}</span>
          <span className="ml-1 text-[9px] opacity-60">▼</span>
        </button>
        {open && (
          <div className="absolute left-0 top-9 z-20 w-44 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.92)] text-[11px]">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCountry(c); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-white/5 ${c.code === country.code ? "text-[var(--accent-gold)]" : ""}`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">{c.dial}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
        placeholder="7xx xxx xxx"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ErrorBox({ msg }: { msg:string }) {
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
      {msg}
    </div>
  );
}
