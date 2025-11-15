// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs"; // нужен fs

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const id = randomUUID();
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${id}.${ext}`;
  const filepath = join(uploadsDir, filename);

  await writeFile(filepath, buffer);

  // публичный URL
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}