// src/components/layout/Footer.tsx (или где он у тебя лежит)

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs md:text-sm text-zinc-400">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Лого / описание */}
          <div>
            <div className="text-sm font-semibold text-zinc-100">
              BookingArt.ai
            </div>
            <p className="mt-1 max-w-sm text-[11px] md:text-xs text-zinc-500">
              Marketplace pentru evenimente: DJ, fotografi, săli, bilete și
              tot ce ai nevoie pentru un eveniment reușit.
            </p>
          </div>

          {/* Линки */}
          <div className="flex flex-wrap gap-6 text-[11px] md:text-xs">
            <div className="space-y-1.5">
              <div className="font-medium text-zinc-300">Platformă</div>
              <a href="/search" className="block hover:text-accent">
                Caută furnizori
              </a>
              <a href="/categories" className="block hover:text-accent">
                Categorii
              </a>
              <a href="/tickets" className="block hover:text-accent">
                Evenimente cu bilete
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="font-medium text-zinc-300">Pentru provideri</div>
              <a href="/provider" className="block hover:text-accent">
                Înscrie-te ca provider
              </a>
              <a href="/auth?mode=login" className="block hover:text-accent">
                Intră în cont
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="font-medium text-zinc-300">Legal</div>
              <a href="/terms" className="block hover:text-accent">
                Termeni & Condiții
              </a>
              <a href="/privacy" className="block hover:text-accent">
                Politica GDPR
              </a>
              <a href="mailto:support@bookingart.ai" className="block hover:text-accent">
                Support
              </a>
            </div>
          </div>
        </div>

        {/* нижняя полоска */}
        <div className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-3 text-[11px] text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>© {year} BookingArt.ai. Toate drepturile rezervate.</p>
          <p className="text-[10px] md:text-[11px]">
            Build in early-access • Feedback:{" "}
            <a
              href="mailto:founders@bookingart.ai"
              className="hover:text-accent"
            >
              founders@bookingart.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}