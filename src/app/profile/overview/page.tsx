// src/app/profile/overview/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profil — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

export default async function ProfileOverviewPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/profile/overview");
  }

  const role = (user.role as AppRole) ?? "GUEST";
  const premiumActive =
    !!user.premiumUntil && user.premiumUntil > new Date();

  // dacă e provider — luăm datele publice (fără rating)
  const provider =
    role === "PROVIDER"
      ? await prisma.provider.findUnique({
          where: { userId: user.id },
          select: {
            id: true,
            displayName: true,
            city: true,
            country: true,
            categories: true,
          },
        })
      : null;

  const birthDateFormatted = user.birthDate
    ? user.birthDate.toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const joinedAt = user.createdAt.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const accountLabel =
    role === "ADMIN"
      ? "Admin"
      : role === "PROVIDER"
      ? "Provider"
      : role === "GUEST"
      ? "Guest"
      : premiumActive
      ? "Premium"
      : "Standard";

  const avatarInitial =
    (user.name || user.email || "U")[0]?.toUpperCase() ?? "U";

  return (
    <section className="mx-auto max-w-5xl pb-12 pt-4">
      {/* Шапка профиля */}
      <div className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#0e0e10] via-[#050506] to-[#18100b] px-6 py-5 md:px-8 md:py-6 shadow-[0_30px_120px_rgba(0,0,0,.85)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.name ?? user.email ?? "Avatar"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-xl font-semibold text-zinc-100">
                {avatarInitial}
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-wide text-zinc-400 ring-1 ring-white/[0.12]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {accountLabel}
                {premiumActive && (
                  <span className="rounded-full bg-amber-400/10 px-2 py-[1px] text-[10px] font-semibold text-amber-300">
                    Premium activ
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-zinc-50">
                {user.name || "Utilizator fără nume"}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {user.email && (
                  <>
                    Email:{" "}
                    <span className="text-zinc-100">{user.email}</span>
                  </>
                )}
                {user.phone && (
                  <>
                    {" · "}
                    Tel: <span className="text-zinc-100">{user.phone}</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Cont creat la {joinedAt}
              </p>
            </div>
          </div>

          <div className="grid gap-2 text-sm md:w-72">
            <a
              href="/settings/account"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-xs text-zinc-200 hover:border-accent/60 hover:text-accent"
            >
              Deschide setările contului
            </a>
            {role === "PROVIDER" && (
              <a
                href="/settings/provider"
                className="inline-flex items-center justify-center rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-xs text-zinc-200 hover:border-accent/60 hover:text-accent"
              >
                Setări profil provider
              </a>
            )}
            <a
              href="/settings/security"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-xs text-zinc-200 hover:border-accent/60 hover:text-accent"
            >
              Securitate & parolă
            </a>
          </div>
        </div>
      </div>

      {/* Основная инфа */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1.1fr]">
        {/* Левая колонка — личные данные / bio */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface/80 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Date personale
            </h2>
            <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <InfoRow label="Nume complet" value={user.name ?? "—"} />
              <InfoRow label="Adresă email" value={user.email ?? "—"} />
              <InfoRow label="Telefon" value={user.phone ?? "—"} />
              <InfoRow label="Oraș" value={user.city ?? "—"} />
              <InfoRow label="Țară" value={user.country ?? "—"} />
              <InfoRow
                label="Limba preferată"
                value={user.language ?? "—"}
              />
              <InfoRow
                label="Data nașterii"
                value={birthDateFormatted ?? "—"}
              />
            </dl>

            <div className="mt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Descriere scurtă (bio)
              </div>
              <p className="mt-1 text-sm text-zinc-300">
                {user.bio && user.bio.trim().length > 0
                  ? user.bio
                  : "Nu ai adăugat încă o descriere. Poți adăuga câteva cuvinte despre tine în setările contului."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm">
            <h2 className="text-sm font-semibold text-zinc-100">
              Tip cont & status
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li>
                <span className="font-medium text-zinc-100">
                  Tip cont:
                </span>{" "}
                {accountLabel}
              </li>
              <li>
                <span className="font-medium text-zinc-100">
                  Acces la prețuri și rezervări:
                </span>{" "}
                {role === "GUEST"
                  ? "limitat (fără prețuri, fără rezervare)."
                  : premiumActive
                  ? "complet (Premium activ)."
                  : "standard (rezervări de bază, fără beneficii Premium)."}
              </li>
              {premiumActive && user.premiumUntil && (
                <li>
                  <span className="font-medium text-zinc-100">
                    Premium valabil până la:
                  </span>{" "}
                  {user.premiumUntil.toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Правая колонка — блок для провайдера / служебная инфа */}
        <aside className="space-y-4">
          {role === "PROVIDER" && (
            <div className="rounded-2xl border border-line bg-surface/80 p-4 text-sm">
              <h2 className="text-sm font-semibold text-zinc-100">
                Profil artist / provider
              </h2>
              {provider ? (
                <div className="mt-3 space-y-2 text-xs text-zinc-300">
                  <InfoRow
                    label="Nume scenă"
                    value={provider.displayName ?? "—"}
                  />
                  <InfoRow
                    label="Oraș (profil public)"
                    value={provider.city ?? "—"}
                  />
                  <InfoRow
                    label="Țară (profil public)"
                    value={provider.country ?? "—"}
                  />
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Categorii / genuri
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {provider.categories && provider.categories.length > 0 ? (
                        provider.categories.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/[0.08]"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </div>
                  </div>

                  <a
                    href={`/providers/${provider.id}`}
                    className="mt-2 inline-flex text-[11px] text-accent hover:underline"
                  >
                    Vezi cum arată pagina ta publică →
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-400">
                  Nu am găsit încă un profil provider legat de acest cont.
                  După ce termini înregistrarea ca artist / furnizor, detaliile
                  vor apărea aici.
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface/80 p-4 text-xs text-zinc-400">
            <h2 className="text-sm font-semibold text-zinc-100">
              Informații sistem
            </h2>
            <ul className="mt-3 space-y-1.5">
              <li>
                ID intern utilizator:{" "}
                <span className="font-mono text-[11px] text-zinc-300">
                  {user.id}
                </span>
              </li>
              <li>
                Rol aplicație:{" "}
                <span className="font-medium text-zinc-200">{role}</span>
              </li>
              <li>
                Ultima actualizare profil:{" "}
                {user.updatedAt.toLocaleString("ro-RO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm text-zinc-200">{value || "—"}</dd>
    </div>
  );
}