// src/middleware.ts  ИЛИ  ./middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * ========== Rate limit для заявок ==========
 */
const WINDOW_MS = 60_000; // 60 секунд
const MAX_REQ = 30;
const buckets = new Map<string, { count: number; ts: number }>();

const RATE_LIMIT_PATHS = new Set<string>([
  "/api/request-venue",
  "/api/request-provider",
]);

/**
 * Публичные пути (не требуют логина)
 * Всё остальное — только с кукой ba_uid
 */
const PUBLIC_PREFIXES = [
  "/auth",
  "/_next",
  "/images",     // файлы из public/images/*
  "/media",      // файлы из public/media/*  ← ДОБАВИЛИ
  "/logo",       // /logo.png                ← ДОБАВИЛИ
  "/favicon.ico",
  "/robots.txt",
];


export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1) Rate-limit для некоторых API
  if (RATE_LIMIT_PATHS.has(path)) {
    const xfwd = req.headers.get("x-forwarded-for");
    const ip =
      (xfwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip")) ?? "unknown";

    const now = Date.now();
    const bucket = buckets.get(ip) ?? { count: 0, ts: now };

    if (now - bucket.ts > WINDOW_MS) {
      bucket.count = 0;
      bucket.ts = now;
    }

    bucket.count += 1;
    buckets.set(ip, bucket);

    if (bucket.count > MAX_REQ) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
  }

  // 2) Глобальный auth-gate для всех НЕ /api путей
  const isApi = path.startsWith("/api");
  if (!isApi) {
    const isPublic = PUBLIC_PREFIXES.some((p) => path.startsWith(p));

    if (!isPublic) {
      const uid = req.cookies.get("ba_uid")?.value;
      if (!uid) {
        const url = req.nextUrl.clone();
        url.pathname = "/auth";
        // сохраняем, куда человек шёл
        url.searchParams.set("next", path + req.nextUrl.search);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

// матчим всё кроме статики Next и иконок
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
