"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-2 py-1 rounded ${active ? "text-white" : "text-neutral-300 hover:text-white"}`}
      style={active ? { backgroundColor: "rgba(233,90,12,.15)", border: "1px solid rgba(233,90,12,.35)" } : {}}
    >
      {children}
    </Link>
  );
}
