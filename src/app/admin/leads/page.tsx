// src/components/admin/LeadStatusForm.tsx
"use client";

import * as React from "react";

// единый тип статусов
export type LeadStatus = "new" | "contacted" | "won" | "lost";

type Props = {
  id: string;
  current: LeadStatus | string;     // допускаем строку из БД
  saveLabel?: string;               // опционально (по умолчанию — "Salvează")
  size?: "sm" | "md";               // опционально (по умолчанию — "md")
  className?: string;
};

export default function LeadStatusForm({
  id,
  current,
  saveLabel = "Salvează",
  size = "md",
  className,
}: Props) {
  const [value, setValue] = React.useState<LeadStatus>(
    (current as LeadStatus) ?? "new"
  );
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`/api/admin/leads/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      // можно добавить оптимистическое уведомление
    } finally {
      setSubmitting(false);
    }
  }

  const pad =
    size === "sm" ? "px-2 py-1 text-[12px]" : "px-3 py-1.5 text-[13px]";

  return (
    <form onSubmit={onSubmit} className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as LeadStatus)}
        className={[
          "rounded-full border border-[var(--border-subtle)] bg-white/[.05] text-zinc-100",
          pad,
        ].join(" ")}
      >
        <option value="new">new</option>
        <option value="contacted">contacted</option>
        <option value="won">won</option>
        <option value="lost">lost</option>
      </select>

      <button
        type="submit"
        disabled={submitting}
        className={[
          "rounded-full bg-[var(--accent)] text-[#1b1207] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.35)]",
          "hover:translate-y-[1px] transition-transform disabled:opacity-60",
          pad,
        ].join(" ")}
      >
        {saveLabel}
      </button>
    </form>
  );
}
