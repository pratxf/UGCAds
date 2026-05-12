import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocked = await rateLimitOrResponse(`support-upload:${user.id}`, { windowSec: 60, max: 5 });
  if (blocked) return blocked;

  const fd = await req.formData();
  const file = fd.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowed = ["jpg", "jpeg", "png", "gif", "webp"];
  if (!allowed.includes(ext)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `support/${user.id}/${nanoid()}.${ext}`;
  const url = await uploadToR2(buffer, key, file.type);

  return NextResponse.json({ url });
}
