// src/app/api/upload/package-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs"; // этот роут тоже работает в node, не edge

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // необязательно, но можно отрубить файлы > 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fișier prea mare (max 5MB)" },
        { status: 413 }
      );
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

    const url = `/uploads/${filename}`; // публичный путь
    return NextResponse.json({ url });
  } catch (e) {
    console.error("package-image upload error", e);
    return NextResponse.json(
      { error: "Upload error" },
      { status: 500 }
    );
  }
}
