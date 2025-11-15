// src/lib/auth.ts
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const AUTH_COOKIE = "ba_uid";

// текущий пользователь по куке
export async function getCurrentUser() {
  const store = await cookies(); // в Next 16 тип у cookies() — Promise, поэтому await
  const uid = store.get(AUTH_COOKIE)?.value;
  if (!uid) return null;

  return prisma.user.findUnique({
    where: { id: uid },
  });
}

// проверка email+пароль
export async function verifyUser(rawEmail: string, password: string) {
  const email = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    console.log("verifyUser: no user or no hash", { email });
    return null;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log("verifyUser: compare", { email, ok });

  if (!ok) return null;
  return user;
}
