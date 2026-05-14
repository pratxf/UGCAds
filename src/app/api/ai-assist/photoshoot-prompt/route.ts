import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const OPENAI_BASE = "https://api.openai.com/v1";

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

    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You write scene descriptions for AI product photography. You turn rough ideas into vivid, specific visual prompts.",
          },
          {
            role: "user",
            content: `The user wants a product photo with this vibe or setting:\n"${existing}"\n\nWrite a vivid, detailed background scene description for AI product photography based on their idea.\nRules:\n- 2-3 sentences max\n- Describe only the physical scene: surface, background, lighting, atmosphere, textures, colors\n- No people, no screens, no UI, no software — only real-world physical environment elements\n- Match the mood and style the user described but translate it into a real photoshoot setting\n- No hashtags, no emojis, no labels\n- Return only the scene description, nothing else`,
          },
        ],
        temperature: 1,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ai-assist/photoshoot-prompt] Poyo error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const prompt = (data.choices?.[0]?.message?.content || "").trim();
    if (!prompt) return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });

    return NextResponse.json({ prompt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist/photoshoot-prompt]", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
