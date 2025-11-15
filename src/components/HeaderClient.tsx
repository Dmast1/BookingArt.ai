// src/components/HeaderClient.tsx
"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Search,
  MessageCircle,
  User2,
  ChevronDown,
  LogOut,
} from "lucide-react";

const LINKS = [
  { href: "/categories", label: "Categorii" },
  { href: "/venues", label: "Săli" },
  { href: "/events", label: "Evenimente" },
  { href: "/tickets", label: "Bilete" },
  { href: "/dashboard", label: "Dashboard" },
];

export type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

type HeaderProps = {
  isAuthed?: boolean;
  role?: AppRole;
};

export default function HeaderClient({
  isAuthed = false,
  role = "GUEST",
}: HeaderProps) {
  const [open, setOpen] = useState(false);

  const chatHref = isAuthed ? "/chat" : "/auth?next=/chat";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1240px] px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <a
          href="/"
          className="shrink-0 text-[18px] font-extrabold tracking-tight"
          aria-label="BookingArt.ai — platformă de rezervări"
        >
          Booking<span className="text-accent">Art</span>.ai
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-300 hover:text-zinc-100 transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/search"
            className="rounded-xl bg-surface border border-line p-2 hover:border-accent/50 active:scale-95 transition"
            aria-label="Căutare"
          >
            <Search className="h-5 w-5 text-zinc-300" />
          </a>

          <a
            href={chatHref}
            className="rounded-xl bg-surface border border-line p-2 hover:border-accent/50 active:scale-95 transition"
            aria-label="Mesagerie"
          >
            <MessageCircle className="h-5 w-5 text-zinc-300" />
          </a>

          {!isAuthed ? (
            <>
              <a
                href="/auth"
                className="rounded-xl bg-surface border border-line px-3 h-9 inline-flex items-center gap-1.5 text-sm text-zinc-200 hover:border-accent/50"
              >
                <User2 className="h-4 w-4" />
                Autentificare
                <ChevronDown className="h-4 w-4 opacity-60" />
              </a>
              <a
                href="/providers/new"
                className="ml-1 rounded-xl bg-accent px-4 h-9 inline-flex items-center text-sm font-semibold text-black hover:brightness-110 active:translate-y-[0.5px] transition"
              >
                Sunt artist!
              </a>
            </>
          ) : (
            <>
              <a
                href="/profile"
                className="rounded-xl bg-surface border border-line px-3 h-9 inline-flex items-center gap-1.5 text-sm text-zinc-200 hover:border-accent/50"
              >
                <User2 className="h-4 w-4" />
                {role === "PROVIDER" ? "Cont provider" : "Cont"}
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-surface border border-line px-3 h-9 inline-flex items-center gap-1.5 text-sm text-zinc-200 hover:border-accent/50"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="ml-auto md:hidden flex items-center gap-2">
          <a
            href="/search"
            className="rounded-xl bg-surface border border-line p-2 active:scale-95"
            aria-label="Căutare"
          >
            <Search className="h-5 w-5 text-zinc-300" />
          </a>
          <button
            className="rounded-xl bg-surface border border-line p-2 active:scale-95"
            aria-label="Meniu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Închide meniul"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-[360px] bg-bg border-l border-line shadow-[0_30px_120px_rgba(0,0,0,.6)] flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-line">
              <span className="text-[16px] font-semibold">Meniu</span>
              <button
                className="rounded-xl bg-surface border border-line p-2"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5 text-zinc-300" />
              </button>
            </div>

            <form action="/search" className="p-4">
              <div className="flex items-center gap-2 rounded-xl bg-surface border border-line pl-3 pr-3 py-2 w-full focus-within:border-accent/50">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  name="q"
                  placeholder="Caută artiști, săli, bilete…"
                  className="bg-transparent outline-none text-sm w-full placeholder:text-zinc-500"
                />
              </div>
            </form>

            <nav className="px-2 py-1 flex flex-col">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-3 text-[15px] text-zinc-200 hover:bg-white/[.05]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto p-4 border-t border-line space-y-2">
              {!isAuthed ? (
                <>
                  <a
                    href="/auth"
                    className="block rounded-xl bg-surface border border-line px-3 py-2 text-sm text-zinc-200 hover:border-accent/50"
                    onClick={() => setOpen(false)}
                  >
                    Autentificare / Cont
                  </a>
                  <a
                    href="/providers/new"
                    className="block rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-black text-center hover:brightness-110"
                    onClick={() => setOpen(false)}
                  >
                    Sunt artist!
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/profile"
                    className="block rounded-xl bg-surface border border-line px-3 py-2 text-sm text-zinc-200 hover:border-accent/50"
                    onClick={() => setOpen(false)}
                  >
                    Profilul meu
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      await handleLogout();
                    }}
                    className="block w-full rounded-xl bg-surface border border-line px-3 py-2 text-sm text-zinc-200 hover:border-accent/50 text-left"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
