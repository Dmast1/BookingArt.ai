// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const user = await verifyUser(email, password);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Email sau parolă incorectă." },
        { status: 401 }
      );
    }

    // Блокируем логин, если email не подтверждён
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Emailul nu este încă confirmat. Verifică inbox/spam pentru linkul de confirmare.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    });

    res.cookies.set(AUTH_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 zile
    });

    return res;
  } catch (e) {
    console.error("POST /api/auth/login error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
