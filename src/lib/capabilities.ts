// src/lib/capabilities.ts
import { prisma } from "@/lib/prisma";

const matchActivitati = (val: string) =>
  ["activitati","activități","activitati (activități)"].includes(
    val.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
  );

export async function getProviderCapabilities(userId: string) {
  const p = await prisma.provider.findUnique({
    where: { userId },
    select: { categories: true, verified: true }
  });
  if (!p) return { hasActivities: false, canPublishActivities: false };

  const hasActivities = (p.categories || []).some(matchActivitati);

  // Можно отдельно привязать к верификации:
  const canPublishActivities = hasActivities && !!p.verified;

  return { hasActivities, canPublishActivities };
}
