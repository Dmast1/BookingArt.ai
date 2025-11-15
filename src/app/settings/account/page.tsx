// src/app/settings/account/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Setări cont — BookingArt.ai",
};

type PageProps = {
  searchParams?: {
    updated?: string;
  };
};

export default async function AccountSettingsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/settings/account");
  }

  const updated = searchParams?.updated === "1";

  const birthDateValue =
    user.birthDate instanceof Date
      ? user.birthDate.toISOString().slice(0, 10)
      : "";

  const fallbackInitial =
    (user.name || user.email || "?")[0]?.toUpperCase() ?? "?";

  return (
    <section className="mx-auto max-w-5xl pb-16 pt-4">
      {/* HERO */}
      <header className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#081612] via-[#050308] to-[#171008] px-5 py-5 shadow-[0_32px_140px_rgba(0,0,0,0.9)] md:px-7 md:py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-200">
                  {fallbackInitial}
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Setări cont
              </div>
              <h1 className="mt-2 text-[1.7rem] font-semibold leading-tight text-zinc-50">
                {user.name || "Utilizator fără nume"}
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-400 md:text-right">
            <div className="inline-flex items-center justify-between gap-2 rounded-2xl bg-black/60 px-3 py-2 ring-1 ring-white/10">
              <span className="uppercase tracking-[0.16em] text-zinc-500">
                Rol cont
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-[3px] text-[11px] font-medium text-zinc-100">
                {user.role}
              </span>
            </div>
            <p>
              Actualizează-ți datele de profil, avatarul și informațiile de
              contact. În curând: securitate, 2FA și sesiuni active.
            </p>
          </div>
        </div>
      </header>

      {updated && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Modificările au fost salvate.
        </div>
      )}

      {/* MAIN FORM CARD */}
      <form
        action="/api/settings/account"
        method="post"
        encType="multipart/form-data"
        className="mt-6 space-y-6 rounded-3xl border border-line bg-surface/80 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.85)] md:p-6"
      >
        {/* Date de profil */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-100">
            Date de profil
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Numele afișat pe paginile publice și în rezervări.
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-zinc-400">Nume complet</span>
              <input
                name="name"
                defaultValue={user.name ?? ""}
                className="h-9 rounded-xl border border-line bg-bg px-3 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="Numele tău"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-zinc-400">Telefon</span>
              <input
                name="phone"
                defaultValue={user.phone ?? ""}
                className="h-9 rounded-xl border border-line bg-bg px-3 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="+40…"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-zinc-400">Oraș</span>
              <input
                name="city"
                defaultValue={user.city ?? ""}
                className="h-9 rounded-xl border border-line bg-bg px-3 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="București"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-zinc-400">Țară</span>
              <input
                name="country"
                defaultValue={user.country ?? ""}
                className="h-9 rounded-xl border border-line bg-bg px-3 text-sm text-zinc-100 outline-none focus:border-accent/70"
                placeholder="RO"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-zinc-400">Data nașterii</span>
              <input
                type="date"
                name="birthDate"
                defaultValue={birthDateValue}
                className="h-9 rounded-xl border border-line bg-bg px-3 text-sm text-zinc-100 outline-none focus:border-accent/70"
              />
            </label>
          </div>

          <label className="mt-3 grid gap-1 text-sm">
            <span className="text-xs text-zinc-400">Bio / descriere scurtă</span>
            <textarea
              name="bio"
              defaultValue={user.bio ?? ""}
              rows={4}
              className="resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
              placeholder="Spune-ne câteva lucruri despre tine, ce tip de evenimente cauți sau organizezi…"
            />
          </label>

          <label className="mt-3 grid gap-1 text-sm max-w-xs">
            <span className="text-xs text-zinc-400">Limba preferată</span>
            <select
              name="language"
              defaultValue={user.language ?? "ro"}
              className="h-9 rounded-xl border border-line bg-bg px-3 text-sm text-zinc-100 outline-none focus:border-accent/70"
            >
              <option value="ro">Română</option>
              <option value="ru">Rusă</option>
              <option value="en">Engleză</option>
            </select>
          </label>
        </section>

        {/* Avatar */}
        <section className="border-t border-line pt-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Avatar & imagine de profil
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Încarcă o poză pătrată (minim 400x400). Pentru MVP, imaginea este
            stocată local în folderul /public/uploads.
          </p>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-line bg-bg">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-300">
                  {fallbackInitial}
                </div>
              )}
            </div>

            <label className="flex-1 text-sm">
              <span className="text-xs text-zinc-400">
                Alege fișier (JPEG/PNG)
              </span>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="mt-1 block w-full text-xs text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black hover:file:brightness-110"
              />
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="border-t border-line pt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.4)] hover:brightness-110 active:translate-y-[0.5px]"
          >
            Salvează modificările
          </button>
        </div>
      </form>
    </section>
  );
}
