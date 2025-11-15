// src/app/admin/users/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — Utilizatori",
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth?next=/admin/users");
  }
  return user;
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        Utilizatori (ultimii {users.length})
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Lista utilizatorilor înregistrați pe BookingArt.ai.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface/80 p-4 text-xs text-zinc-300">
        <table className="min-w-full text-left">
          <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="pb-2 pr-4">Creat la</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Nume</th>
              <th className="pb-2 pr-4">Rol</th>
              <th className="pb-2 pr-4">Oraș</th>
              <th className="pb-2 pr-4">Țară</th>
              <th className="pb-2 pr-4">ID</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="py-2 pr-4">
                  {u.createdAt.toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2 pr-4">{u.email ?? "—"}</td>
                <td className="py-2 pr-4">{u.name ?? "—"}</td>
                <td className="py-2 pr-4">{u.role}</td>
                <td className="py-2 pr-4">{u.city ?? "—"}</td>
                <td className="py-2 pr-4">{u.country ?? "—"}</td>
                <td className="py-2 pr-4 font-mono text-[11px] text-zinc-400">
                  {u.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
