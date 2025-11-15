// src/app/(site)/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";

export const metadata: Metadata = {
  title: "BookingArt.ai",
};

export default async function SiteLayout({ children }: { children: ReactNode }) {
  // cookies() — async в твоём билде Next
  const jar = await cookies();
  const uid = jar.get("ba_uid")?.value ?? "";
  const role =
    (jar.get("ba_role")?.value as "GUEST" | "USER" | "PROVIDER" | "ADMIN") ??
    "GUEST";
  const isAuthed = Boolean(uid);

  return (
    <div className="min-h-dvh bg-bg text-zinc-100">
      <Header isAuthed={isAuthed} role={role} />

      {/* чуть больше отступа снизу, чтобы контент не упирался в таббар */}
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6">
        {children}
      </main>

      {/* новый мобильный таббар */}
      <BottomTabBar />
    </div>
  );
}
