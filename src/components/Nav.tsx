"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-semibold">
          <span className="text-ink">Booking</span>
          <span className="text-accent">Art</span><span className="text-ink">.ai</span>
        </Link>

        <div className="hidden gap-6 md:flex">
          <Link href="/categories">Categorii</Link>
          <Link href="/halls">Săli</Link>
          <Link href="/tickets">Bilete</Link>
          <Link href="/dashboard" className="chip">Dashboard</Link>
          <Link href="/providers/onboarding" className="btn-cta">Sunt artist!</Link>
        </div>
      </nav>
    </header>
  );
}
