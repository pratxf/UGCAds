/* eslint-disable */
// Bulk-upload "AI AVATAR/Men" and "AI AVATAR/Women" to R2, create Avatar
// records under "Men" / "Women" categories. Run: npx tsx scripts/upload-avatars.ts

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function listImages(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort(naturalSort);
}

async function uploadOne(localPath: string, key: string, contentType: string) {
  const buffer = fs.readFileSync(localPath);
  await r2.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }),
  );
  return `${PUBLIC_URL}/${key}`;
}

async function ensureCategory(name: string, sortOrder: number) {
  const slug = name.toLowerCase();
  const existing = await prisma.avatarCategory.findFirst({ where: { slug } });
  if (existing) return existing;
  return prisma.avatarCategory.create({ data: { name, slug, sortOrder } });
}

async function syncFolder(folder: string, categoryName: string, namePrefix: string, sortBase: number) {
  const files = listImages(folder);
  console.log(`\n${categoryName}: ${files.length} files in ${folder}`);
  if (files.length === 0) return;

  const category = await ensureCategory(categoryName, sortBase);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file).toLowerCase().replace(".", "") || "jpg";
    const ct = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    // Create the avatar row first to get its id, then upload using a stable key.
    const avatar = await prisma.avatar.create({
      data: {
        name: `${namePrefix} ${i + 1}`,
        imageUrl: "",
        categoryId: category.id,
        sortOrder: i,
        active: true,
      },
    });

    const key = `avatars/library/${category.slug}/${avatar.id}.${ext}`;
    const url = await uploadOne(path.join(folder, file), key, ct);

    await prisma.avatar.update({ where: { id: avatar.id }, data: { imageUrl: url } });
    console.log(`  ✓ ${avatar.name} → ${url}`);
  }
}

async function main() {
  await syncFolder("AI AVATAR/Women", "Women", "Avatar W", 0);
  await syncFolder("AI AVATAR/Men", "Men", "Avatar M", 1);

  const counts = await prisma.avatar.count();
  console.log(`\nTotal avatars: ${counts}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
