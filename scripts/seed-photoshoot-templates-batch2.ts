/* eslint-disable */
// Batch 2: 50 more Product Photoshoot templates across the existing 7
// categories. Generates preview thumbnails via fal.ai (flux/schnell) and
// uploads them to R2. Idempotent — re-running skips templates that already
// have a preview unless --force is passed.
//
// Run: npx tsx scripts/seed-photoshoot-templates-batch2.ts

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

type T = { slug: string; name: string; category: string; prompt: string };

const TEMPLATES: T[] = [
  // ─── STUDIO (10 more) ───
  { slug: "ps-studio-11", name: "Soft Sage", category: "studio",
    prompt: "The product on a smooth pale sage green surface, matching sage backdrop, gentle diffused lighting, calm minimalist product photography, sharp focus, high detail" },
  { slug: "ps-studio-12", name: "Warm Terracotta", category: "studio",
    prompt: "The product on a smooth terracotta clay surface, warm orange backdrop, soft directional lighting, earthy modern product photography, sharp focus, high detail" },
  { slug: "ps-studio-13", name: "Sky Blue Gradient", category: "studio",
    prompt: "The product on a smooth surface with a soft sky blue to white gradient backdrop, bright clean studio lighting, fresh modern product photography, sharp focus, high detail" },
  { slug: "ps-studio-14", name: "Brushed Steel", category: "studio",
    prompt: "The product on a brushed stainless steel surface with subtle linear texture, dark grey backdrop, cool dramatic lighting, sleek industrial product photography, sharp focus, high detail" },
  { slug: "ps-studio-15", name: "Sunset Glow", category: "studio",
    prompt: "The product on a smooth surface bathed in warm orange and pink sunset gradient lighting, soft warm backdrop, dreamy product photography, sharp focus, high detail" },
  { slug: "ps-studio-16", name: "Mint Studio", category: "studio",
    prompt: "The product on a soft mint green pedestal, matching pastel mint backdrop, bright even studio lighting, fresh clean cosmetic-style product photography, sharp focus, high detail" },
  { slug: "ps-studio-17", name: "Lavender Mist", category: "studio",
    prompt: "The product on a smooth lavender surface with a faint atmospheric haze, soft lavender to white backdrop, dreamy diffused lighting, ethereal product photography, sharp focus, high detail" },
  { slug: "ps-studio-18", name: "Deep Navy", category: "studio",
    prompt: "The product on a smooth deep navy surface, dark navy backdrop, dramatic side spotlight from the right with a soft rim light, premium nighttime product photography, sharp focus, high detail" },
  { slug: "ps-studio-19", name: "Acrylic Pedestal", category: "studio",
    prompt: "The product on a clear transparent acrylic pedestal with subtle highlights, light grey backdrop, clean modern lighting, contemporary product photography, sharp focus, high detail" },
  { slug: "ps-studio-20", name: "Striped Backdrop", category: "studio",
    prompt: "The product on a smooth surface in front of soft horizontal cream and beige stripes, warm even lighting, retro-modern editorial product photography, sharp focus, high detail" },

  // ─── LIFESTYLE (8 more) ───
  { slug: "ps-life-09", name: "Vanity Counter", category: "lifestyle",
    prompt: "The product on a clean white bathroom vanity counter, a folded white towel and small ceramic dish nearby, soft morning bathroom light through frosted glass, fresh clean lifestyle product photography, sharp focus on product" },
  { slug: "ps-life-10", name: "Reading Nook", category: "lifestyle",
    prompt: "The product on a small wooden side table next to an open book and a steaming ceramic mug, cozy reading nook with soft window light, warm relaxed atmosphere, lifestyle product photography, shallow depth of field, sharp focus on product" },
  { slug: "ps-life-11", name: "Yoga Mat", category: "lifestyle",
    prompt: "The product on the corner of a charcoal grey yoga mat on a light wooden floor, a rolled towel and water bottle slightly out of focus nearby, soft natural morning light, calm wellness lifestyle product photography, sharp focus on product" },
  { slug: "ps-life-12", name: "Travel Suitcase", category: "lifestyle",
    prompt: "The product placed on top of a soft beige open suitcase showing folded linen clothes, warm afternoon hotel room light, travel lifestyle product photography, shallow depth of field, sharp focus on product" },
  { slug: "ps-life-13", name: "Pet Corner", category: "lifestyle",
    prompt: "The product on a clean light wooden floor next to a soft pet bed and a small ceramic water bowl, soft natural daylight, warm pet-friendly lifestyle product photography, blurred background, sharp focus on product" },
  { slug: "ps-life-14", name: "Garden Patio", category: "lifestyle",
    prompt: "The product on a small outdoor wooden patio table, blurred green garden plants in the background, dappled afternoon sunlight, fresh outdoor lifestyle product photography, sharp focus on product" },
  { slug: "ps-life-15", name: "Window Sill", category: "lifestyle",
    prompt: "The product on a bright window sill with sheer white curtains gently filtering light, a small potted plant nearby, soft golden hour glow, calm minimal lifestyle product photography, sharp focus on product" },
  { slug: "ps-life-16", name: "Studio Loft", category: "lifestyle",
    prompt: "The product on a polished concrete floor of a sunlit modern loft, exposed brick wall and a large window in the soft blurred background, urban lifestyle product photography, sharp focus on product" },

  // ─── FOOD & BEVERAGE (7 more) ───
  { slug: "ps-food-08", name: "Cocoa Powder", category: "food",
    prompt: "The product on a dark surface lightly dusted with cocoa powder, a few cacao nibs scattered around, warm low-key lighting, indulgent rich food product photography, sharp focus, high detail" },
  { slug: "ps-food-09", name: "Wheat Field", category: "food",
    prompt: "The product on a rustic wooden surface surrounded by golden wheat stalks and a few raw grains, warm natural lighting, artisan grain food product photography, sharp focus, high detail" },
  { slug: "ps-food-10", name: "Chili Heat", category: "food",
    prompt: "The product on a dark slate surface surrounded by red chili peppers and dried chili flakes, warm dramatic side lighting, bold spicy food product photography, sharp focus, high detail" },
  { slug: "ps-food-11", name: "Vanilla and Cream", category: "food",
    prompt: "The product on a soft cream surface with vanilla pods and a small swirl of cream nearby, warm soft lighting, indulgent dessert-inspired food product photography, sharp focus, high detail" },
  { slug: "ps-food-12", name: "Tea Garden", category: "food",
    prompt: "The product on a stone surface surrounded by loose green tea leaves and a small ceramic teacup, soft natural light, calm artisan tea food product photography, sharp focus, high detail" },
  { slug: "ps-food-13", name: "Tropical Fruit Mix", category: "food",
    prompt: "The product on a bright surface surrounded by sliced mango, kiwi, and passionfruit with vibrant colors, fresh overhead lighting, energetic tropical food product photography, sharp focus, high detail" },
  { slug: "ps-food-14", name: "Whipped Foam", category: "food",
    prompt: "The product on a clean white surface with light foam swirls and bubbles around it, a small splash visible, bright fresh lighting, refreshing beverage food product photography, sharp focus, high detail" },

  // ─── NATURE (8 more) ───
  { slug: "ps-nat-09", name: "Pine Forest", category: "nature",
    prompt: "The product resting on a soft bed of pine needles surrounded by tall pine trees in a soft blurred background, dappled forest light, cool earthy tones, outdoor nature product photography, sharp focus on product" },
  { slug: "ps-nat-10", name: "Mountain View", category: "nature",
    prompt: "The product resting on a flat stone in the foreground with majestic snow-capped mountains in the soft blurred background, clear daylight, dramatic outdoor product photography, sharp focus on product" },
  { slug: "ps-nat-11", name: "Lavender Field", category: "nature",
    prompt: "The product resting among rows of soft purple lavender stalks, warm golden hour light, dreamy floral outdoor product photography, sharp focus on product, blurred background" },
  { slug: "ps-nat-12", name: "Misty Meadow", category: "nature",
    prompt: "The product resting on a smooth stone in a cool misty green meadow at dawn, soft fog rolling through grass, ethereal natural lighting, atmospheric outdoor product photography, sharp focus on product" },
  { slug: "ps-nat-13", name: "Riverbed Pebbles", category: "nature",
    prompt: "The product resting on smooth river pebbles next to a clear flowing stream, dappled natural light through trees, fresh outdoor nature product photography, sharp focus on product" },
  { slug: "ps-nat-14", name: "Autumn Path", category: "nature",
    prompt: "The product resting on a path of fallen autumn leaves in oranges and reds, warm afternoon woodland light, cozy seasonal outdoor product photography, sharp focus on product" },
  { slug: "ps-nat-15", name: "Bamboo Grove", category: "nature",
    prompt: "The product on a bamboo cutting board surrounded by tall green bamboo stalks in a soft blurred background, fresh diffused natural light, zen botanical product photography, sharp focus on product" },
  { slug: "ps-nat-16", name: "Wildflower Meadow", category: "nature",
    prompt: "The product nestled among soft wildflowers in white, yellow, and lavender, soft natural daylight filtering through tall grass, fresh romantic outdoor product photography, sharp focus on product, blurred background" },

  // ─── LUXURY (7 more) ───
  { slug: "ps-lux-08", name: "Champagne Pour", category: "luxury",
    prompt: "The product on a polished surface with a glass of champagne softly splashing nearby, warm gold tones, decadent celebratory luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-09", name: "Velvet Burgundy", category: "luxury",
    prompt: "The product resting on rich burgundy velvet fabric with elegant folds, dark moody backdrop, warm spotlight from above, opulent luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-10", name: "Pearl Cluster", category: "luxury",
    prompt: "The product on a smooth cream surface surrounded by lustrous white pearls in elegant clusters, soft warm studio lighting, refined feminine luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-11", name: "Black Marble", category: "luxury",
    prompt: "The product on a polished black marble surface with white veining, dark dramatic backdrop, soft directional lighting with rim highlight, premium nighttime luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-12", name: "Gold Foil", category: "luxury",
    prompt: "The product on a textured gold foil surface with subtle creases catching light, warm metallic backdrop, glamorous luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-13", name: "Mirror Reflection", category: "luxury",
    prompt: "The product centered on a polished mirrored surface creating a perfect symmetric reflection, dark luxe backdrop, dramatic top-down lighting, editorial luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-14", name: "Onyx and Brass", category: "luxury",
    prompt: "The product on a polished onyx black surface with a thin brushed brass accent line, dark luxe backdrop, warm dim spotlight, sophisticated masculine luxury product photography, sharp focus, high detail" },

  // ─── SEASONAL (5 more) ───
  { slug: "ps-season-06", name: "Valentine Romance", category: "seasonal",
    prompt: "The product on a smooth blush pink surface surrounded by a few small red hearts and rose petals, soft warm romantic lighting, elegant valentine seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-07", name: "Halloween Pumpkins", category: "seasonal",
    prompt: "The product on a rustic wooden surface beside small orange pumpkins and dried autumn leaves, warm moody candlelit lighting, cozy halloween seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-08", name: "Easter Pastels", category: "seasonal",
    prompt: "The product on a soft pastel mint surface with a few decorated pastel eggs and small spring flowers nearby, bright fresh light, cheerful easter seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-09", name: "Lunar New Year", category: "seasonal",
    prompt: "The product on a deep red surface with subtle gold cherry blossom branches and a small gold envelope nearby, warm festive lighting, elegant lunar new year seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-10", name: "Back to School", category: "seasonal",
    prompt: "The product on a wooden desk surface with a few sharpened pencils, a small stack of notebooks and an apple nearby, warm afternoon lighting, fresh back-to-school seasonal product photography, sharp focus, high detail" },

  // ─── SURFACE (5 more) ───
  { slug: "ps-surf-06", name: "Cracked Earth", category: "surface",
    prompt: "The product on a dry cracked earth surface in warm desert tones, soft warm directional light, raw textured earthy product photography, sharp focus, high detail" },
  { slug: "ps-surf-07", name: "Velvet Texture", category: "surface",
    prompt: "The product on rich deep emerald velvet fabric with soft texture and subtle folds, dark luxe lighting, lush textural product photography, sharp focus, high detail" },
  { slug: "ps-surf-08", name: "Iridescent Pearl", category: "surface",
    prompt: "The product on a smooth iridescent pearl surface shifting through soft pastel rainbow hues, bright clean studio lighting, dreamy futuristic product photography, sharp focus, high detail" },
  { slug: "ps-surf-09", name: "Soap Bubbles", category: "surface",
    prompt: "The product surrounded by clusters of clear soap bubbles with gentle iridescent reflections, bright clean lighting, fresh playful textural product photography, sharp focus, high detail" },
  { slug: "ps-surf-10", name: "Liquid Ripples", category: "surface",
    prompt: "The product partially submerged in a thin layer of clear liquid with subtle concentric ripples around it, cool blue lighting, sleek minimal textural product photography, sharp focus, high detail" },
];

const PLACEHOLDERS_BY_CATEGORY: Record<string, string[]> = {
  studio: [
    "a premium pastel-green multivitamin supplement bottle with a clean minimalist label and subtle wordmark",
    "a sleek matte white skincare serum bottle with a black dropper and minimalist sans-serif label",
    "a frosted glass face cream jar with a brushed gold lid and elegant typographic label",
    "a slim ceramic body lotion bottle with a subtle pastel label and modern wordmark",
  ],
  lifestyle: [
    "an amber glass essential oil bottle with a wooden cap and small kraft-paper label",
    "a tall iced matcha latte can with a soft pastel green label and modern wordmark",
    "a premium roasted coffee bag with a kraft body and matte black label",
    "a small artisan candle in a frosted glass tumbler with a typographic linen label",
  ],
  food: [
    "a small artisan honey jar with a paper lid wrap and vintage-style label",
    "a premium specialty coffee bag with a matte black foil label and crisp wordmark",
    "a clear glass cold-pressed juice bottle with a pastel label and minimalist branding",
    "a craft chocolate bar wrapped in textured kraft paper with a clean serif label",
  ],
  nature: [
    "an apothecary-style brown amber tincture bottle with a wooden dropper and kraft label",
    "a small glass jar of organic skincare balm with a wooden lid and earthy typographic label",
    "a slim aluminium reusable water bottle with a powder-coated matte sage finish and minimalist wordmark",
    "a kraft paper bag of artisan loose-leaf tea with a botanical illustration label",
  ],
  luxury: [
    "a heavy frosted glass premium perfume bottle with a metallic gold cap and engraved minimalist wordmark",
    "a sculptural deep emerald glass eau de parfum bottle with a faceted gold collar",
    "a slim onyx-black mascara tube with subtle gold typographic branding",
    "a clear faceted crystal-style cologne bottle with a sleek silver cap",
  ],
  seasonal: [
    "a small white cosmetic jar with a festive gold label and elegant serif wordmark",
    "a holiday-edition candle in a deep red glass tumbler with a minimal foil label",
    "a slim winter-edition lip balm tube with a snow-white matte body and subtle silver wordmark",
    "a premium gift-edition body cream jar with a soft pearl-finish lid and tasteful seasonal label",
  ],
  surface: [
    "a sleek cylindrical matte white skincare bottle with a chrome pump and subtle minimalist label",
    "a slim aluminium body lotion tube with a pastel finish and clean modern wordmark",
    "a tall frosted glass conditioner bottle with a brushed silver cap and minimalist sans-serif label",
    "a soft-touch matte cosmetic jar with a chrome rim and crisp typographic branding",
  ],
};

function previewPrompt(p: string, category: string, index: number) {
  const list = PLACEHOLDERS_BY_CATEGORY[category] || [
    "a polished premium consumer product with a clean realistic label",
  ];
  const placeholder = list[index % list.length];
  return p.replace(/^The product\s/, `${placeholder} `);
}

async function uploadImage(buffer: Buffer, key: string) {
  await r2.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: "image/jpeg" }),
  );
  return `${PUBLIC_URL}/${key}`;
}

async function generatePreview(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: "square_hd",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    },
  });
  const data = result.data as { images?: { url?: string }[] };
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error("No image returned from flux/schnell");
  return url;
}

async function main() {
  // Look up existing categories — they were created in batch 1
  const cats = await prisma.photoshootCategory.findMany();
  const catMap: Record<string, string> = {};
  for (const c of cats) catMap[c.slug] = c.id;

  const force = process.argv.includes("--force");
  // Continue sortOrder from last existing
  const last = await prisma.photoshootTemplate.findFirst({
    orderBy: { sortOrder: "desc" },
  });
  let nextSort = (last?.sortOrder ?? -1) + 1;

  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i];
    const catId = catMap[t.category];
    if (!catId) {
      console.warn(`! unknown category ${t.category} for ${t.slug}`);
      continue;
    }

    let tpl = await prisma.photoshootTemplate.findFirst({
      where: { name: t.name, categoryId: catId },
    });
    if (!tpl) {
      tpl = await prisma.photoshootTemplate.create({
        data: {
          name: t.name,
          imageUrl: "",
          prompt: t.prompt,
          categoryId: catId,
          sortOrder: nextSort++,
        },
      });
    } else {
      tpl = await prisma.photoshootTemplate.update({
        where: { id: tpl.id },
        data: { prompt: t.prompt, active: true },
      });
    }

    if (tpl.imageUrl && tpl.imageUrl.startsWith("http") && !force) {
      console.log(`· ${t.name} — already has preview, skipping`);
      continue;
    }

    try {
      console.log(`→ ${t.name} (${t.category})`);
      const generatedUrl = await generatePreview(previewPrompt(t.prompt, t.category, i));
      const res = await fetch(generatedUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const r2Url = await uploadImage(buffer, `photoshoot-templates/${t.slug}.jpg`);
      await prisma.photoshootTemplate.update({
        where: { id: tpl.id },
        data: { imageUrl: r2Url },
      });
      console.log(`  ✓ ${r2Url}`);
    } catch (e) {
      console.error(`  ✗ ${t.name}:`, e instanceof Error ? e.message : e);
    }
  }

  const total = await prisma.photoshootTemplate.count({ where: { active: true } });
  console.log(`\nDone. Active templates: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
