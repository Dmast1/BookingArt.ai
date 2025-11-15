// src/app/provider/activities/new/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProviderCapabilities } from "@/lib/capabilities";
import ActivityForm from "@/components/activities/ActivityForm";

export default async function NewActivityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/provider/activities/new");

  const { hasActivities } = await getProviderCapabilities(user.id);
  if (!hasActivities) redirect("/provider/activities");

  return (
    <section className="mx-auto max-w-3xl py-6">
      <h1 className="text-2xl font-semibold mb-3">Activitate nouă</h1>
      <ActivityForm mode="create" />
    </section>
  );
}
