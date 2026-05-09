/* eslint-disable */
// Converts model logo images + nano banana SVG → WebP for public/models/
// Run: npx tsx scripts/convert-model-logos.ts

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(process.cwd());
const MODELS_DIR = path.join(ROOT, "public", "models");

const conversions = [
  // existing model logos
  { src: path.join(MODELS_DIR, "seedream-4-5.jpg"),   dest: path.join(MODELS_DIR, "seedream-4-5.webp") },
  { src: path.join(MODELS_DIR, "seedream-5-lite.png"), dest: path.join(MODELS_DIR, "seedream-5-lite.webp") },
  { src: path.join(MODELS_DIR, "flux-2-pro.jpg"),      dest: path.join(MODELS_DIR, "flux-2-pro.webp") },
  { src: path.join(MODELS_DIR, "gpt-image-2.png"),     dest: path.join(MODELS_DIR, "gpt-image-2.webp") },
  { src: path.join(MODELS_DIR, "kling-3.jpg"),         dest: path.join(MODELS_DIR, "kling-3.webp") },
  // nano banana SVG → WebP (rasterise at 128×128)
  { src: path.join(ROOT, "nano banana.svg"),           dest: path.join(MODELS_DIR, "nano-banana-2.webp"), size: 128 },
];

async function main() {
  for (const c of conversions) {
    if (!fs.existsSync(c.src)) { console.log(`  · ${path.basename(c.src)} — not found, skipping`); continue; }
    process.stdout.write(`  → ${path.basename(c.src)} ... `);
    try {
      let pipeline = sharp(c.src, { density: 144 });
      if (c.size) pipeline = pipeline.resize(c.size, c.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
      await pipeline.webp({ quality: 90 }).toFile(c.dest);
      const size = Math.round(fs.statSync(c.dest).size / 1024);
      console.log(`✓ ${size}KB → ${path.basename(c.dest)}`);
    } catch (e) {
      console.log(`✗ ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log("\nDone.");
}

main().catch(console.error);
