import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";
import { CREATIVE_DIRECTION_CHARACTER_LIMIT } from "@/lib/script-limits";

const apiKey = (process.env.GOOGLE_GEMINI_API_KEY || "").trim();

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`ai-assist-direction:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GEMINI_API_KEY is not configured" },
        { status: 500 },
      );
    }

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidates = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-1.5-flash",
    ];

    let lastErr: unknown = null;
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const direction = result.response.text().trim().slice(0, CREATIVE_DIRECTION_CHARACTER_LIMIT);
        if (!direction) {
          lastErr = new Error("Empty response from AI");
          continue;
        }
        return NextResponse.json({ direction });
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (!/404|not found|not supported|unavailable/i.test(msg)) {
          break;
        }
      }
    }

    const message = lastErr instanceof Error ? lastErr.message : "AI Assist failed";
    console.error("[ai-assist-direction] Gemini failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist-direction] route error:", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
