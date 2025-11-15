"use client";

export default function EventsError({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-xl font-semibold text-red-300">Eroare la încărcare</h1>
      <p className="mt-2 text-sm text-zinc-400">
        A apărut o problemă la încărcarea evenimentelor. Încearcă din nou.
      </p>
    </div>
  );
}
