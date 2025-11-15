// scripts/delete-user.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: npx ts-node scripts/delete-user.ts <USER_ID>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      provider: { select: { id: true } },
    },
  });

  if (!user) {
    console.log("User not found:", userId);
    return;
  }

  const providerId = user.provider?.id ?? null;

  // ---- Chat: conversations & messages, где участвует пользователь
  const convByUser = await prisma.conversation.findMany({
    where: { OR: [{ userOneId: userId }, { userTwoId: userId }] },
    select: { id: true },
  });
  const convIds = convByUser.map((c) => c.id);
  if (convIds.length) {
    await prisma.message.deleteMany({ where: { conversationId: { in: convIds } } });
    await prisma.conversation.deleteMany({ where: { id: { in: convIds } } });
  }
  await prisma.message.deleteMany({ where: { senderId: userId } });

  // ---- Ticket orders пользователя
  await prisma.ticketOrderItem.deleteMany({ where: { order: { userId } } });
  await prisma.ticketOrder.deleteMany({ where: { userId } });

  // ---- Bookings, созданные пользователем
  const bookingsByUser = await prisma.booking.findMany({
    where: { userId },
    select: { id: true },
  });
  if (bookingsByUser.length) {
    const bIds = bookingsByUser.map((b) => b.id);
    const convByBooking = await prisma.conversation.findMany({
      where: { bookingId: { in: bIds } },
      select: { id: true },
    });
    if (convByBooking.length) {
      const cbIds = convByBooking.map((c) => c.id);
      await prisma.message.deleteMany({ where: { conversationId: { in: cbIds } } });
      await prisma.conversation.deleteMany({ where: { id: { in: cbIds } } });
    }
    await prisma.booking.deleteMany({ where: { id: { in: bIds } } });
  }

  // ---- Отвязываем площадки пользователя (ownerId nullable)
  await prisma.venue.updateMany({ where: { ownerId: userId }, data: { ownerId: null } });

  // ---- Токены верификации
  await prisma.verificationToken.deleteMany({ where: { userId } });

  // ---- Если у пользователя есть Provider — чистим всё, что на нём
  if (providerId) {
    // Activities: сначала ордера/позиции, слоты, пакеты, затем сами активности
    const acts = await prisma.activity.findMany({
      where: { providerId },
      select: { id: true },
    });
    const actIds = acts.map((a) => a.id);

    if (actIds.length) {
      const actOrderIds = (
        await prisma.activityOrder.findMany({
          where: { activityId: { in: actIds } },
          select: { id: true },
        })
      ).map((o) => o.id);

      if (actOrderIds.length) {
        await prisma.activityOrderItem.deleteMany({ where: { orderId: { in: actOrderIds } } });
        await prisma.activityOrder.deleteMany({ where: { id: { in: actOrderIds } } });
      }

      await prisma.activitySlot.deleteMany({ where: { activityId: { in: actIds } } });
      await prisma.activityPackage.deleteMany({ where: { activityId: { in: actIds } } });
      await prisma.activity.deleteMany({ where: { id: { in: actIds } } });
    }

    // Пакеты провайдера, календарь, события, лиды, документы, брони по провайдеру
    await prisma.providerPackage.deleteMany({ where: { providerId } });
    await prisma.availability.deleteMany({ where: { providerId } });
    await prisma.event.deleteMany({ where: { providerId } });
    await prisma.lead.deleteMany({ where: { providerId } });
    await prisma.booking.deleteMany({ where: { providerId } });
    await prisma.providerDocument.deleteMany({ where: { providerId } });

    // Сам Provider
    await prisma.provider.delete({ where: { id: providerId } });
  }

  // ---- Финально удаляем пользователя
  await prisma.user.delete({ where: { id: userId } });

  console.log("Deleted user and related data:", userId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
