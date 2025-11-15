"use client";

import { useState, useTransition } from "react";

const options = [
  { v: "new", label: "new" },
  { v: "contacted", label: "contacted" },
  { v: "converted", label: "converted" },
  { v: "rejected", label: "rejected" },
];

export default function LeadStatusForm({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [value, setValue] = useState(current);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function update() {
    setMsg(null);
    start(async () => {
      const res = await fetch(`/api/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const json = await res.json();
      setMsg(res.ok ? "OK" : json?.error || "Error");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-md bg-surface border border-line px-2 py-1 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={pending}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        onClick={update}
        disabled={pending}
        className="rounded-md bg-accent text-black text-sm px-3 py-1 disabled:opacity-60"
      >
        Сохранить
      </button>
      {msg && <span className="text-xs text-zinc-400">{msg}</span>}
    </div>
  );
}
