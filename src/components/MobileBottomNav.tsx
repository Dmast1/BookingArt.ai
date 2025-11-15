// src/components/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Search, Sparkles, User2 } from "lucide-react";

const TABS = [
  { href: "/", icon: Sparkles, label: "Acasă" },
  { href: "/search", icon: Search, label: "Căutare" },
  { href: "/bookings", icon: CalendarCheck, label: "Bookings" },
  { href: "/profile", icon: User2, label: "Profil" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div
          className="
            flex items-center justify-between
            rounded-[26px]
            border border-[#16302B]
            bg-[radial-gradient(circle_at_top,#071711,#020705)]
            px-4 py-2.5
            shadow-[0_-18px_60px_rgba(0,0,0,0.95)]
          "
        >
          {TABS.map(({ href, icon: Icon, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 text-[11px]"
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-2xl text-[13px] transition-all duration-200",
                    active
                      ? "bg-[#A38560] text-[#020706] shadow-[0_10px_26px_rgba(0,0,0,0.9)] scale-[1.05]"
                      : "bg-transparent text-zinc-100/80",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={
                    active
                      ? "text-[#E3CFA4] font-medium"
                      : "text-zinc-300/80"
                  }
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
