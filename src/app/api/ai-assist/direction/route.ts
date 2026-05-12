import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { CREATIVE_DIRECTION_CHARACTER_LIMIT } from "@/lib/script-limits";
import { prisma } from "@/lib/prisma";

const POYO_BASE = "https://api.poyo.ai";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id }, select: { plan: true, status: true } });
    if (!sub || sub.status !== "ACTIVE") return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
    const blocked = await rateLimitOrResponse(`ai-assist-direction:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    const body = await req.json();
    const existingDirection = String(body.existingDirection || "").trim();
    const script = String(body.script || "").trim();
    if (!existingDirection && !script) {
      return NextResponse.json({ error: "existingDirection or script is required" }, { status: 400 });
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
            content: "You write visual performance direction for AI-generated UGC video ads.",
          },
          {
            role: "user",
            content: `Script, if available:\n"${script || "No script provided"}"\n\nUser's rough direction, if available:\n"${existingDirection || "No rough direction provided"}"\n\nRewrite this as practical creator/video direction only.\nRules:\n- Include creator expression, eye contact, gestures, camera feel, pacing, and setting when useful\n- Keep it concise, one short paragraph\n- Do not include dialogue, captions, headings, labels, hashtags, or emojis\n- Do not tell the model to add on-screen text\n- Return only the direction text`,
          },
        ],
        temperature: 1,
        max_tokens: 200,
        top_p: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ai-assist/direction] Poyo error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const direction = data.choices?.[0]?.message?.content?.trim().slice(0, CREATIVE_DIRECTION_CHARACTER_LIMIT);
    if (!direction) return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });

    return NextResponse.json({ direction });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist/direction]", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
