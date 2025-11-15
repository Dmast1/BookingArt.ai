// src/app/chat/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const metadata: Metadata = {
  title: "Mesaje & Chat — BookingArt.ai",
};

type PageProps = {
  searchParams?: {
    userId?: string;
    bookingId?: string;
  };
};

export default async function ChatPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/chat");
  }

  const currentUserId = user.id;
  const targetUserId = searchParams?.userId || null;
  const bookingId = searchParams?.bookingId || null;

  // --- опционально подтягиваем бронирование, если пришёл bookingId ---
  let bookingSummary:
    | {
        id: string;
        date: string;
        city: string | null;
        providerName: string | null;
        status: string;
      }
    | null = null;

  if (bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true } },
        provider: { select: { id: true, displayName: true, userId: true } },
      },
    });

    const isAdmin = user.role === "ADMIN";
    const isClient = booking?.userId === currentUserId;
    const isProvider = booking?.provider?.userId === currentUserId;

    if (booking && (isAdmin || isClient || isProvider)) {
      bookingSummary = {
        id: booking.id,
        date: booking.date.toLocaleString("ro-RO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        city: booking.city ?? null,
        providerName: booking.provider?.displayName ?? null,
        status: booking.status,
      };
    }
  }

  // --- определяем или создаём разговор, если передан userId ---
  let conversationId: string | null = null;
  let otherUser:
    | {
        id: string;
        name: string | null;
        email: string | null;
        avatarUrl: string | null;
      }
    | null = null;

  if (targetUserId && targetUserId !== currentUserId) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (target) {
      otherUser = target;

      const existing = await prisma.conversation.findFirst({
        where: {
          OR: [
            { userOneId: currentUserId, userTwoId: targetUserId },
            { userOneId: targetUserId, userTwoId: currentUserId },
          ],
        },
        select: { id: true },
      });

      if (existing) {
        conversationId = existing.id;
      } else {
        const created = await prisma.conversation.create({
          data: {
            userOneId: currentUserId,
            userTwoId: targetUserId,
          },
          select: { id: true },
        });
        conversationId = created.id;
      }
    }
  }

  return (
    <section className="mx-auto max-w-6xl pb-10 pt-6">
      {/* маленькая верхняя плашка вместо херо */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Mesaje & Chat
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-zinc-400 sm:flex">
          <span className="opacity-70">Logat ca:</span>
          <span className="font-mono text-zinc-100">{user.email}</span>
        </div>
      </header>

      {/* сам чат — весь дизайн внутри ChatWindow / ChatClient */}
      <ChatWindow
        currentUserId={currentUserId}
        conversationId={conversationId}
        otherUser={otherUser}
        bookingSummary={bookingSummary}
      />
    </section>
  );
}
