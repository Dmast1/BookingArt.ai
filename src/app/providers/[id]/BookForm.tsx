// src/app/providers/[id]/BookForm.tsx
"use client";

import { useState } from "react";

export default function BookForm({ providerId, defaultDate }: { providerId: string; defaultDate?: string }) {
  const [date, setDate] = useState<string>(defaultDate ?? "");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!date) { setMsg({ type: "err", text: "Выберите дату" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, date, city: city || undefined, userEmail: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Ошибка");
      setMsg({ type: "ok", text: `Заявка создана: ${data.bookingId}` });
    } catch (err: any) {
      setMsg({ type: "err", text: err.message || "Ошибка" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 max-w-md">
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Дата</span>
        <input className="rounded-lg border px-3 py-2" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Город (опционально)</span>
        <input className="rounded-lg border px-3 py-2" value={city} onChange={e => setCity(e.target.value)} placeholder="București" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Email клиента (MVP)</span>
        <input className="rounded-lg border px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@example.com" />
      </label>

      <button disabled={loading} className="mt-2 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
        {loading ? "Отправляю…" : "Отправить заявку"}
      </button>

      {msg && (
        <div className={`rounded-lg border px-3 py-2 text-sm ${msg.type === "ok" ? "border-green-600 text-green-700" : "border-red-600 text-red-700"}`}>
          {msg.text}
        </div>
      )}
    </form>
  );
}
