import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { CREATIVE_DIRECTION_CHARACTER_LIMIT } from "@/lib/script-limits";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`ai-assist-direction:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    const body = await req.json();
    const existingDirection = String(body.existingDirection || "").trim();
    const script = String(body.script || "").trim();
    if (!existingDirection && !script) {
      return NextResponse.json({ error: "existingDirection or script is required" }, { status: 400 });
    }

    const prompt = `You write visual performance direction for AI-generated UGC video ads.

Script, if available:
"${script || "No script provided"}"

User's rough direction, if available:
"${existingDirection || "No rough direction provided"}"

Rewrite this as practical creator/video direction only.
Rules:
- Include creator expression, eye contact, gestures, camera feel, pacing, and setting when useful
- Keep it concise, one short paragraph
- Do not include dialogue, captions, headings, labels, hashtags, or emojis
- Do not tell the model to add on-screen text
- Return only the direction text`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const direction = (message.content[0] as { text: string }).text.trim().slice(0, CREATIVE_DIRECTION_CHARACTER_LIMIT);
    if (!direction) return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });

    return NextResponse.json({ direction });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist/direction]", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
