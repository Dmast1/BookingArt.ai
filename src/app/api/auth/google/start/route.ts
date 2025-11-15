import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") || "/";

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: next, // прокинем next через state
  });

  return NextResponse.redirect(`${rootUrl}?${params.toString()}`);
}
