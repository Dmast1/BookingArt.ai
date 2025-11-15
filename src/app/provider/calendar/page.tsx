// src/app/provider/calendar/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProviderAvailabilityCalendar, { type Status } from "@/app/profile/ProviderAvailabilityCalendar";

// Вспомогалка: вычисляем, относится ли провайдер к "личным услугам" (календарь нужен)
// Если провайдер помечен как "activitati/activități" — считаем, что это витрина Activități и
// календарь провайдера тут не показываем.
async function getProviderCapabilities(userId: string) {
  const provider = await prisma.provider.findUnique({
    where: { userId },
    select: {
      id: true,
      categories: true,
      activities: {
        select: { id: true },
        take: 1,
      },
    },
  });

  const categoriesLower =
    provider?.categories?.map((c) => c?.toLowerCase?.() ?? "") ?? [];

  const isActivitiesProvider =
    categoriesLower.includes("activitati") || categoriesLower.includes("activități");

  // личные услуги (DJ/Photo/…): календарь включаем
  const hasPersonalServices = !isActivitiesProvider;

  return {
    hasPersonalServices,
    providerId: provider?.id ?? null,
  };
}

export default async function ProviderCalendarPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/provider/calendar");
  }

  const { hasPersonalServices, providerId } = await getProviderCapabilities(user.id);

  // если это провайдер Activități — уводим в модуль Activități
  if (!hasPersonalServices) {
    redirect("/provider/activities");
  }

  if (!providerId) {
    // у пользователя нет привязанного Provider — отправим в онбординг настроек
    redirect("/settings/provider");
  }

  // Подтягиваем availability на 60 дней вперёд
  const start = new Date();
  const startUtc = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

  const rangeEnd = new Date(startUtc);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 60);

  const availability = await prisma.availability.findMany({
    where: {
      providerId,
      date: { gte: startUtc, lt: rangeEnd },
    },
    orderBy: { date: "asc" },
    take: 120,
  });

  const map = new Map<string, Status>();
  for (const slot of availability) {
    const key = slot.date.toISOString().slice(0, 10);
    map.set(key, (slot.status as Status) ?? "free");
  }

  const days: { date: string; status: Status }[] = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date(startUtc);
    d.setUTCDate(startUtc.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: d.toISOString(), status: map.get(key) ?? "free" });
  }

  return (
    <section className="mx-auto max-w-5xl pb-12">
      <h1 className="mb-4 text-2xl font-semibold text-zinc-50">Calendar disponibilitate</h1>
      <p className="mb-4 text-sm text-zinc-400">
        Marchează zilele disponibile/ocupate pentru rezervări directe.
      </p>
      <ProviderAvailabilityCalendar days={days} />
    </section>
  );
}
