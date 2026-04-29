/* eslint-disable */
// Seed 50 Product Photoshoot templates: creates categories, inserts templates
// with server-only prompts, generates preview thumbnails via fal.ai, uploads
// to R2 and links the imageUrl. Idempotent — re-running skips templates that
// already have an imageUrl.
//
// Run: npx tsx scripts/seed-photoshoot-templates.ts

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
  // ─── STUDIO ───
  { slug: "ps-studio-01", name: "Clean White Platform",  category: "studio",
    prompt: "The product placed on a smooth white circular platform, clean white seamless studio backdrop, soft even lighting from above and sides, subtle reflection on the platform surface, professional product photography, sharp focus, high detail" },
  { slug: "ps-studio-02", name: "Grey Gradient",         category: "studio",
    prompt: "The product on a smooth matte surface, dark charcoal to light grey gradient backdrop, dramatic side lighting casting a soft shadow to the right, professional studio product photography, sharp focus, high detail" },
  { slug: "ps-studio-03", name: "Floating Shadow",       category: "studio",
    prompt: "The product floating slightly above a pure white surface with a soft diffused shadow directly below, bright clean studio lighting, minimalist product photography, sharp focus, high detail" },
  { slug: "ps-studio-04", name: "Beige Pedestal",        category: "studio",
    prompt: "The product on a smooth beige stone pedestal, warm neutral beige backdrop, soft warm studio lighting, subtle shadow on the pedestal, clean minimalist product photography, sharp focus, high detail" },
  { slug: "ps-studio-05", name: "Black Velvet",          category: "studio",
    prompt: "The product on a rich black velvet surface, dark moody studio backdrop with a single spotlight from above creating a dramatic glow around the product, luxury product photography, sharp focus, high detail" },
  { slug: "ps-studio-06", name: "Pastel Pink",           category: "studio",
    prompt: "The product on a smooth pastel pink surface, matching soft pink backdrop, gentle diffused lighting with no harsh shadows, feminine clean product photography, sharp focus, high detail" },
  { slug: "ps-studio-07", name: "Concrete Block",        category: "studio",
    prompt: "The product on a raw textured concrete block, neutral grey studio backdrop, directional side lighting creating depth and texture, modern industrial product photography, sharp focus, high detail" },
  { slug: "ps-studio-08", name: "Glass Surface Reflection", category: "studio",
    prompt: "The product on a glossy black glass surface with a clear mirror reflection below, dark studio backdrop, soft overhead lighting with subtle rim light around the product, sleek modern product photography, sharp focus, high detail" },
  { slug: "ps-studio-09", name: "Dual Tone Split",       category: "studio",
    prompt: "The product centered on a smooth surface where the backdrop splits vertically, left half warm cream and right half pure white, soft balanced studio lighting, modern clean product photography, sharp focus, high detail" },
  { slug: "ps-studio-10", name: "Textured Paper",        category: "studio",
    prompt: "The product on a sheet of natural brown kraft paper with soft crumples and texture, warm neutral studio backdrop, soft overhead lighting, organic minimalist product photography, sharp focus, high detail" },

  // ─── LIFESTYLE ───
  { slug: "ps-life-01", name: "Morning Kitchen Counter", category: "lifestyle",
    prompt: "The product on a white marble kitchen countertop, soft morning sunlight streaming through a window from the left casting warm diagonal light, blurred kitchen interior in the background, a small green plant and ceramic mug nearby, lifestyle product photography, warm tones, sharp focus" },
  { slug: "ps-life-02", name: "Cozy Living Room",        category: "lifestyle",
    prompt: "The product on a light oak wooden coffee table, cozy living room setting with a beige linen sofa in the background, soft afternoon light, a few books stacked nearby, warm inviting atmosphere, lifestyle product photography, shallow depth of field, sharp focus on product" },
  { slug: "ps-life-03", name: "Bathroom Shelf",          category: "lifestyle",
    prompt: "The product on a clean white floating shelf, sage green tiled bathroom wall behind, a beam of warm natural light from the side, small eucalyptus sprig nearby, fresh clean atmosphere, lifestyle product photography, sharp focus" },
  { slug: "ps-life-04", name: "Office Desk",             category: "lifestyle",
    prompt: "The product on a clean modern white desk, minimalist workspace setting, a closed laptop and small potted succulent in the background slightly blurred, soft natural light from a nearby window, professional lifestyle product photography, sharp focus on product" },
  { slug: "ps-life-05", name: "Bedside Table",           category: "lifestyle",
    prompt: "The product on a simple wooden bedside table, soft white bedding and pillows in the background slightly out of focus, warm bedside lamp glow, calm relaxing bedroom atmosphere, lifestyle product photography, shallow depth of field, sharp focus on product" },
  { slug: "ps-life-06", name: "Outdoor Café Table",      category: "lifestyle",
    prompt: "The product on a small round marble café table outdoors, blurred street scene with warm string lights in the background, golden hour sunlight, a small espresso cup nearby, European café atmosphere, lifestyle product photography, bokeh background, sharp focus on product" },
  { slug: "ps-life-07", name: "Gym Bench",               category: "lifestyle",
    prompt: "The product on a clean black gym bench surface, blurred gym equipment in the background, bright overhead gym lighting, a white towel folded nearby, active fitness lifestyle setting, product photography, sharp focus on product" },
  { slug: "ps-life-08", name: "Picnic Blanket",          category: "lifestyle",
    prompt: "The product on a classic red and white checkered picnic blanket on green grass, soft natural daylight filtering through nearby trees, a wicker basket edge visible, relaxed outdoor summer atmosphere, lifestyle product photography, sharp focus on product" },

  // ─── FOOD ───
  { slug: "ps-food-01", name: "Coffee Beans",            category: "food",
    prompt: "The product centered on a dark surface surrounded by a dense scatter of glossy dark roasted coffee beans, dark moody studio backdrop, warm directional lighting from the side, rich warm tones, food product photography, sharp focus, high detail" },
  { slug: "ps-food-02", name: "Fresh Citrus",            category: "food",
    prompt: "The product surrounded by fresh sliced oranges and lemons with green leaves scattered around, bright white surface, fresh vibrant overhead lighting, water droplets on the citrus slices, fresh energetic food product photography, sharp focus, high detail" },
  { slug: "ps-food-03", name: "Mint Leaves",             category: "food",
    prompt: "The product nestled in a dense bed of fresh bright green mint leaves with small water droplets, shot from directly above, bright clean lighting, fresh and natural atmosphere, food product photography, sharp focus, high detail" },
  { slug: "ps-food-04", name: "Honey Drip",              category: "food",
    prompt: "The product on a smooth warm surface with golden honey drizzled artfully around it, a wooden honey dipper nearby, warm amber tones, soft warm studio lighting, indulgent premium food product photography, sharp focus, high detail" },
  { slug: "ps-food-05", name: "Berries and Cream",       category: "food",
    prompt: "The product on a light marble surface surrounded by fresh strawberries, blueberries, and raspberries, a small splash of cream nearby, bright fresh lighting, vibrant colorful food product photography, sharp focus, high detail" },
  { slug: "ps-food-06", name: "Spice Market",            category: "food",
    prompt: "The product centered on a dark wooden surface surrounded by small piles of colorful ground spices, turmeric yellow, paprika red, cinnamon brown, a few whole star anise and cinnamon sticks, warm moody lighting, artisan food product photography, sharp focus, high detail" },
  { slug: "ps-food-07", name: "Ice and Water",           category: "food",
    prompt: "The product surrounded by crystal clear ice cubes and a splash of cold water droplets frozen in motion, cool blue-toned lighting, clean light grey backdrop, refreshing cold beverage product photography, sharp focus, high detail" },

  // ─── NATURE ───
  { slug: "ps-nat-01", name: "Beach Sand",               category: "nature",
    prompt: "The product resting on warm golden beach sand, shot from directly above, fine sand grains and tiny shells visible around the product, bright natural sunlight, warm coastal tones, outdoor product photography, sharp focus, high detail" },
  { slug: "ps-nat-02", name: "Rocky Shore",              category: "nature",
    prompt: "The product resting on a rugged textured rock ledge in the foreground, calm blue ocean and pale cloudy sky forming a clean horizon in the background, natural daylight, coastal outdoor product photography, sharp focus on product, blurred background" },
  { slug: "ps-nat-03", name: "Forest Floor",             category: "nature",
    prompt: "The product resting on a mossy forest floor surface, soft green ferns and small leaves surrounding it, dappled sunlight filtering through trees above, natural earthy green tones, organic outdoor product photography, sharp focus on product" },
  { slug: "ps-nat-04", name: "Flower Bed",               category: "nature",
    prompt: "The product nestled among blooming pink and white flowers with realistic petals filling the entire frame, shot from directly above, soft natural daylight, romantic floral product photography, sharp focus, high detail" },
  { slug: "ps-nat-05", name: "Desert Sand Dunes",        category: "nature",
    prompt: "The product resting on smooth golden desert sand, soft rolling sand dunes in the background under a clear warm sky, golden hour side lighting casting long shadows, warm desert tones, outdoor product photography, sharp focus on product" },
  { slug: "ps-nat-06", name: "Driftwood",                category: "nature",
    prompt: "The product resting on a piece of smooth weathered driftwood, neutral beige backdrop and surface, warm soft studio lighting, natural organic texture, minimalist nature-inspired product photography, sharp focus, high detail" },
  { slug: "ps-nat-07", name: "Tropical Leaves",          category: "nature",
    prompt: "The product placed on large dark green tropical monstera and palm leaves, bright natural overhead lighting, fresh vibrant green tones, water droplets on the leaves, tropical botanical product photography, sharp focus, high detail" },
  { slug: "ps-nat-08", name: "Volcanic Sand",            category: "nature",
    prompt: "The product resting on wet black volcanic sand at the water's edge, a thin wave of white sea foam curling around it, moody overcast natural lighting, dramatic dark tones, coastal product photography, sharp focus on product" },

  // ─── LUXURY ───
  { slug: "ps-lux-01", name: "Marble and Gold",          category: "luxury",
    prompt: "The product on a polished white marble surface with subtle grey veining, a thin gold-leaf accent strip nearby, clean white backdrop, soft warm studio lighting, luxury premium product photography, sharp focus, high detail" },
  { slug: "ps-lux-02", name: "Silk Fabric",              category: "luxury",
    prompt: "The product resting on soft flowing champagne-colored silk fabric with elegant folds and ripples, warm soft studio lighting creating gentle highlights on the silk, luxury premium product photography, sharp focus, high detail" },
  { slug: "ps-lux-03", name: "Dark Wood and Leather",    category: "luxury",
    prompt: "The product on a rich dark walnut wooden surface, a piece of premium brown leather visible nearby, warm dim studio lighting with a golden tone, sophisticated masculine luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-04", name: "Crystal and Glass",        category: "luxury",
    prompt: "The product surrounded by clear crystal prisms casting rainbow light refractions and caustic patterns on a white surface, bright clean studio lighting, artistic luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-05", name: "Terrazzo Surface",         category: "luxury",
    prompt: "The product on a smooth polished terrazzo surface with small stone chips visible in the material, warm beige arched backdrop, soft directional warm light, modern luxury product photography, sharp focus, high detail" },
  { slug: "ps-lux-06", name: "Rose Petals",              category: "luxury",
    prompt: "The product on a smooth cream surface surrounded by scattered soft pink and deep red rose petals, a few petals slightly curled, soft romantic studio lighting, luxury beauty product photography, sharp focus, high detail" },
  { slug: "ps-lux-07", name: "Smoke and Dark",           category: "luxury",
    prompt: "The product on a dark matte surface with thin wisps of white smoke rising gently around it, dark moody studio backdrop with a single spotlight from above, dramatic mysterious atmosphere, premium product photography, sharp focus, high detail" },

  // ─── SEASONAL ───
  { slug: "ps-season-01", name: "Winter Snow",           category: "seasonal",
    prompt: "The product nestled in a small mound of fresh fluffy snow, surrounded by evergreen fir branches and frosted pine cones, soft fake snowfall, cool grey blurred background, winter holiday product photography, sharp focus, high detail" },
  { slug: "ps-season-02", name: "Autumn Leaves",         category: "seasonal",
    prompt: "The product on a rustic wooden surface surrounded by scattered autumn leaves in warm orange, red, and golden yellow, a small cinnamon stick nearby, warm golden afternoon lighting, cozy fall seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-03", name: "Spring Garden",         category: "seasonal",
    prompt: "The product on a light wooden surface with delicate pink cherry blossom branches framing it from above, soft fresh spring daylight, a few fallen petals on the surface, light airy spring seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-04", name: "Summer Tropical",       category: "seasonal",
    prompt: "The product on a bright turquoise surface, a pair of sunglasses and a small seashell nearby, bright warm summer sunlight with hard shadows, vibrant saturated summer tones, fun playful summer seasonal product photography, sharp focus, high detail" },
  { slug: "ps-season-05", name: "Holiday Gift",          category: "seasonal",
    prompt: "The product on a white surface surrounded by elegant gold and red gift ribbons, a small wrapped present box nearby, warm festive lighting with subtle bokeh lights in the blurred background, holiday celebration product photography, sharp focus, high detail" },

  // ─── SURFACE ───
  { slug: "ps-surf-01", name: "Wet Stone",               category: "surface",
    prompt: "The product on a smooth wet dark grey stone surface with water droplets scattered around, dark studio backdrop, soft overhead lighting reflecting off the wet surface, clean textured product photography, sharp focus, high detail" },
  { slug: "ps-surf-02", name: "Linen Cloth",             category: "surface",
    prompt: "The product resting on a natural off-white linen cloth with soft wrinkles and texture, warm neutral backdrop, soft diffused studio lighting, organic minimalist product photography, sharp focus, high detail" },
  { slug: "ps-surf-03", name: "Terrazzo Tiles",          category: "surface",
    prompt: "The product on a colorful speckled terrazzo tile floor, shot from directly above, bright clean overhead lighting, playful modern surface texture, graphic product photography, sharp focus, high detail" },
  { slug: "ps-surf-04", name: "Colored Powder",          category: "surface",
    prompt: "The product centered with a burst of fine colored powder in soft pastels exploding outward around it, clean white studio backdrop, bright flash lighting freezing the powder in motion, dynamic energetic product photography, sharp focus, high detail" },
  { slug: "ps-surf-05", name: "Water Surface",           category: "surface",
    prompt: "The product floating on a calm clear water surface with gentle ripples radiating outward, soft blue-toned lighting, clean light backdrop visible through the water, serene minimal product photography, sharp focus, high detail" },
];

const CATEGORY_NAMES: Record<string, string> = {
  studio: "Studio",
  lifestyle: "Lifestyle",
  food: "Food & Beverage",
  nature: "Nature",
  luxury: "Luxury",
  seasonal: "Seasonal",
  surface: "Surface",
};

// Replace "The product" with a category-appropriate generic placeholder so
// flux renders a coherent scene with something visible in frame. We bias each
// category toward a likely real-world product so previews communicate the use
// case instead of looking empty.
// Rotating list of realistic, premium-looking placeholder products. We pick
// one per template (deterministic by index) so the library feels varied and
// each preview looks like a polished commercial shot — labels and packaging
// rendered fully so the user can imagine their own product in that scene.
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
  const list =
    PLACEHOLDERS_BY_CATEGORY[category] ||
    ["a polished premium consumer product with a clean realistic label"];
  const placeholder = list[index % list.length];
  return p.replace(/^The product\s/, `${placeholder} `);
}

async function ensureCategory(slug: string, sortOrder: number) {
  const existing = await prisma.photoshootCategory.findFirst({ where: { slug } });
  if (existing) return existing;
  return prisma.photoshootCategory.create({
    data: { name: CATEGORY_NAMES[slug] || slug, slug, sortOrder },
  });
}

async function uploadImage(buffer: Buffer, key: string) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: "image/jpeg" }));
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
  // Categories
  const cats = ["studio", "lifestyle", "food", "nature", "luxury", "seasonal", "surface"];
  const catRecords: Record<string, string> = {};
  for (let i = 0; i < cats.length; i++) {
    const c = await ensureCategory(cats[i], i);
    catRecords[c.slug] = c.id;
  }

  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i];
    const catId = catRecords[t.category];
    if (!catId) {
      console.warn(`! unknown category ${t.category} for ${t.slug}, skipping`);
      continue;
    }

    // Upsert template — match by name + category
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
          sortOrder: i,
        },
      });
    } else {
      tpl = await prisma.photoshootTemplate.update({
        where: { id: tpl.id },
        data: { prompt: t.prompt, sortOrder: i, active: true },
      });
    }

    const force = process.argv.includes("--force");
    if (tpl.imageUrl && tpl.imageUrl.startsWith("http") && !force) {
      console.log(`· ${t.name} — already has preview, skipping (use --force to regen)`);
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
