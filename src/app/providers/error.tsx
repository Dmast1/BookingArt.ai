"use client";
export default function ProvidersError({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-xl font-semibold text-red-300">Eroare</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Nu s-a putut încărca lista furnizorilor. Încearcă din nou.
      </p>
    </div>
  );
}
