import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const POYO_BASE = "https://api.poyo.ai";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id }, select: { plan: true } });
    if (!sub) return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    const blocked = await rateLimitOrResponse(`ai-assist:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    const body = await req.json();
    const existingScript = String(body.existingScript || "").trim();
    if (!existingScript) {
      return NextResponse.json({ error: "existingScript is required" }, { status: 400 });
    }

    const res = await fetch(`${POYO_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.POYO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        messages: [
          {
            role: "system",
            content: "You are a UGC ad script writer for social media video ads.",
          },
          {
            role: "user",
            content: `The user has written this rough idea or short sentence:\n"${existingScript}"\n\nRewrite and expand this into a complete, punchy UGC ad script.\nRules:\n- 3-4 sentences only, no more\n- Hook first (grab attention in first 2 seconds)\n- Problem second (relate to the viewer's pain point)\n- Solution third (introduce the product as the fix)\n- CTA last (tell them exactly what to do)\n- Sound like a real person talking to a friend\n- Conversational tone, not marketing speak\n- No hashtags, no emojis, no brackets, no labels\n- Do not number the sentences\n- Just return the script text, nothing else`,
          },
        ],
        temperature: 1,
        max_tokens: 300,
        top_p: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ai-assist/script] Poyo error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const script = data.choices?.[0]?.message?.content?.trim();
    if (!script) return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });

    return NextResponse.json({ script });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist/script]", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
