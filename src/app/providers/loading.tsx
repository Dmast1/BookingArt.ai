export default function LoadingProviders() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="h-6 w-64 rounded bg-white/10 animate-pulse" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl border border-line bg-white/[.04] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
