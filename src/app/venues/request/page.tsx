export const metadata = { title: "Propune sală — BookingArt.ai" };

import LeadForm from "@/components/forms/LeadForm";

export default function Page() {
  return (
    <section className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Propune o sală nouă</h1>
      <LeadForm mode="venue" />
    </section>
  );
}
