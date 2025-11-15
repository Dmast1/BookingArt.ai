// src/components/chat/MessagesClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingInfo = {
  id: string;
  date: string; // ISO
  city: string | null;
  status: string;
  providerName: string | null;
};

type MessageDTO = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string; // ISO
};

type ConversationDTO = {
  id: string;
  updatedAt: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  booking: BookingInfo | null;
  messages: MessageDTO[];
};

export function MessagesClient(props: {
  currentUserId: string;
  conversations: ConversationDTO[];
}) {
  const { currentUserId, conversations } = props;
  const router = useRouter();

  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [localConversations, setLocalConversations] =
    useState<ConversationDTO[]>(conversations);

  const active =
    localConversations.find((c) => c.id === activeId) ?? null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !text.trim() || sending) return;

    const payload = { conversationId: active.id, text: text.trim() };
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // можно показать тост, пока просто лог
        console.error(await res.json());
        return;
      }

      const msg = (await res.json()) as {
        id: string;
        text: string;
        senderId: string;
        createdAt: string;
      };

      // Локально добавляем сообщение, чтобы не ждать full refresh
      setLocalConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                updatedAt: msg.createdAt,
                messages: [...c.messages, msg],
              }
            : c
        )
      );
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 grid min-h-[480px] grid-cols-1 gap-4 rounded-2xl border border-line bg-surface/80 p-3 md:grid-cols-[260px_minmax(0,1fr)]">
      {/* LEFT: список диалогов */}
      <aside className="border-b border-line pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Conversații
          </h2>
          <button
            type="button"
            className="text-[11px] text-zinc-500 hover:text-accent"
            onClick={() => router.refresh()}
          >
            Reîncarcă
          </button>
        </div>

        {localConversations.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-400">
            Nu ai încă conversații. După ce faci o rezervare, vei putea
            discuta aici cu artistul / clientul.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {localConversations.map((c) => {
              const isActive = c.id === activeId;
              const lastMsg =
                c.messages[c.messages.length - 1] ?? null;

              const lastTime = lastMsg
                ? new Date(lastMsg.createdAt).toLocaleTimeString(
                    "ro-RO",
                    { hour: "2-digit", minute: "2-digit" }
                  )
                : "";

              const name =
                c.otherUser.name ||
                c.otherUser.email ||
                "Utilizator";

              const avatarLetter =
                (c.otherUser.name ||
                  c.otherUser.email ||
                  "U")[0]?.toUpperCase() ?? "U";

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-xs ${
                      isActive
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {c.otherUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.otherUser.avatarUrl}
                        alt={name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-zinc-100">
                        {avatarLetter}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] text-zinc-100">
                          {name}
                        </span>
                        {lastTime && (
                          <span className="shrink-0 text-[10px] text-zinc-500">
                            {lastTime}
                          </span>
                        )}
                      </div>
                      {lastMsg && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                          <span className="truncate">
                            {lastMsg.senderId === currentUserId
                              ? "Tu: "
                              : ""}
                            {lastMsg.text}
                          </span>
                        </div>
                      )}
                      {c.booking && (
                        <div className="mt-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-[2px] text-[10px] text-emerald-200">
                          Rezervare
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* RIGHT: текущее общение */}
      <div className="flex min-h-[320px] flex-col">
        {!active ? (
          <div className="grid h-full place-items-center text-sm text-zinc-400">
            Selectează o conversație din listă.
          </div>
        ) : (
          <>
            {/* шапка + бейдж брони */}
            <div className="mb-2 flex items-center justify-between gap-2 border-b border-line pb-2">
              <div className="flex items-center gap-2">
                {active.otherUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.otherUser.avatarUrl}
                    alt={
                      active.otherUser.name ??
                      active.otherUser.email ??
                      "Avatar"
                    }
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-zinc-100">
                    {(active.otherUser.name ||
                      active.otherUser.email ||
                      "U")[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="text-xs">
                  <div className="text-zinc-100">
                    {active.otherUser.name ||
                      active.otherUser.email ||
                      "Utilizator"}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Chat intern BookingArt.ai
                  </div>
                </div>
              </div>

              {active.booking && (
                <a
                  // детальную страницу брони сделаем /bookings/{id}
                  href={`/bookings/${active.booking.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-100 hover:border-emerald-400 hover:bg-emerald-500/20"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Detalii rezervare
                </a>
              )}
            </div>

            {/* сообщения */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
              {active.messages.length === 0 ? (
                <p className="mt-2 text-xs text-zinc-400">
                  Nu există mesaje încă. Trimite primul mesaj.
                </p>
              ) : (
                active.messages.map((m) => {
                  const isMine = m.senderId === currentUserId;
                  const time = new Date(
                    m.createdAt
                  ).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        isMine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs ${
                          isMine
                            ? "bg-accent text-black"
                            : "bg-white/5 text-zinc-100"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {m.text}
                        </div>
                        <div
                          className={`mt-1 text-[10px] ${
                            isMine
                              ? "text-black/60"
                              : "text-zinc-400"
                          }`}
                        >
                          {time}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* форма ввода */}
            <form
              onSubmit={handleSend}
              className="mt-3 flex gap-2 border-t border-line pt-3"
            >
              <textarea
                rows={1}
                className="min-h-[40px] flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder="Scrie un mesaj..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="inline-flex h-[40px] items-center rounded-xl bg-accent px-4 text-sm font-semibold text-black disabled:opacity-60"
              >
                Trimite
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
