import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireUser } from "@/lib/auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const apiKey = (process.env.GOOGLE_GEMINI_API_KEY || "").trim();

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`ai-assist:${user.id}`, { windowSec: 60, max: 20 });
    if (blocked) return blocked;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GEMINI_API_KEY is not configured" },
        { status: 500 },
      );
    }

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

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try the current flash models in order; fall back across name versions.
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
        const script = result.response.text().trim();
        if (!script) {
          lastErr = new Error("Empty response from AI");
          continue;
        }
        return NextResponse.json({ script });
      } catch (e) {
        lastErr = e;
        // Try next candidate on 404 / model-not-found / unsupported errors
        const msg = e instanceof Error ? e.message : String(e);
        if (!/404|not found|not supported|unavailable/i.test(msg)) {
          break;
        }
      }
    }

    const message = lastErr instanceof Error ? lastErr.message : "AI Assist failed";
    console.error("[ai-assist] Gemini failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[ai-assist] route error:", msg);
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
