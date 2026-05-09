/* eslint-disable */
// Convert all photoshoot template PNGs in R2 → WebP (quality 80).
// Downloads each PNG, converts with sharp, re-uploads as .webp, updates DB.
// Idempotent — skips templates whose imageUrl already ends in .webp.
//
// Run: npx tsx scripts/convert-templates-webp.ts

import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

async function main() {
  const templates = await prisma.photoshootTemplate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`Found ${templates.length} templates.`);
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const t of templates) {
    if (!t.imageUrl || !t.imageUrl.startsWith("http")) {
      console.log(`  · ${t.name} — no imageUrl, skipping`);
      skipped++;
      continue;
    }
    if (t.imageUrl.endsWith(".webp")) {
      console.log(`  · ${t.name} — already webp, skipping`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  → ${t.name} ... `);

      // Download PNG
      const res = await fetch(t.imageUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const pngBuffer = Buffer.from(await res.arrayBuffer());

      // Convert to WebP
      const webpBuffer = await sharp(pngBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Derive new R2 key (replace .png with .webp)
      const oldKey = t.imageUrl.replace(`${PUBLIC_URL}/`, "");
      const newKey = oldKey.replace(/\.png$/i, ".webp");

      // Upload WebP
      await r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: newKey,
        Body: webpBuffer,
        ContentType: "image/webp",
      }));

      const newUrl = `${PUBLIC_URL}/${newKey}`;

      // Update DB
      await prisma.photoshootTemplate.update({
        where: { id: t.id },
        data: { imageUrl: newUrl },
      });

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
