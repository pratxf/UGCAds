/* eslint-disable */
// Clears all old avatars, uploads men + women from local folders to R2, seeds DB.
// Run: npx tsx scripts/seed-avatars.ts

import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

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

// ─── Names ───────────────────────────────────────────────────────────────────

const WOMEN_NAMES = [
  "Aanya", "Aria", "Aurora", "Avni", "Bella",
  "Chloe", "Diya", "Elena", "Emma", "Eva",
  "Isabella", "Isla", "Jade", "Jasmine", "Kaia",
  "Kiara", "Layla", "Leila", "Lily", "Luna",
  "Maya", "Mia", "Nadia", "Natasha", "Neha",
  "Nora", "Olivia", "Pari", "Pooja", "Priya",
  "Rachel", "Riya", "Ruby", "Sara", "Sia",
  "Sofia", "Sophia", "Stella", "Tara", "Trisha",
  "Uma", "Valentina", "Vera", "Veda", "Zara",
  "Zoe", "Zoya", "Zuri",
];

const MEN_NAMES = [
  "Aarav", "Aiden", "Alex", "Arjun", "Aryan",
  "Caleb", "Dylan", "Ethan", "Felix", "Ivan",
  "Jai", "James", "Kai", "Karan", "Liam",
  "Lucas", "Marcus", "Milan", "Noah", "Ryan",
];

async function uploadToR2(filePath: string, key: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/png",
  }));
  return `${PUBLIC_URL}/${key}`;
}

async function main() {
  // 1. Delete all old avatars and categories
  console.log("Deleting old avatars and categories...");
  await prisma.avatar.deleteMany({});
  await prisma.avatarCategory.deleteMany({});
  console.log("  ✓ Cleared");

  // 2. Create categories
  const womenCat = await prisma.avatarCategory.create({
    data: { name: "Women", slug: "women", sortOrder: 0 },
  });
  const menCat = await prisma.avatarCategory.create({
    data: { name: "Men", slug: "men", sortOrder: 1 },
  });
  console.log("  ✓ Created categories: Women, Men");

  const ROOT = path.join(process.cwd());

  // 3. Upload Women
  const womenDir = path.join(ROOT, "women");
  const womenFiles = fs.readdirSync(womenDir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  console.log(`\nUploading ${womenFiles.length} women avatars...`);
  for (let i = 0; i < womenFiles.length; i++) {
    const file = womenFiles[i];
    const name = WOMEN_NAMES[i] ?? `Woman ${i + 1}`;
    const slug = `avatar-w-${String(i + 1).padStart(2, "0")}`;
    const r2Key = `avatars/${slug}.png`;
    try {
      process.stdout.write(`  → ${name} ... `);
      const url = await uploadToR2(path.join(womenDir, file), r2Key);
      await prisma.avatar.create({
        data: { name, imageUrl: url, categoryId: womenCat.id, sortOrder: i, active: true },
      });
      console.log("✓");
    } catch (e) {
      console.log(`✗ ${e instanceof Error ? e.message : e}`);
    }
  }

  // 4. Upload Men
  const menDir = path.join(ROOT, "men");
  const menFiles = fs.readdirSync(menDir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  console.log(`\nUploading ${menFiles.length} men avatars...`);
  for (let i = 0; i < menFiles.length; i++) {
    const file = menFiles[i];
    const name = MEN_NAMES[i] ?? `Man ${i + 1}`;
    const slug = `avatar-m-${String(i + 1).padStart(2, "0")}`;
    const r2Key = `avatars/${slug}.png`;
    try {
      process.stdout.write(`  → ${name} ... `);
      const url = await uploadToR2(path.join(menDir, file), r2Key);
      await prisma.avatar.create({
        data: { name, imageUrl: url, categoryId: menCat.id, sortOrder: i, active: true },
      });
      console.log("✓");
    } catch (e) {
      console.log(`✗ ${e instanceof Error ? e.message : e}`);
    }
  }

  const total = await prisma.avatar.count({ where: { active: true } });
  console.log(`\nDone. Total avatars: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
