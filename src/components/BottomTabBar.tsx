"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  CalendarCheck2,
  User2,
} from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/profile", label: "Profile", icon: User2 },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  // простая функция для проверки активного таба
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto max-w-xl px-4 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
        <div className="rounded-[26px] border border-[#1a2b24] bg-black/80 px-4 py-3 shadow-[0_-18px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <ul className="grid grid-cols-4 gap-2 text-[11px]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.href);

              return (
                <li key={tab.href} className="flex justify-center">
                  <Link
                    href={tab.href}
                    className={
                      active
                        ? "flex w-full max-w-[92px] flex-col items-center gap-1"
                        : "flex flex-col items-center gap-1"
                    }
                  >
                    <span
                      className={`
                        flex items-center justify-center
                        transition-all duration-200
                        ${active
                          ? "h-11 w-full rounded-[18px] bg-[#f9df6b] text-black shadow-[0_12px_28px_rgba(0,0,0,0.85)] px-3"
                          : "h-9 w-9 rounded-2xl text-zinc-100/80"
                        }
                      `}
                    >
                      <Icon
                        className={active ? "h-4 w-4" : "h-5 w-5"}
                        strokeWidth={2.1}
                      />
                    </span>
                    <span
                      className={
                        active
                          ? "text-[11px] font-medium text-[#f9df6b]"
                          : "text-[11px] text-zinc-300"
                      }
                    >
                      {tab.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
