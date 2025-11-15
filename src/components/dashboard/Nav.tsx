// src/components/dashboard/Nav.tsx
import { getCurrentUser } from "@/lib/auth";
import { getProviderCapabilities } from "@/lib/capabilities";

export default async function DashboardNav() {
  const user = await getCurrentUser();
  if (!user) return null;

  // забираем только то, что реально есть
  const { hasActivities } = await getProviderCapabilities(user.id);

  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      <a href="/profile">Profil</a>

      {/* календарь показываем, если у провайдера вообще есть активити */}
      {hasActivities && <a href="/provider/calendar">Calendar</a>}

      {hasActivities && <a href="/provider/activities">Activități</a>}
      <a href="/settings/provider">Setări</a>
      <a href="/orders">Comenzi</a>
    </nav>
  );
}
