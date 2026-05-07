import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`ai-assist:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    const body = await req.json();
    const existingScript = String(body.existingScript || "").trim();
    if (!existingScript) {
      return NextResponse.json({ error: "existingScript is required" }, { status: 400 });
    }

    const prompt = `You are a UGC ad script writer for social media video ads.

The user has written this rough idea or short sentence:
"${existingScript}"

Rewrite and expand this into a complete, punchy UGC ad script.
Rules:
- 3-4 sentences only, no more
- Hook first (grab attention in first 2 seconds)
- Problem second (relate to the viewer's pain point)
- Solution third (introduce the product as the fix)
- CTA last (tell them exactly what to do)
- Sound like a real person talking to a friend
- Conversational tone, not marketing speak
- No hashtags, no emojis, no brackets, no labels
- Do not number the sentences
- Just return the script text, nothing else`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const script = (message.content[0] as { text: string }).text.trim();
    if (!script) return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });

    return NextResponse.json({ script });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist/script]", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
