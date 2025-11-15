"use client";

import React from "react";
import Link from "next/link";
import {
  Music2,
  Camera,
  Video,
  Mic2,
  Sparkles,
  Lightbulb,
  Building2,
  TicketPercent,
  UtensilsCrossed,
  Users2,
  Ship,
  PartyPopper,
  Guitar,
  ChefHat,
  Car,
  Clapperboard,
  Wand2,
  Megaphone,
  Baby,
} from "lucide-react";

export type CategoryKey =
  | "dj"
  | "fotograf"
  | "videograf"
  | "live"
  | "mc"
  | "decor"
  | "light"
  | "halls"
  | "tickets"
  | "catering"
  | "hostess"
  | "yachts"
  // extra (из полного списка)
  | "folk"
  | "party"
  | "softmusic"
  | "staff"
  | "instrumental"
  | "planner"
  | "gourmet"
  | "bartender"
  | "foodtruck"
  | "dancers"
  | "sound"
  | "magicians"
  | "comedians"
  | "kids"
  | "photobooth"
  | "makeup"
  | "hair"
  | "fx"
  | "stage"
  | "cars"
  | "concept"
  | "mobilebar";

const CATS: { key: CategoryKey; label: string }[] = [
  // ROW 1
  { key: "live",        label: "Live Band" },
  { key: "dj",          label: "DJ" },
  { key: "folk",        label: "Folk Music" },
  { key: "party",       label: "Party Music" },
  { key: "softmusic",   label: "Light Music" },
  { key: "instrumental",label: "Instrumental Artists" },
  { key: "dancers",     label: "Professional Dancers" },
  { key: "kids",        label: "Kids Entertainers" },

  // ROW 2
  { key: "magicians",   label: "Magicians" },
  { key: "comedians",   label: "Comedians" },
  { key: "concept",     label: "Concept Artists" },
  { key: "mc",          label: "Master of Ceremonies" },
  { key: "staff",       label: "Service Staff" },
  { key: "hostess",     label: "Hostess" },
  { key: "planner",     label: "Event Planner" },
  { key: "fotograf",    label: "Photography" },

  // ROW 3
  { key: "videograf",   label: "Videography" },
  { key: "photobooth",  label: "Photo Booth" },
  { key: "makeup",      label: "Makeup Artist" },
  { key: "hair",        label: "Hair Stylist" },
  { key: "decor",       label: "Decor & Flowers" },
  { key: "light",       label: "Lighting" },
  { key: "sound",       label: "Sound Equipment" },
  { key: "fx",          label: "Special Effects" },

  // ROW 4
  { key: "stage",       label: "Stage & Structures" },
  { key: "halls",       label: "Venues" },
  { key: "tickets",     label: "Tickets" },
  { key: "catering",    label: "Catering" },
  { key: "gourmet",     label: "Gourmet Stands" },
  { key: "bartender",   label: "Bartender" },
  { key: "mobilebar",   label: "Mobile Bar" },
  { key: "foodtruck",   label: "Food Truck" },
];

const ICON_CLASSES = "h-7 w-7 sm:h-7 sm:w-7 lg:h-6 lg:w-6";

const CATEGORY_ICONS: Record<CategoryKey, React.ReactNode> = {
  dj:          <Music2 className={ICON_CLASSES} />,
  fotograf:    <Camera className={ICON_CLASSES} />,
  videograf:   <Video className={ICON_CLASSES} />,
  live:        <Guitar className={ICON_CLASSES} />,
  mc:          <Mic2 className={ICON_CLASSES} />,
  decor:       <Sparkles className={ICON_CLASSES} />,
  light:       <Lightbulb className={ICON_CLASSES} />,
  halls:       <Building2 className={ICON_CLASSES} />,
  tickets:     <TicketPercent className={ICON_CLASSES} />,
  catering:    <UtensilsCrossed className={ICON_CLASSES} />,
  hostess:     <Users2 className={ICON_CLASSES} />,
  yachts:      <Ship className={ICON_CLASSES} />,

  folk:        <Guitar className={ICON_CLASSES} />,
  party:       <PartyPopper className={ICON_CLASSES} />,
  softmusic:   <Music2 className={ICON_CLASSES} />,
  staff:       <Users2 className={ICON_CLASSES} />,
  instrumental:<Guitar className={ICON_CLASSES} />,
  planner:     <Clapperboard className={ICON_CLASSES} />,
  gourmet:     <ChefHat className={ICON_CLASSES} />,
  bartender:   <ChefHat className={ICON_CLASSES} />,
  foodtruck:   <Car className={ICON_CLASSES} />,
  dancers:     <Sparkles className={ICON_CLASSES} />,
  sound:       <Megaphone className={ICON_CLASSES} />,
  magicians:   <Wand2 className={ICON_CLASSES} />,
  comedians:   <Megaphone className={ICON_CLASSES} />,
  kids:        <Baby className={ICON_CLASSES} />,
  photobooth:  <Camera className={ICON_CLASSES} />,
  makeup:      <Sparkles className={ICON_CLASSES} />,
  hair:        <Sparkles className={ICON_CLASSES} />,
  fx:          <Sparkles className={ICON_CLASSES} />,
  stage:       <Building2 className={ICON_CLASSES} />,
  cars:        <Car className={ICON_CLASSES} />,
  concept:     <Sparkles className={ICON_CLASSES} />,
  mobilebar:   <ChefHat className={ICON_CLASSES} />,
};

export default function CategoryGrid() {
  return (
    <div
      className="
        grid gap-2
        grid-cols-3
        sm:grid-cols-4
        lg:grid-cols-6
        xl:grid-cols-8 xl:gap-3
      "
    >
      {CATS.map((c, idx) => {
        const icon = CATEGORY_ICONS[c.key];

        return (
          <Link
            key={c.key}
            href={`/c/${c.key}`}
            aria-label={c.label}
            style={{ animationDelay: `${idx * 30}ms` }}
            className="
              group relative flex
              items-stretch
              transform-gpu cat-pop
            "
          >
            <div
              className="
                relative flex h-full w-full flex-col justify-between
                overflow-hidden rounded-[26px]
                border border-[var(--border-subtle)]
                bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.10),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.96),rgba(3,17,13,0.98))]
                backdrop-blur-[22px]
                shadow-[0_26px_90px_rgba(0,0,0,1)]
                px-3 py-2.5 sm:px-3.5 sm:py-3
                min-h-[70px] sm:min-h-[76px] md:min-h-[80px]
                transition-all duration-200
                hover:border-[var(--border-accent)]
                hover:shadow-[0_32px_110px_rgba(0,0,0,1)]
                hover:bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.18),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(6,32,26,1),rgba(3,17,13,1))]
              "
            >
              {/* верх: иконка + маленький slot */}
              <div className="flex items-start justify-between">
                <div className="relative flex items-center justify-center">
                  <div
                    className="
                      pointer-events-none absolute h-14 w-14
                      rounded-full
                      bg-[radial-gradient(circle,rgba(217,176,112,0.26),transparent_65%)]
                      opacity-0 blur-md
                      transition-opacity duration-300
                      group-hover:opacity-100
                    "
                  />
                  <div
                    className="
                      relative flex h-12 w-12 items-center justify-center
                      rounded-2xl
                      bg-[rgba(3,17,13,0.96)]
                      border border-[rgba(245,245,245,0.06)]
                      text-[var(--text-main)]
                      shadow-[0_22px_55px_rgba(0,0,0,1)]
                      transition-all duration-200
                      group-hover:border-[var(--border-accent)]
                      group-hover:bg-[var(--accent)]
                      group-hover:text-[#1b1207]
                    "
                  >
                    {icon}
                  </div>
                </div>

                <span
                  className="
                    mt-1 inline-flex h-1.5 w-6 rounded-full
                    bg-[rgba(245,245,245,0.14)]
                    opacity-70
                    group-hover:bg-[var(--accent)]
                    group-hover:opacity-100
                    transition-colors duration-200
                  "
                />
              </div>

              {/* низ: подпись + линия */}
              <div className="flex flex-col gap-1 pt-1">
                <span
                  className="
                    text-[9px] sm:text-[10px]
                    font-medium tracking-[0.22em] uppercase
                    text-[var(--text-muted)]
                    transition-colors duration-200
                    line-clamp-2
                  "
                >
                  {c.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="
                      h-[1px] flex-1 rounded-full
                      bg-[rgba(245,245,245,0.10)]
                      group-hover:bg-[var(--accent)]
                      transition-colors duration-200
                    "
                  />
                  <span className="h-[4px] w-[4px] rounded-full bg-[rgba(245,245,245,0.22)] group-hover:bg-[var(--accent)]" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
