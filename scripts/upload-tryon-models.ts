/* eslint-disable */
// Bulk-upload local Men/ and Women/ folders to R2 and link to TryonModel records.
// Run: npx tsx scripts/upload-tryon-models.ts

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

// 20 women + 20 men. First 10 should match existing seeded models; the
// rest are new and will be inserted.
const FEMALE = [
  { name: "Sofia",     bodyType: "slim",       ethnicity: "latina" },
  { name: "Zoe",       bodyType: "athletic",   ethnicity: "white" },
  { name: "Aisha",     bodyType: "curvy",      ethnicity: "black" },
  { name: "Mei",       bodyType: "slim",       ethnicity: "asian" },
  { name: "Priya",     bodyType: "athletic",   ethnicity: "south-asian" },
  { name: "Emma",      bodyType: "average",    ethnicity: "white" },
  { name: "Layla",     bodyType: "curvy",      ethnicity: "middle-eastern" },
  { name: "Aria",      bodyType: "slim",       ethnicity: "asian" },
  { name: "Maya",      bodyType: "plus",       ethnicity: "black" },
  { name: "Luna",      bodyType: "average",    ethnicity: "latina" },
  { name: "Chloe",     bodyType: "slim",       ethnicity: "white" },
  { name: "Nia",       bodyType: "athletic",   ethnicity: "black" },
  { name: "Yuki",      bodyType: "slim",       ethnicity: "asian" },
  { name: "Amara",     bodyType: "curvy",      ethnicity: "black" },
  { name: "Isla",      bodyType: "average",    ethnicity: "white" },
  { name: "Camila",    bodyType: "athletic",   ethnicity: "latina" },
  { name: "Anika",     bodyType: "slim",       ethnicity: "south-asian" },
  { name: "Noor",      bodyType: "average",    ethnicity: "middle-eastern" },
  { name: "Imani",     bodyType: "plus",       ethnicity: "black" },
  { name: "Sienna",    bodyType: "average",    ethnicity: "white" },
];

const MALE = [
  { name: "Marcus",    bodyType: "athletic",   ethnicity: "black" },
  { name: "Liam",      bodyType: "slim",       ethnicity: "white" },
  { name: "Diego",     bodyType: "average",    ethnicity: "latino" },
  { name: "Kai",       bodyType: "slim",       ethnicity: "asian" },
  { name: "Jordan",    bodyType: "muscular",   ethnicity: "black" },
  { name: "Ethan",     bodyType: "athletic",   ethnicity: "white" },
  { name: "Aryan",     bodyType: "average",    ethnicity: "south-asian" },
  { name: "Omar",      bodyType: "average",    ethnicity: "middle-eastern" },
  { name: "Noah",      bodyType: "athletic",   ethnicity: "white" },
  { name: "Chen",      bodyType: "slim",       ethnicity: "asian" },
  { name: "Andre",     bodyType: "muscular",   ethnicity: "black" },
  { name: "Mateo",     bodyType: "athletic",   ethnicity: "latino" },
  { name: "Hiro",      bodyType: "average",    ethnicity: "asian" },
  { name: "Rohan",     bodyType: "slim",       ethnicity: "south-asian" },
  { name: "Kwame",     bodyType: "athletic",   ethnicity: "black" },
  { name: "Theo",      bodyType: "slim",       ethnicity: "white" },
  { name: "Yusuf",     bodyType: "athletic",   ethnicity: "middle-eastern" },
  { name: "Sebastian", bodyType: "average",    ethnicity: "latino" },
  { name: "Jaxon",     bodyType: "muscular",   ethnicity: "white" },
  { name: "Kenji",     bodyType: "slim",       ethnicity: "asian" },
];

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function listImages(dir: string) {
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

async function syncGender(
  gender: "female" | "male",
  roster: { name: string; bodyType: string; ethnicity: string }[],
  folder: string,
) {
  const files = listImages(folder);
  console.log(`\n${gender}: ${files.length} files in ${folder}, ${roster.length} models`);

  for (let i = 0; i < roster.length; i++) {
    const m = roster[i];
    const file = files[i];

    // Upsert the model (creates if missing, updates name/bodyType/ethnicity)
    const existing = await prisma.tryonModel.findFirst({
      where: { name: m.name, gender },
    });
    let model = existing;
    if (!model) {
      model = await prisma.tryonModel.create({
        data: {
          name: m.name,
          gender,
          bodyType: m.bodyType,
          ethnicity: m.ethnicity,
          imageUrl: "",
          sortOrder: i,
        },
      });
    } else {
      model = await prisma.tryonModel.update({
        where: { id: existing!.id },
        data: {
          bodyType: m.bodyType,
          ethnicity: m.ethnicity,
          sortOrder: i,
          isActive: true,
        },
      });
    }

    if (!file) {
      console.log(`  · ${m.name}: no image — skipping upload`);
      continue;
    }

    const ext = path.extname(file).toLowerCase().replace(".", "");
    const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const key = `tryon-models/${gender}/${slug}-${model.id}.${ext}`;
    const ct = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const url = await uploadOne(path.join(folder, file), key, ct);
    await prisma.tryonModel.update({ where: { id: model.id }, data: { imageUrl: url } });
    console.log(`  ✓ ${m.name} → ${url}`);
  }
}

async function main() {
  await syncGender("female", FEMALE, "Women");
  await syncGender("male", MALE, "Men");
  const counts = await prisma.tryonModel.groupBy({
    by: ["gender"],
    _count: true,
    where: { isActive: true },
  });
  console.log("\nFinal active counts:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
