// src/app/admin/providers/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — Provideri",
};

type SearchDict = Record<string, string | string[] | undefined>;
const pick = (v: string | string[] | undefined) =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth?next=/admin/providers");
  }
  return user;
}

export default async function AdminProvidersPage({
  searchParams,
}: { searchParams?: SearchDict }) {
  await requireAdmin();

  const q = pick(searchParams?.q).trim();
  const city = pick(searchParams?.city).trim();
  const take = 100;

  const where: any = {};
  if (q) {
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { city: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
      { categories: { has: q } },
    ];
  }
  if (city) where.city = city;

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { email: true, id: true } } },
    }),
    prisma.provider.count({ where }),
  ]);

  const distinctCities = await prisma.provider.findMany({
    where: { city: { not: null } },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Provideri</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Artiști și furnizori înrolați. Filtrează după nume, email, oraș sau categorie.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 md:w-[420px]">
          <StatCard label="Total" value={total} />
          <StatCard
            label="Cu oraș"
            value={await prisma.provider.count({ where: { city: { not: null } } })}
          />
          <StatCard
            label="Cu categorii"
            value={await prisma.provider.count({ where: { categories: { isEmpty: false } } })}
          />
        </div>
      </header>

      {/* Filters */}
      <form
        action="/admin/providers"
        className="mt-4 grid gap-2 md:grid-cols-[1fr_220px_auto]"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Caută: nume, email, oraș, categorie…"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
        />
        <select
          name="city"
          defaultValue={city || ""}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-zinc-200 outline-none"
        >
          <option value="">Oraș (toate)</option>
          {distinctCities
            .filter((c) => c.city)
            .map((c) => (
              <option key={c.city!} value={c.city!}>
                {c.city}
              </option>
            ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          Filtrează
        </button>
      </form>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface/80 p-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <div className="text-zinc-400">
            Afișate: <span className="text-zinc-100">{providers.length}</span> /{" "}
            <span className="text-zinc-100">{total}</span>
          </div>
          <div className="text-xs text-zinc-500">
            Ordonare: <span className="text-zinc-300">creat desc</span>
          </div>
        </div>

        <table className="min-w-full text-left text-[13px]">
          <thead className="border-b border-line text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="pb-2 pr-4">Creat</th>
              <th className="pb-2 pr-4">Provider</th>
              <th className="pb-2 pr-4">Email user</th>
              <th className="pb-2 pr-4">Oraș / Țară</th>
              <th className="pb-2 pr-4">Categorii</th>
              <th className="pb-2 pr-2">ID</th>
              <th className="pb-2 pl-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="align-top text-zinc-300">
            {providers.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-4 text-zinc-400">
                  {p.createdAt.toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Provider + avatar */}
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/[.06] ring-1 ring-white/10 text-[12px] font-semibold text-zinc-100">
                      {initials(p.displayName)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-zinc-100">
                        {p.displayName || "—"}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {p.user?.id?.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="py-2 pr-4">
                  <a
                    href={`mailto:${p.user?.email ?? ""}`}
                    className="rounded-full border border-line bg-white/[.04] px-2.5 py-0.5 text-[12px] text-zinc-200 hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                  >
                    {p.user?.email ?? "—"}
                  </a>
                </td>

                {/* City/Country */}
                <td className="py-2 pr-4 text-zinc-300">
                  {[p.city ?? "—", p.country ?? "—"].join(" · ")}
                </td>

                {/* Categories as chips */}
                <td className="py-2 pr-4">
                  {p.categories && p.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {p.categories.slice(0, 4).map((c) => (
                        <span
                          key={p.id + c}
                          className="rounded-full border border-line bg-white/[.04] px-2 py-0.5 text-[11px] text-zinc-200"
                        >
                          {c}
                        </span>
                      ))}
                      {p.categories.length > 4 && (
                        <span className="rounded-full border border-line bg-white/[.03] px-2 py-0.5 text-[11px] text-zinc-400">
                          +{p.categories.length - 4}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>

                {/* ID */}
                <td className="py-2 pr-2 font-mono text-[11px] text-zinc-500">
                  {p.id}
                </td>

                {/* Actions */}
                <td className="py-2 pl-2">
                  <div className="flex flex-wrap gap-1.5">
                    <a
                      href={`/p/${p.id}`}
                      className="rounded-full border border-line bg-white/[.05] px-2.5 py-0.5 text-[11px] text-zinc-200 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                    >
                      Vezi profil
                    </a>
                    <a
                      href={`/admin/providers/${p.id}`}
                      className="rounded-full border border-line bg-white/[.05] px-2.5 py-0.5 text-[11px] text-zinc-200 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                    >
                      Admin
                    </a>
                  </div>
                </td>
              </tr>
            ))}

            {providers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-sm text-zinc-400">
                  Nimic găsit după filtrele curente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ───────────────── helpers ───────────────── */

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "PR";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/80 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="text-lg font-semibold text-zinc-50">{value}</div>
    </div>
  );
}
