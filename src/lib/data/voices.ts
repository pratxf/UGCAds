export type VoiceGender = "female" | "male";

export type Voice = {
  id: string;        // ElevenLabs voice ID
  name: string;      // Display name
  gender: VoiceGender;
  description: string;
  previewUrl: string;
};

// Voice samples are hosted by ElevenLabs publicly
const sample = (id: string) =>
  `https://storage.googleapis.com/eleven-public-prod/premade/voices/${id}/${id}.mp3`;

export const voices: Voice[] = [
  // ── Female ──
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Sarah",
    gender: "female",
    description: "Friendly & warm",
    previewUrl: sample("21m00Tcm4TlvDq8ikWAM"),
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Emma",
    gender: "female",
    description: "Soft & expressive",
    previewUrl: sample("EXAVITQu4vr4xnSDxMaL"),
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Jessica",
    gender: "female",
    description: "Confident & strong",
    previewUrl: sample("AZnzlk1XvdvUeBnXmlld"),
  },
  {
    id: "XB0fDUnXU5powFXDhCwa",
    name: "Lisa",
    gender: "female",
    description: "Smooth & calm",
    previewUrl: sample("XB0fDUnXU5powFXDhCwa"),
  },
  {
    id: "jsCqWAovK2LkecY7zXl4",
    name: "Mia",
    gender: "female",
    description: "Energetic & bright",
    previewUrl: sample("jsCqWAovK2LkecY7zXl4"),
  },

  // ── Male ──
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "James",
    gender: "male",
    description: "Professional & clear",
    previewUrl: sample("ErXwobaYiN019PkySvjV"),
  },
  {
    id: "VR6AewLTigWG4xSOukaG",
    name: "Marcus",
    gender: "male",
    description: "Deep & authoritative",
    previewUrl: sample("VR6AewLTigWG4xSOukaG"),
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "Daniel",
    gender: "male",
    description: "Mature & trustworthy",
    previewUrl: sample("JBFqnCBsd6RMkjVDRZzb"),
  },
  {
    id: "TxGEqnHWrfWFTfGW9XjX",
    name: "Ryan",
    gender: "male",
    description: "Casual & natural",
    previewUrl: sample("TxGEqnHWrfWFTfGW9XjX"),
  },
  {
    id: "CYw3kZ02Hs0563khs1Fj",
    name: "Ethan",
    gender: "male",
    description: "Conversational & warm",
    previewUrl: sample("CYw3kZ02Hs0563khs1Fj"),
  },
];

export function getVoice(id: string): Voice | undefined {
  return voices.find((v) => v.id === id);
}

export const DEFAULT_VOICE_ID = voices[0].id;
