// src/app/events/[slug]/edit/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Editează eveniment — BookingArt.ai",
};

type PageProps = {
  params: { slug: string };
};

export default async function EditEventPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=/events/${params.slug}/edit`);

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      provider: { select: { userId: true } },
    },
  });

  if (!event) return notFound();

  const isOwner = event.provider?.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect(`/events/${params.slug}`);
  }

  const isoDateTime = event.date.toISOString().slice(0, 16); // для input type="datetime-local"

  return (
    <section className="mx-auto max-w-3xl pb-12 pt-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        Editează evenimentul
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Modifică titlul, orașul, data și link-urile publice. Biletele și
        comenzile existente rămân neschimbate.
      </p>

      <form
        action={`/api/events/${event.id}`}
        method="POST"
        className="mt-6 space-y-4 rounded-2xl border border-line bg-surface/80 p-4"
      >
        <input type="hidden" name="_method" value="PATCH" />

        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Titlu eveniment
          </label>
          <input
            name="title"
            defaultValue={event.title}
            required
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Oraș
            </label>
            <input
              name="city"
              defaultValue={event.city}
              required
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Data & ora
            </label>
            <input
              type="datetime-local"
              name="date"
              defaultValue={isoDateTime}
              required
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400">
            URL imagine afiș (opțional)
          </label>
          <input
            name="image"
            defaultValue={event.image ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Status (ex: public, draft, anulat)
            </label>
            <input
              name="status"
              defaultValue={event.status ?? ""}
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Link casă de bilete externă (opțional)
            </label>
            <input
              name="ticketsUrl"
              defaultValue={event.ticketsUrl ?? ""}
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/70"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
          >
            Salvează modificările
          </button>
          <a
            href={`/events/${event.slug}/tickets`}
            className="text-xs text-zinc-400 hover:text-accent"
          >
            ← Înapoi la bilete
          </a>
        </div>
      </form>
    </section>
  );
}