// src/components/chat/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type BookingSummary = {
  id: string;
  date: string;
  city: string | null;
  providerName: string | null;
  status: string;
} | null;

type OtherUser = {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
} | null;

type Message = {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
};

type Props = {
  currentUserId: string;
  conversationId: string | null;
  otherUser: OtherUser;
  bookingSummary: BookingSummary;
};

export function ChatWindow({
  currentUserId,
  conversationId,
  otherUser,
  bookingSummary,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canChat = !!conversationId && !!otherUser;

  // авто-скролл вниз
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // подгружаем сообщения
  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/chat/messages?conversationId=${conversationId}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Nu am putut încărca mesajele.");
        const data = (await res.json()) as { messages: Message[] };
        if (!cancelled) {
          setMessages(data.messages);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Eroare la încărcare.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    const interval = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    setSending(true);
    setError(null);
    const text = input.trim();

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text }),
      });
      if (!res.ok) throw new Error("Nu am putut trimite mesajul.");
      const data = (await res.json()) as { message: Message };
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    } catch (e: any) {
      setError(e.message || "Eroare la trimiterea mesajului.");
    } finally {
      setSending(false);
    }
  }

  const otherLabel =
    otherUser?.name || otherUser?.email || (otherUser ? "Utilizator" : "");

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          {canChat && otherUser ? (
            <>
              {otherUser.avatarUrl ? (
                <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={otherUser.avatarUrl}
                    alt={otherLabel}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-xs font-semibold text-zinc-100 ring-1 ring-white/10">
                  {(otherLabel || "U")[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-zinc-100">
                  {otherLabel}
                </div>
                <div className="text-[11px] text-zinc-500">
                  Chat pentru rezervări & detalii eveniment.
                </div>
              </div>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Mesaje &amp; chat
            </div>
          )}
        </div>

        {otherUser?.email && canChat && (
          <span className="hidden truncate text-[11px] text-zinc-500 md:inline">
            {otherUser.email}
          </span>
        )}
      </div>

      {/* BOOKING BADGE */}
      {bookingSummary && (
        <div className="border-b border-line bg-black/40 px-4 py-3 text-xs text-zinc-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Legat de rezervarea
              </div>
              <div className="mt-0.5 text-sm text-zinc-100">
                {bookingSummary.providerName ?? "Eveniment"} ·{" "}
                {bookingSummary.city ?? "—"} · {bookingSummary.date}
              </div>
              <a
                href={`/bookings/${bookingSummary.id}`}
                className="mt-1 inline-flex text-[11px] text-accent hover:underline"
              >
                Deschide detalii rezervare →
              </a>
            </div>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              {bookingSummary.status}
            </span>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
        {error && (
          <div className="mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        {!canChat && (
          <p className="mt-6 text-center text-xs text-zinc-500">
            Alege mai întâi o conversație / rezervare din stânga pentru a începe
            chatul.
          </p>
        )}

        {canChat && loading && messages.length === 0 && (
          <p className="mt-4 text-center text-xs text-zinc-500">
            Încărcăm conversația…
          </p>
        )}

        {canChat && !loading && messages.length === 0 && (
          <p className="mt-4 text-center text-xs text-zinc-500">
            Nu există încă mesaje în această conversație. Scrie primul mesaj.
          </p>
        )}

        {messages.map((m) => {
          const me = m.senderId === currentUserId;
          const time = new Date(m.createdAt).toLocaleTimeString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={m.id}
              className={`flex ${me ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs ${
                  me
                    ? "bg-accent text-black"
                    : "bg-white/[0.06] text-zinc-100"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`mt-1 text-[10px] ${
                    me ? "text-black/60" : "text-zinc-400"
                  }`}
                >
                  {time}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="border-t border-line px-3 py-2 text-sm"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              canChat
                ? "Scrie un mesaj…"
                : "Alege mai întâi o conversație / rezervare"
            }
            disabled={!canChat || sending}
            className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canChat || sending || !input.trim()}
            className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            Trimite
          </button>
        </div>
      </form>
    </div>
  );
}
