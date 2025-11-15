// src/lib/auth-tokens.ts
import crypto from "crypto";
import { prisma } from "./prisma";

export async function createEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function consumeEmailVerificationToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return null;
  }

  await prisma.verificationToken.delete({ where: { id: record.id } });
  return record.userId;
}
