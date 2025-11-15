type Props = { title: string; text: string };

export default function FeatureCard({ title, text }: Props) {
  return (
    <div className="rounded-xl border border-line bg-white/[.04] p-3">
      <div className="text-[13px] text-zinc-400">{title}</div>
      <div className="mt-1 text-sm text-zinc-200">{text}</div>
    </div>
  );
}
