/* eslint-disable */
// Run: npx tsx scripts/generate-voice-previews.ts
// Generates a short preview clip for every Voice via fal.ai ElevenLabs,
// uploads to R2 under voice-previews/{voiceId}.mp3, and stores the URL.
//
// Requires: FAL_KEY + R2 env vars in .env

import { PrismaClient } from "@prisma/client";
import { fal } from "@fal-ai/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

fal.config({ credentials: process.env.FAL_KEY });

const env = (k: string) => (process.env[k] || "").trim();
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  },
});
const BUCKET = env("R2_BUCKET_NAME");
const PUBLIC_URL = env("R2_PUBLIC_URL");

function previewScript(name: string, gender: string) {
  if (gender === "female") {
    return `Hi, I'm ${name} — your new AI voice for UGC ads. I'm here to help your brand connect with real customers.`;
  }
  return `Hey, I'm ${name} — ready to bring your ads to life with a voice that actually connects with your audience.`;
}

async function uploadAudio(buffer: Buffer, key: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "audio/mpeg",
    }),
  );
  return `${PUBLIC_URL}/${key}`;
}

async function main() {
  const force = process.argv.includes("--force");
  const voices = await prisma.voice.findMany({
    where: force ? undefined : { previewUrl: "" },
  });
  console.log(`Generating previews for ${voices.length} voices…`);

  for (const v of voices) {
    try {
      console.log(`→ ${v.name} (${v.gender})`);
      const text = previewScript(v.name, v.gender);
      const result = await fal.subscribe("fal-ai/elevenlabs/tts/multilingual-v2", {
        input: { text, voice: v.voiceId, stability: 0.5, similarity_boost: 0.75 },
      });
      const data = result.data as { audio?: { url?: string }; audio_url?: string };
      const audioUrl = data?.audio?.url || data?.audio_url;
      if (!audioUrl) {
        console.warn(`  ! no audio URL returned for ${v.name}`);
        continue;
      }
      const res = await fetch(audioUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const url = await uploadAudio(buffer, `voice-previews/${v.voiceId}.mp3`);
      await prisma.voice.update({ where: { id: v.id }, data: { previewUrl: url } });
      console.log(`  ✓ ${url}`);
    } catch (e) {
      console.error(`  ✗ ${v.name}:`, e instanceof Error ? e.message : e);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
