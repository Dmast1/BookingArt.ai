"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ConversationSummary = {
  id: string;
  updatedAt: string;
  lastMessage: {
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
  } | null;
  counterpart: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
};

type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
};

type BookingSummary = {
  id: string;
  city: string | null;
  date: string;
  status: string;
  priceGross: number | null;
  providerName: string | null;
  clientEmail: string | null;
};

type Props = {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
};

export default function ChatClient(props: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  // автоскролл вниз
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function loadConversations() {
    const res = await fetch("/api/chat/conversations", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { conversations: ConversationSummary[] };
    setConversations(data.conversations);
    if (!activeId && data.conversations.length > 0) {
      setActiveId(data.conversations[0].id);
    }
  }

  // начальная загрузка + поллинг
  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 8000);
    return () => clearInterval(id);
  }, []);

  // загрузка сообщений + booking при смене диалога
  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    void loadBooking(activeId);
  }, [activeId]);

  async function loadMessages(conversationId: string) {
    setLoadingMessages(true);
    const res = await fetch(
      `/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
      { cache: "no-store" }
    );
    setLoadingMessages(false);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: ChatMessage[] };
    setMessages(data.messages);
  }

  async function loadBooking(conversationId: string) {
    setShowBooking(false);
    setBooking(null);
    const res = await fetch(
      `/api/chat/context?conversationId=${encodeURIComponent(conversationId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const data = (await res.json()) as { booking: BookingSummary | null };
    setBooking(data.booking);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    setSending(true);
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, text }),
    });
    setSending(false);
    if (!res.ok) return;
    const data = (await res.json()) as {
      message: ChatMessage & { conversationId: string };
    };
    if (data.message.conversationId === activeId) {
      setMessages((prev) => [...prev, data.message]);
    }
    setText("");
    void loadConversations();
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-[#050b09] via-[#020304] to-[#120806] p-4 shadow-[0_26px_120px_rgba(0,0,0,0.9)] md:grid-cols-[280px,1fr]">
      {/* Список диалогов */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Dialoguri
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Mesaje cu clienți și artiști.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-zinc-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>online</span>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {conversations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-700/70 bg-black/50 px-3 py-3 text-[11px] text-zinc-500">
              Încă nu ai conversații. Vor apărea aici discuțiile pornite din
              rezervări și paginile publice.
            </div>
          )}

          {conversations.map((c) => {
            const lastText = c.lastMessage?.text ?? "Fără mesaje încă";
            const isActive = c.id === activeId;
            const name =
              c.counterpart.name ?? c.counterpart.email ?? "Utilizator";

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-xs transition ${
                  isActive
                    ? "bg-[radial-gradient(circle_at_top,#1b281f,#050706)] ring-1 ring-emerald-400/70 shadow-[0_14px_40px_rgba(0,0,0,0.9)]"
                    : "bg-white/0 hover:bg-white/5 hover:ring-1 hover:ring-white/10"
                }`}
              >
                <Avatar
                  name={name}
                  avatarUrl={c.counterpart.avatarUrl}
                  size={32}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-zinc-100">
                      {name}
                    </span>
                    {c.lastMessage && (
                      <span className="flex-shrink-0 text-[10px] text-zinc-500">
                        {new Date(c.lastMessage.createdAt).toLocaleTimeString(
                          "ro-RO",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-zinc-400">
                    {lastText}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex h-[520px] flex-col rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur">
        {activeConversation ? (
          <>
            {/* header */}
            <div className="mb-2 flex items-center justify-between gap-3 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Avatar
                  name={
                    activeConversation.counterpart.name ??
                    activeConversation.counterpart.email ??
                    "Utilizator"
                  }
                  avatarUrl={activeConversation.counterpart.avatarUrl}
                  size={36}
                />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    {activeConversation.counterpart.name ??
                      activeConversation.counterpart.email ??
                      "Utilizator"}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Chat pentru detalii de eveniment și rezervări.
                  </div>
                </div>
              </div>

              {booking && (
                <button
                  type="button"
                  onClick={() => setShowBooking((v) => !v)}
                  className="inline-flex items-center rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-100 hover:bg-amber-500/20"
                >
                  <span className="mr-1.5 text-xs">ℹ️</span>
                  Detalii rezervare
                </button>
              )}
            </div>

            {/* карточка брони */}
            {booking && showBooking && <BookingCard booking={booking} />}

            {/* сообщения */}
            <div className="mt-2 flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
              {loadingMessages && messages.length === 0 && (
                <div className="text-xs text-zinc-500">
                  Se încarcă mesajele…
                </div>
              )}

              {!loadingMessages && messages.length === 0 && (
                <div className="text-xs text-zinc-500">
                  Nu există mesaje încă. Trimite primul mesaj pentru a
                  discuta detaliile rezervării.
                </div>
              )}

              {messages.map((m) => {
                const mine = m.senderId === props.currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-[13px] shadow-[0_10px_35px_rgba(0,0,0,0.7)] ${
                        mine
                          ? "bg-[var(--accent)] text-black"
                          : "bg-white/5 text-zinc-100"
                      }`}
                    >
                      <div>{m.text}</div>
                      <div className="mt-1 text-[10px] opacity-70">
                        {new Date(m.createdAt).toLocaleTimeString("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <form
              onSubmit={handleSend}
              className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Scrie un mesaj…"
                className="flex-1 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[var(--accent)]/80"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black shadow-[0_0_0_1px_rgba(0,0,0,0.45)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Trimite
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-zinc-500">
            Alege un dialog din listă pentru a vedea mesajele.
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== вспомогательные компоненты ===== */

function Avatar(props: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const size = props.size ?? 32;
  const initial = props.name?.[0]?.toUpperCase() ?? "U";
  if (props.avatarUrl) {
    return (
      <div
        className="overflow-hidden rounded-full border border-white/15 bg-black/40"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.avatarUrl}
          alt={props.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="grid place-items-center rounded-full bg-white/5 text-xs font-semibold text-zinc-100 ring-1 ring-white/12"
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingSummary }) {
  const date = new Date(booking.date);
  const dateStr = date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const price =
    booking.priceGross != null
      ? `${(booking.priceGross / 100).toLocaleString("ro-RO", {
          minimumFractionDigits: 0,
        })} €`
      : "—";

  return (
    <div className="mb-2 rounded-2xl border border-amber-500/40 bg-[rgba(120,82,18,0.18)] p-3 text-xs text-amber-50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">
          Rezervare legată de acest chat
        </div>
        <a
          href={`/bookings/${booking.id}`}
          className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-medium text-black hover:brightness-110"
        >
          Detalii booking
        </a>
      </div>
      <div className="space-y-1.5">
        {booking.providerName && (
          <div>
            <span className="text-amber-200/70">Artist / provider: </span>
            <span className="font-medium">{booking.providerName}</span>
          </div>
        )}
        {booking.clientEmail && (
          <div>
            <span className="text-amber-200/70">Client: </span>
            <span>{booking.clientEmail}</span>
          </div>
        )}
        <div>
          <span className="text-amber-200/70">Buget / preț: </span>
          <span>{price}</span>
        </div>
        <div>
          <span className="text-amber-200/70">Data: </span>
          <span>
            {dateStr} · {timeStr}
          </span>
        </div>
        <div>
          <span className="text-amber-200/70">Locație: </span>
          <span>{booking.city ?? "—"}</span>
        </div>
        <div>
          <span className="text-amber-200/70">Status: </span>
          <span>{booking.status}</span>
        </div>
      </div>
    </div>
  );
}
