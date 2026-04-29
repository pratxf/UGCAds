/* eslint-disable */
// Bulk-upload local ProductAdMen/ and ProductAdWomen/ folders to R2 and
// create ProductAdAvatar records. Run: npx tsx scripts/upload-product-ad-avatars.ts

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
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }));
  return `${PUBLIC_URL}/${key}`;
}

async function syncFolder(folder: string, gender: "female" | "male", namePrefix: string, sortBase: number) {
  const files = listImages(folder);
  console.log(`\n${gender}: ${files.length} files in ${folder}`);
  if (files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file).toLowerCase().replace(".", "") || "jpg";
    const ct = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const avatar = await prisma.productAdAvatar.create({
      data: {
        name: `${namePrefix} ${i + 1}`,
        gender,
        nationality: "american",
        imageUrl: "",
        sortOrder: sortBase + i,
        isActive: true,
      },
    });

    const slug = avatar.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const key = `product-ad-avatars/${gender}/${slug}-${avatar.id}.${ext}`;
    const url = await uploadOne(path.join(folder, file), key, ct);
    await prisma.productAdAvatar.update({ where: { id: avatar.id }, data: { imageUrl: url } });
    console.log(`  ✓ ${avatar.name} → ${url}`);
  }
}

async function main() {
  // Wipe any leftover entries first to avoid duplicates
  const cleared = await prisma.productAdAvatar.deleteMany();
  console.log(`Cleared ${cleared.count} existing rows`);

  await syncFolder("ProductAdWomen", "female", "Avatar W", 0);
  await syncFolder("ProductAdMen", "male", "Avatar M", 100);

  const counts = await prisma.productAdAvatar.groupBy({
    by: ["gender"],
    _count: true,
    where: { isActive: true },
  });
  console.log("\nFinal:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
