"use client";

import { useState } from "react";

export default function VenueRequestForm({
  defaultCity,
  defaultName,
}: {
  defaultCity?: string | null;
  defaultName?: string;
}) {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/request-venue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueName: defaultName,
          city: defaultCity,
          contactEmail: email,
          date, // используем ISO-дату (UTC) как вы тестировали
          time, // необязательное поле на бэке — можно передать пустым
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setMsg(j.error ? String(j.error) : "Server error");
      } else {
        setMsg("Cererea a fost trimisă. Vă contactăm în curând.");
        setEmail("");
        setDate("");
        setTime("");
      }
    } catch (err: any) {
      setMsg(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white/[.03] ring-1 ring-white/[.06] p-4">
      <div className="text-lg font-semibold">Solicită ofertă</div>
      <div className="mt-3 grid gap-3">
        <input
          type="email"
          required
          placeholder="Emailul tău"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl bg-surface border border-line px-3 h-10 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl bg-surface border border-line px-3 h-10 text-sm outline-none"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl bg-surface border border-line px-3 h-10 text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent text-black font-medium px-4 h-10 disabled:opacity-60"
        >
          {loading ? "Se trimite…" : "Trimite cererea"}
        </button>

        {msg && (
          <div className="text-sm text-zinc-300">{msg}</div>
        )}
      </div>
    </form>
  );
}
