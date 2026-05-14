import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const POYO_BASE = "https://api.poyo.ai";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id }, select: { plan: true, status: true } });
    if (!sub || sub.status !== "ACTIVE") return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
    const blocked = await rateLimitOrResponse(`ai-assist-photoshoot:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    const body = await req.json();
    const existing = String(body.existing || "").trim();
    if (!existing) {
      return NextResponse.json({ error: "existing is required" }, { status: 400 });
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
            content: "You write scene descriptions for AI product photography. You turn rough ideas into vivid, specific visual prompts.",
          },
          {
            role: "user",
            content: `The user has written this rough scene idea:\n"${existing}"\n\nRewrite it as a detailed, vivid scene description for AI product photography.\nRules:\n- 2-3 sentences max\n- Describe lighting, surface, background, and atmosphere in detail\n- Be specific and visual (e.g. "soft morning light", "marble surface", "blurred green foliage")\n- Do not mention the product itself — only the scene and environment\n- No hashtags, no emojis, no labels\n- Return only the scene description, nothing else`,
          },
        ],
        temperature: 1,
        max_tokens: 200,
        top_p: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ai-assist/photoshoot-prompt] Poyo error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json() as { content?: { type: string; text: string }[]; choices?: { message?: { content?: string } }[] };
    const prompt = (data.content?.[0]?.text || data.choices?.[0]?.message?.content || "").trim();
    if (!prompt) return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });

    return NextResponse.json({ prompt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist/photoshoot-prompt]", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
