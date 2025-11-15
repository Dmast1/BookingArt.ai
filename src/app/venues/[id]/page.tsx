// src/app/venues/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VenueRequestForm from "./request-form";

type PageProps = { params: { id: string } };

export default async function VenueDetailsPage({ params }: PageProps) {
  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  });

  if (!venue) return notFound();

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      {/* Галерея */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/[.06] bg-white/[.03]">
        <div className="aspect-[16/9] w-full">
          <img
            src={venue.images?.[0] || "https://picsum.photos/seed/venue/1200/700"}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
        </div>
        {!!venue.images?.length && venue.images.length > 1 && (
          <div className="grid grid-cols-3 gap-2 p-2">
            {venue.images.slice(1).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Image ${idx + 2}`}
                className="h-24 w-full object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>

      {/* Боковая инфо + заявка */}
      <aside>
        <h1 className="text-2xl font-semibold">{venue.name}</h1>
        <div className="mt-1 text-zinc-400">
          {venue.city} · {venue.country ?? "RO"}
        </div>

        <div className="mt-4 rounded-xl bg-white/[.03] ring-1 ring-white/[.06] p-4">
          <div className="text-sm text-zinc-300">
            Capacitate:{" "}
            {venue.capacityMin && venue.capacityMax
              ? `${venue.capacityMin}–${venue.capacityMax} pers`
              : "Flexibilă"}
          </div>
          <div className="mt-1 text-sm text-zinc-300">
            Preț:{" "}
            {venue.priceFrom
              ? `${venue.priceFrom}–${venue.priceTo ?? venue.priceFrom} ${venue.currency}`
              : "La cerere"}
          </div>

          {!!venue.features?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {venue.features.map((f, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-surface border border-line px-2 py-1 text-xs text-zinc-300"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Форма — уходит в /api/request-venue */}
        <div className="mt-6">
          <VenueRequestForm
            defaultCity={venue.city}
            defaultName={venue.name}
          />
        </div>
      </aside>
    </section>
  );
}
