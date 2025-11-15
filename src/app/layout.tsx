// src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import CursorDot from "@/components/CursorDot";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "BookingArt.ai — Găsește artiști, furnizori și săli",
  description:
    "Platformă modernă de rezervări și plăți pentru artiști, furnizori și săli de evenimente.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const role =
    (user?.role as "GUEST" | "USER" | "PROVIDER" | "ADMIN") ?? "GUEST";

  return (
    <html lang="ro" className="scroll-smooth">
      <body className="bg-bg text-zinc-100 antialiased">
        {/* Header */}
        <Header isAuthed={!!user} role={role} />

        {/* Кастомный курсор (отключится сам на touch) */}
        <CursorDot />

        {/* Контент, с запасом снизу под таббар */}
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6">{children}</main>

        {/* Мобильный bottom-nav */}
        <MobileBottomNav />

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
