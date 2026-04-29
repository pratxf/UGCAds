/* eslint-disable */
// Run: npx tsx scripts/sync-voices.ts
// One-shot: applies renames, removals, additions, and regenerates ALL previews.

import { PrismaClient } from "@prisma/client";
import { fal } from "@fal-ai/client";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

// ─── Final desired roster (10 female + 10 male) ───
const FEMALE: { voiceId: string; name: string; descriptor: string }[] = [
  { voiceId: "kPzsL2i3teMYv0FxEYQ6", name: "Brittney",  descriptor: "Friendly & warm" },
  { voiceId: "6u6JbqKdaQy89ENzLSju", name: "Brielle",   descriptor: "Confident & strong" },
  { voiceId: "h2dQOVyUfIDqY2whPOMo", name: "Nayva",     descriptor: "Smooth & calm" },
  { voiceId: "uYXf8XasLslADfZ2MB4u", name: "Lily",      descriptor: "Youthful & fun" },
  { voiceId: "K7W7zLWeGoxU9YqWoB7A", name: "Rachel",    descriptor: "Calm & professional" },
  { voiceId: "MnUw1cSnpiLoLhpd3Hqp", name: "Heather",   descriptor: "Warm & natural" },
  { voiceId: "aMSt68OGf4xUZAnLpTU8", name: "Juniper",   descriptor: "Soft & expressive" },
  { voiceId: "Z3R5wn05IrDiVCyEkUrK", name: "Arabella",  descriptor: "Elegant & polished" },
  { voiceId: "qSeXEcewz7tA0Q0qk9fH", name: "Victoria",  descriptor: "Confident & poised" },
  { voiceId: "S9NKLs1GeSTKzXd9D0Lf", name: "Haley",     descriptor: "Energetic & bright" },
];

const MALE: { voiceId: string; name: string; descriptor: string }[] = [
  { voiceId: "RXZGC6H41rpnXBWuHTQD", name: "Ryan",   descriptor: "Casual & relatable" },
  { voiceId: "rPMkKgdwgIwqv4fXgR6N", name: "Tyler",  descriptor: "Sharp & direct" },
  { voiceId: "aKUMgdkpitgitOAQ9gZN", name: "Dylan",  descriptor: "Natural & conversational" },
  { voiceId: "7EzWGsX10sAS4c9m9cPf", name: "John",   descriptor: "Deep & trustworthy" },
  { voiceId: "3TStB8f3X3To0Uj5R7RK", name: "Joseff", descriptor: "Bold & confident" },
  { voiceId: "Rsz5u2Huh1hPlPr0oxRQ", name: "Josh",   descriptor: "Upbeat & modern" },
  { voiceId: "douDhHvfoViWmZth0cUX", name: "Peter",  descriptor: "Warm & friendly" },
  { voiceId: "8fcyCHOzlKDlxh1InJSf", name: "Joseph", descriptor: "Smooth & engaging" },
  { voiceId: "9JbYHzFp74No6NSJoI0w", name: "George", descriptor: "Rich & authoritative" },
  { voiceId: "PGqDc9SLzJTxDTy8SjYb", name: "Dan",    descriptor: "Energetic & young" },
];

const ALL = [
  ...FEMALE.map((v) => ({ ...v, gender: "female" as const })),
  ...MALE.map((v) => ({ ...v, gender: "male" as const })),
];
const KEEP_IDS = new Set(ALL.map((v) => v.voiceId));

function previewScript(name: string, gender: string) {
  if (gender === "female") {
    return `Hi, I'm ${name} — your new AI voice for UGC ads. I'm here to help your brand connect with real customers.`;
  }
  return `Hey, I'm ${name} — ready to bring your ads to life with a voice that actually connects with your audience.`;
}

async function deleteFromR2(key: string) {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.warn(`  ! could not delete ${key}:`, e instanceof Error ? e.message : e);
  }
}

async function uploadAudio(buffer: Buffer, key: string) {
  await r2.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: "audio/mpeg" }),
  );
  return `${PUBLIC_URL}/${key}`;
}

async function main() {
  // 1. Remove voices not in the final roster, plus their R2 previews.
  const existing = await prisma.voice.findMany();
  const toRemove = existing.filter((v) => !KEEP_IDS.has(v.voiceId));
  console.log(`Removing ${toRemove.length} obsolete voices…`);
  for (const v of toRemove) {
    await deleteFromR2(`voice-previews/${v.voiceId}.mp3`);
    await prisma.voice.delete({ where: { id: v.id } });
    console.log(`  - ${v.name} (${v.voiceId})`);
  }

  // 2. Upsert the desired roster (clears previewUrl so step 3 regenerates).
  console.log(`\nUpserting ${ALL.length} voices…`);
  let i = 0;
  for (const v of ALL) {
    await prisma.voice.upsert({
      where: { voiceId: v.voiceId },
      update: {
        name: v.name,
        gender: v.gender,
        descriptor: v.descriptor,
        sortOrder: i,
        previewUrl: "", // force regen
      },
      create: {
        name: v.name,
        gender: v.gender,
        voiceId: v.voiceId,
        descriptor: v.descriptor,
        sortOrder: i,
        previewUrl: "",
      },
    });
    console.log(`  ✓ ${v.name} (${v.gender})`);
    i++;
  }

  // 3. Regenerate previews for all 20.
  console.log(`\nGenerating previews for ${ALL.length} voices…`);
  for (const v of ALL) {
    try {
      const text = previewScript(v.name, v.gender);
      const result = await fal.subscribe("fal-ai/elevenlabs/tts/multilingual-v2", {
        input: { text, voice: v.voiceId, stability: 0.5, similarity_boost: 0.75 },
      });
      const data = result.data as { audio?: { url?: string }; audio_url?: string };
      const audioUrl = data?.audio?.url || data?.audio_url;
      if (!audioUrl) {
        console.warn(`  ! no audio URL for ${v.name}`);
        continue;
      }
      const res = await fetch(audioUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const url = await uploadAudio(buffer, `voice-previews/${v.voiceId}.mp3`);
      await prisma.voice.update({ where: { voiceId: v.voiceId }, data: { previewUrl: url } });
      console.log(`  ✓ ${v.name}: ${url}`);
    } catch (e) {
      console.error(`  ✗ ${v.name}:`, e instanceof Error ? e.message : e);
    }
  }

  const counts = await prisma.voice.groupBy({ by: ["gender"], _count: true });
  console.log("\nFinal counts:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
