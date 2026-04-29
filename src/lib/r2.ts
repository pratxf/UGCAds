import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Trim env values to defend against accidental trailing newlines
// (e.g. when set via `echo "..." | vercel env add` — newline breaks
// the Authorization header on signed requests).
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

/**
 * Upload a file to R2 from a remote URL.
 * Returns the public URL.
 */
export async function uploadToR2FromUrl(
  url: string,
  key: string,
  contentType?: string
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const type = contentType || res.headers.get("content-type") || "application/octet-stream";

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: type,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Upload a Buffer or stream directly.
 */
export async function uploadToR2(
  body: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}
