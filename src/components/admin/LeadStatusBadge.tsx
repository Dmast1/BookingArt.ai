export default function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-white/10 text-white",
    contacted: "bg-blue-500/20 text-blue-300",
    converted: "bg-green-500/20 text-green-300",
    rejected: "bg-red-500/20 text-red-300",
  };
  const cls =
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium " +
    (map[status] ?? "bg-white/10");

  return <span className={cls}>{status}</span>;
}
