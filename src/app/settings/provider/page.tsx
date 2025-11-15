// src/app/settings/provider/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProviderSettingsForm, {
  type ProviderFormInitial,
} from "./ProviderSettingsForm";
import ProviderPackagesForm, {
  type ProviderPackageDTO,
} from "./ProviderPackagesForm";

export const metadata: Metadata = {
  title: "Setări provider — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

export default async function ProviderSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/settings/provider");
  }

  const role = (user.role as AppRole) ?? "GUEST";
  if (role !== "PROVIDER") {
    redirect("/profile");
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    include: {
      packages: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!provider) {
    redirect("/provider");
  }

  const initial: ProviderFormInitial = {
    displayName: provider.displayName || user.name || "",
    city: provider.city || "",
    country: provider.country || "",
    categories: provider.categories || [],
    bio: provider.bio || "",
    youtubeUrl: provider.youtubeUrl || "",
    instagramUrl: provider.instagramUrl || "",
    facebookUrl: provider.facebookUrl || "",
    websiteUrl: provider.websiteUrl || "",
    avatarUrl: provider.avatarUrl || null,
  };

  const pkgInitial: ProviderPackageDTO[] = provider.packages.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    currency: p.currency,
    isPublic: p.isPublic,
    sortOrder: p.sortOrder,
  }));

  const primaryCategory =
    (provider.categories && provider.categories[0]) || null;

  return (
    <section className="mx-auto max-w-5xl pb-14 pt-4">
      {/* HERO */}
      <header className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#15101a] via-[#050308] to-[#18110a] px-5 py-5 shadow-[0_32px_140px_rgba(0,0,0,0.9)] md:px-7 md:py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Profil provider public
            </div>
            <h1 className="mt-2 text-[1.8rem] font-semibold leading-tight text-zinc-50">
              {provider.displayName || user.name || "Artist / furnizor"}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {[provider.city, provider.country || "RO"]
                .filter(Boolean)
                .join(", ")}
              {primaryCategory ? ` · ${primaryCategory}` : ""}
            </p>
          </div>

          <div className="grid gap-2 text-xs text-zinc-400 md:w-72">
            <div className="flex items-center justify-between rounded-2xl bg-black/60 px-3 py-2 ring-1 ring-white/12">
              <span className="uppercase tracking-[0.16em] text-zinc-500">
                Pagina publică
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-[3px] text-[11px] font-medium text-zinc-100">
                bookingart.ai/p/{provider.slug ?? "artist"}
              </span>
            </div>
            <p>
              Tot ce modifici mai jos se vede pe pagina ta publică și în
              rezultatele de căutare. Gândește-te la asta ca la landing-ul
              tău oficial în BookingArt.
            </p>
          </div>
        </div>
      </header>

      {/* FORMS */}
      <div className="mt-6 space-y-6">
        <div className="rounded-3xl border border-line bg-surface/80 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.85)] md:p-6">
          <h2 className="text-sm font-semibold text-zinc-100">
            Date de profil & branding
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Nume afișat, oraș, categorii, bio și linkuri către rețelele tale.
          </p>
          <div className="mt-4">
            <ProviderSettingsForm initial={initial} />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface/80 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.85)] md:p-6">
          <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Pachete & prețuri (MVP)
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Structură simplă de pachete pe care o vom folosi ulterior în
                ofertare și în evenimente cu bilete.
              </p>
            </div>
            <span className="mt-1 inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10 md:mt-0">
              În curând: pachete dinamice & upsell
            </span>
          </div>

          <div className="mt-4">
            <ProviderPackagesForm initial={pkgInitial} />
          </div>
        </div>
      </div>
    </section>
  );
}
