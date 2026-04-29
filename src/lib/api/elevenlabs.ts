/**
 * ElevenLabs TTS API wrapper
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = "https://api.elevenlabs.io/v1";

export const VOICES = [
  { id: "sarah", name: "Sarah", label: "Sarah - Friendly" },
  { id: "james", name: "James", label: "James - Professional" },
  { id: "luna", name: "Luna", label: "Luna - Energetic" },
  { id: "marcus", name: "Marcus", label: "Marcus - Authoritative" },
] as const;

export type VoiceId = (typeof VOICES)[number]["id"];

export async function generateSpeech(
  text: string,
  voiceId: VoiceId
): Promise<ArrayBuffer> {
  // TODO: Implement actual ElevenLabs API call
  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  return res.arrayBuffer();
}
