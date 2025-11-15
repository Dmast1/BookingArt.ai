// src/app/messages/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MessagesClient } from "@/components/chat/MessagesClient";

export const metadata: Metadata = {
  title: "Mesaje — BookingArt.ai",
};

type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/messages");
  }

  const role = (user.role as AppRole) ?? "GUEST";

  // Гостям чат пока не даём — ведём в профиль
  if (role === "GUEST") {
    redirect("/profile");
  }

  // Типы Prisma у тебя сейчас отстают от схемы, поэтому кастуем аргументы и результат к any.
  const conversationsRaw = (await prisma.conversation.findMany({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      userOne: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      userTwo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      booking: {
        select: {
          id: true,
          date: true,
          city: true,
          status: true,
          provider: { select: { displayName: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
      },
    },
  } as any)) as any[];

  const conversations = conversationsRaw.map((c) => {
    const other =
      c.userOneId === user.id ? c.userTwo ?? {} : c.userOne ?? {};

    return {
      id: c.id as string,
      updatedAt: (c.updatedAt as Date).toISOString(),
      otherUser: {
        id: (other.id as string) ?? "",
        name: (other.name as string | null) ?? null,
        email: (other.email as string | null) ?? null,
        avatarUrl: (other.avatarUrl as string | null) ?? null,
      },
      booking: c.booking
        ? {
            id: c.booking.id as string,
            date: (c.booking.date as Date).toISOString(),
            city: (c.booking.city as string | null) ?? null,
            status: (c.booking.status as string) ?? "pending",
            providerName:
              (c.booking.provider?.displayName as string | null) ?? null,
          }
        : null,
      messages: (c.messages ?? []).map((m: any) => ({
        id: m.id as string,
        senderId: m.senderId as string,
        text: m.text as string,
        createdAt: (m.createdAt as Date).toISOString(),
      })),
    };
  });

  return (
    <section className="mx-auto max-w-6xl pb-12 pt-4">
      <header className="mb-2 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Mesaje</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Comunicare internă între clienți și artiști / provideri pentru
            rezervările făcute prin BookingArt.ai.
          </p>
        </div>
        <div className="text-xs text-zinc-500 md:text-right">
          Chat legat de rezervări. Ulterior adăugăm notificări email/push și
          atașamente.
        </div>
      </header>

      <MessagesClient
        currentUserId={user.id}
        conversations={conversations}
      />
    </section>
  );
}
