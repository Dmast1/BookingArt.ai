import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateNext = url.searchParams.get("state") || "/";

  if (!code) {
    return NextResponse.redirect("/auth?error=google_no_code");
  }

  // 1) обмен кода на токен
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect("/auth?error=google_token");
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.redirect("/auth?error=google_no_access_token");
  }

  // 2) получаем данные профиля
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!profileRes.ok) {
    return NextResponse.redirect("/auth?error=google_profile");
  }

  const profile = (await profileRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  const email = profile.email;
  if (!email) {
    return NextResponse.redirect("/auth?error=google_no_email");
  }

  // 3) создаём / находим юзера в Prisma
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: profile.name ?? null,
      avatarUrl: profile.picture ?? null,
      role: "USER", // если хочешь — поменяй дефолтную роль
      // можешь ещё сохранить googleId: profile.sub
    },
    update: {
      name: profile.name ?? undefined,
      avatarUrl: profile.picture ?? undefined,
    },
  });

  // 4) ставим куки ba_uid / ba_role (как в твоём SMS login)
  const res = NextResponse.redirect(stateNext || "/");
  res.cookies.set("ba_uid", user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  res.cookies.set("ba_role", user.role ?? "USER", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
