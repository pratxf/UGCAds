/* eslint-disable */
// Converts avatar PNGs in R2 → WebP (quality 82) for library thumbnails.
// Uploads .webp twin alongside original PNG — does NOT update DB imageUrl.
// Idempotent — checks R2 HeadObject; skips if webp already exists.
//
// Run: npx tsx scripts/convert-avatars-webp.ts

import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const prisma = new PrismaClient();
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

async function webpExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const avatars = await prisma.avatar.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`Found ${avatars.length} avatars.`);
  let converted = 0, skipped = 0, failed = 0;

  for (const a of avatars) {
    if (!a.imageUrl?.startsWith("http") || !a.imageUrl.endsWith(".png")) {
      console.log(`  · ${a.name} — skipping (no PNG url)`);
      skipped++;
      continue;
    }

    const oldKey = a.imageUrl.replace(`${PUBLIC_URL}/`, "");
    const newKey = oldKey.replace(/\.png$/i, ".webp");

    const exists = await webpExists(newKey);
    if (exists) {
      console.log(`  · ${a.name} — already webp, skipping`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  → ${a.name} ... `);
      const res = await fetch(a.imageUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const pngBuffer = Buffer.from(await res.arrayBuffer());

      const webpBuffer = await sharp(pngBuffer).webp({ quality: 82 }).toBuffer();

      await r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: newKey,
        Body: webpBuffer,
        ContentType: "image/webp",
      }));

      const savings = Math.round((1 - webpBuffer.length / pngBuffer.length) * 100);
      console.log(`✓ ${savings}% smaller (${Math.round(webpBuffer.length / 1024)}KB)`);
      converted++;
    } catch (e) {
      console.log(`✗ ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  console.log(`\nDone. Converted: ${converted} | Skipped: ${skipped} | Failed: ${failed}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
