// src/app/api/upload/activity-image/route.ts
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  // Реализуйте ваш провайдер (S3/Cloudflare/локально). Верните { url }.
  return NextResponse.json({ url: "/uploads/demo-activity.jpg" });
}
