import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const blocked = await rateLimitOrResponse(`upload-avatar:${user.id}`, { windowSec: 60, max: 10 });
    if (blocked) return blocked;
    const form = await req.formData();
    const file = form.get("image") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 413 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG or WEBP allowed" },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const key = `custom-avatars/${user.id}/${Date.now()}.${ext}`;
    const url = await uploadToR2(buffer, key, file.type);
    return NextResponse.json({ url, isCustom: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
