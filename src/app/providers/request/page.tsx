export const metadata = { title: "Propune provider — BookingArt.ai" };

import LeadForm from "@/components/forms/LeadForm";

export default function Page() {
  return (
    <section className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Propune un provider nou</h1>
      <LeadForm mode="provider" />
    </section>
  );
}
