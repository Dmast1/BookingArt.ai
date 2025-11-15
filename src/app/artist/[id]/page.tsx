import AvailabilityCalendar from "@/components/artist/AvailabilityCalendar";

export const metadata = { title: "Artist — BookingArt.ai" };

type Params = { params: { id: string } };

export default function ArtistPage({ params }: Params) {
  // демо-данные
  const artist = {
    id: params.id,
    name: "DJ Example",
    genre: "House / Tech",
    city: "București",
    rating: 4.8,
    eventsCount: 124,
    socials: {
      youtube: "https://youtube.com/",
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/",
    },
    bio: "Experiență de peste 8 ani, echipament propriu, deplasări în toată țara.",
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-line bg-white/[.03] text-xl">
            🎧
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{artist.name}</h1>
            <div className="mt-0.5 text-sm text-zinc-400">
              {artist.genre} · {artist.city}
            </div>
            <div className="mt-1 text-sm text-zinc-300">
              ⭐ {artist.rating} · {artist.eventsCount} evenimente
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={artist.socials.youtube}
            target="_blank"
            className="rounded-xl border border-line bg-white/[.04] px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/[.08]"
          >
            YouTube
          </a>
          <a
            href={artist.socials.instagram}
            target="_blank"
            className="rounded-xl border border-line bg-white/[.04] px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/[.08]"
          >
            Instagram
          </a>
          <a
            href={artist.socials.facebook}
            target="_blank"
            className="rounded-xl border border-line bg-white/[.04] px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/[.08]"
          >
            Facebook
          </a>
          <a
            href={`/book/${artist.id}`}
            className="ml-1 rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-black hover:brightness-110"
          >
            Rezervă
          </a>
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Описание / преимущества */}
        <div className="rounded-2xl border border-line bg-white/[.03] p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Despre</h2>
          <p className="mt-2 text-sm text-zinc-300">{artist.bio}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-line bg-white/[.04] p-3">
              <div className="text-zinc-400">Echipament</div>
              <div className="mt-1 text-zinc-200">Sistem audio, lumini, consolă</div>
            </div>
            <div className="rounded-xl border border-line bg-white/[.04] p-3">
              <div className="text-zinc-400">Limbi</div>
              <div className="mt-1 text-zinc-200">RO, EN, RU</div>
            </div>
          </div>
        </div>

        {/* Календарь доступности */}
        <div>
          <AvailabilityCalendar />
          <div className="mt-3 text-xs text-zinc-400">
            Zile roșii = rezervat integral. Zile galbene = rezervări parțiale (ex. 12:00–14:00). Zile verzi = liber.
          </div>
        </div>
      </section>
    </div>
  );
}
