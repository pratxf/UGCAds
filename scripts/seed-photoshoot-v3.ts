/* eslint-disable */
// Seed 150 Product Photoshoot templates across 15 categories.
// Generates preview images via OpenAI gpt-image-2, uploads to R2, seeds DB.
// Idempotent — skips templates that already have an imageUrl (use --force to regen).
//
// Run: npx tsx scripts/seed-photoshoot-v3.ts <OPENAI_API_KEY>

import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const OPENAI_KEY = process.argv[2] || process.env.OPENAI_KEY || "";
if (!OPENAI_KEY) {
  console.error("Pass the OpenAI API key as the first argument.");
  process.exit(1);
}

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

// ─── Categories ──────────────────────────────────────────────────────────────

interface Category {
  slug: string;
  name: string;
  tempProduct: string;
}

const CATEGORIES: Category[] = [
  {
    slug: "studio",
    name: "Studio",
    tempProduct: "a sleek matte black glass perfume bottle with a brushed gold cap and minimal engraved wordmark",
  },
  {
    slug: "luxury",
    name: "Luxury",
    tempProduct: "a sculptural frosted crystal eau de parfum bottle with a faceted body and gold collar",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    tempProduct: "a premium amber glass face serum bottle with a glass dropper and clean botanical label",
  },
  {
    slug: "minimalist",
    name: "Minimalist",
    tempProduct: "a clean matte white moisturizer jar with a brushed silver lid and minimal typographic label",
  },
  {
    slug: "nature-organic",
    name: "Nature / Organic",
    tempProduct: "a small amber glass jar of organic rosehip face oil with a wooden cap and botanical kraft label",
  },
  {
    slug: "floating-3d",
    name: "Floating / 3D",
    tempProduct: "a sleek cobalt blue glass face serum bottle with a brushed metallic dropper cap",
  },
  {
    slug: "macro",
    name: "Macro",
    tempProduct: "a premium matte black cologne bottle with an engraved silver wordmark and faceted glass base",
  },
  {
    slug: "flat-lay",
    name: "Flat Lay",
    tempProduct: "a pastel pink tinted lip treatment in a small glass pot with a gold lid and minimal label",
  },
  {
    slug: "dark-moody",
    name: "Dark Moody",
    tempProduct: "a deep emerald glass eau de parfum bottle with gold hardware and an embossed luxury label",
  },
  {
    slug: "colorful-pop",
    name: "Colorful Pop Art",
    tempProduct: "a bright yellow vitamin supplement bottle with a bold uppercase modern label",
  },
  {
    slug: "seasonal",
    name: "Seasonal",
    tempProduct: "a limited-edition holiday body butter in a frosted glass jar with a festive ribbon label",
  },
  {
    slug: "ecommerce-white",
    name: "E-commerce White",
    tempProduct: "a professional white pump skincare serum bottle with a clean minimal label",
  },
  {
    slug: "hero-banner",
    name: "Hero Banner",
    tempProduct: "a premium anti-aging face cream in a transparent glass jar with a platinum silver lid",
  },
  {
    slug: "ingredient-based",
    name: "Ingredient-Based",
    tempProduct: "a natural botanical face oil in an amber glass dropper bottle with a hand-drawn herb label",
  },
  {
    slug: "tech-futuristic",
    name: "Tech / Futuristic",
    tempProduct: "a sleek matte gunmetal smart skincare device with a subtle glowing LED ring and futuristic minimal logo",
  },
];

// ─── Prompts ─────────────────────────────────────────────────────────────────

interface Template {
  slug: string;
  name: string;
  categorySlug: string;
  prompt: string;
}

const TEMPLATES: Template[] = [
  // ── 1. Studio ──────────────────────────────────────────────────────────────
  { slug: "v3-studio-01", name: "Warm Beige Softbox", categorySlug: "studio",
    prompt: "High-end studio product photo of [product], centered on a seamless warm beige background, eye-level front angle, large softbox lighting from the left, subtle fill light from the right, realistic contact shadow, crisp edges, sharp focus, premium e-commerce catalog photography, 85mm lens, ultra-realistic." },
  { slug: "v3-studio-02", name: "Matte Ivory Surface", categorySlug: "studio",
    prompt: "Professional studio photoshoot of [product], placed upright in the center on a smooth matte ivory surface, seamless ivory backdrop, clean softbox lighting, balanced exposure, natural reflections, realistic shadows, highly detailed commercial product photography." },
  { slug: "v3-studio-03", name: "Pastel Blue Backdrop", categorySlug: "studio",
    prompt: "Clean studio product image of [product], centered against a seamless pastel blue background, front-facing composition, soft diffused lighting, realistic product texture, accurate colors, gentle shadow under the product, high-resolution retail photography." },
  { slug: "v3-studio-04", name: "Light Gray Gradient", categorySlug: "studio",
    prompt: "Premium product photography of [product], positioned slightly above center on a seamless light gray background, soft gradient lighting, realistic shadow, crisp silhouette, accurate label visibility, polished commercial studio look." },
  { slug: "v3-studio-05", name: "Smooth Cream", categorySlug: "studio",
    prompt: "Luxury studio product shot of [product], centered on a smooth cream background, 85mm lens perspective, softbox lighting, subtle highlights, realistic surface shadow, sharp focus, minimal premium advertising style." },
  { slug: "v3-studio-06", name: "Matte Mint Green", categorySlug: "studio",
    prompt: "Modern studio product photography of [product], placed on a matte mint green backdrop, clean centered composition, diffused soft lighting, soft realistic shadow, crisp product details, premium commercial catalog image." },
  { slug: "v3-studio-07", name: "Charcoal Gray", categorySlug: "studio",
    prompt: "Professional product portrait of [product], seamless charcoal gray background, centered upright placement, dramatic but soft studio lighting, controlled highlights, realistic texture, clean luxury retail photography." },
  { slug: "v3-studio-08", name: "Blush Pink", categorySlug: "studio",
    prompt: "High-resolution studio product shot of [product], centered on a blush pink background, softbox lighting from above and front, realistic shadows, sharp focus, clean product edges, premium brand campaign photography." },
  { slug: "v3-studio-09", name: "Pure White", categorySlug: "studio",
    prompt: "Minimal studio catalog photo of [product], pure white seamless background, centered composition, evenly lit, soft gray contact shadow, realistic proportions, crisp details, clean marketplace-ready product photography." },
  { slug: "v3-studio-10", name: "Soft Lavender", categorySlug: "studio",
    prompt: "Premium commercial studio photo of [product], centered on a soft lavender background, smooth lighting gradient, professional softbox setup, realistic shadow and highlights, sharp focus, luxury e-commerce photography." },

  // ── 2. Luxury ──────────────────────────────────────────────────────────────
  { slug: "v3-luxury-01", name: "White Marble", categorySlug: "luxury",
    prompt: "Luxury product photoshoot of [product], placed on polished white marble, elegant centered composition, glossy reflections, dramatic soft lighting, subtle golden highlights, premium editorial advertising style, high contrast, ultra-realistic." },
  { slug: "v3-luxury-02", name: "Black Marble Gold", categorySlug: "luxury",
    prompt: "Premium luxury photo of [product], positioned on black marble with gold metallic accents, cinematic side lighting, deep shadows, glossy reflection beneath the product, sophisticated high-end commercial photography." },
  { slug: "v3-luxury-03", name: "Cream Marble Silk", categorySlug: "luxury",
    prompt: "High-end editorial product image of [product], placed on cream marble with soft ivory silk fabric, warm dramatic lighting, refined shadows, realistic reflections, luxury magazine campaign style." },
  { slug: "v3-luxury-04", name: "Dark Reflective Glass", categorySlug: "luxury",
    prompt: "Luxury product photography of [product], displayed on a dark reflective glass surface, black gradient background, elegant rim lighting, controlled highlights, premium high-contrast advertising look." },
  { slug: "v3-luxury-05", name: "Beige Marble Champagne", categorySlug: "luxury",
    prompt: "Premium commercial photoshoot of [product], placed on beige marble with champagne-toned reflections, dramatic softbox lighting, elegant composition, refined luxury brand atmosphere, ultra-realistic details." },
  { slug: "v3-luxury-06", name: "Satin Marble Gold", categorySlug: "luxury",
    prompt: "Luxury brand campaign image of [product], styled with satin fabric, marble surface, and subtle gold accents, soft cinematic lighting, polished reflections, deep contrast, premium editorial photography." },
  { slug: "v3-luxury-07", name: "Marble Pedestal Dark", categorySlug: "luxury",
    prompt: "High-fashion luxury product shot of [product], placed on a marble pedestal, dark moody background, warm spotlight, elegant reflections, refined shadows, ultra-realistic premium advertising style." },
  { slug: "v3-luxury-08", name: "Black Glass Gold Rim", categorySlug: "luxury",
    prompt: "Premium luxury product photo of [product], positioned on black glass, gold rim lighting, glossy surface reflection, rich cinematic shadows, sophisticated editorial composition, high-end commercial photography." },
  { slug: "v3-luxury-09", name: "White Marble Silk Gold", categorySlug: "luxury",
    prompt: "Elegant luxury photoshoot of [product], placed on white marble with folded silk fabric, soft golden lighting, realistic glossy texture, premium skincare advertising aesthetic." },
  { slug: "v3-luxury-10", name: "Marble Deep Contrast", categorySlug: "luxury",
    prompt: "Luxury advertising image of [product], dramatic composition on marble surface, deep contrast, soft directional highlights, realistic shadow, glossy reflection, refined premium editorial product photography." },

  // ── 3. Lifestyle ───────────────────────────────────────────────────────────
  { slug: "v3-life-01", name: "Modern Living Room", categorySlug: "lifestyle",
    prompt: "Lifestyle photoshoot of [product] being used in a modern apartment living room, natural window light, realistic interior decor, candid composition, warm shadows, premium lifestyle brand campaign photography." },
  { slug: "v3-life-02", name: "Home Office Desk", categorySlug: "lifestyle",
    prompt: "Lifestyle product photography of [product], placed on a clean wooden desk in a bright home office, laptop and notebook nearby, natural daylight, realistic workspace setting, premium commercial lifestyle image." },
  { slug: "v3-life-03", name: "Morning Kitchen", categorySlug: "lifestyle",
    prompt: "Candid lifestyle image of [product] being used in a modern kitchen, soft morning sunlight, realistic countertop props, warm home atmosphere, natural shadows, premium brand storytelling photography." },
  { slug: "v3-life-04", name: "Minimalist Bathroom", categorySlug: "lifestyle",
    prompt: "Lifestyle photoshoot of [product] in a minimalist bathroom, clean tiles, soft towels, natural window light, realistic daily-use environment, premium wellness and personal care campaign style." },
  { slug: "v3-life-05", name: "Outdoor Cafe Table", categorySlug: "lifestyle",
    prompt: "Premium lifestyle product image of [product], placed on an outdoor cafe table, urban background softly blurred, warm natural sunlight, candid realistic composition, modern commercial campaign look." },
  { slug: "v3-life-06", name: "Cozy Bedside Table", categorySlug: "lifestyle",
    prompt: "Lifestyle product campaign photo of [product], placed on a bedside table in a cozy bedroom, warm daylight, linen sheets, realistic home environment, calm premium brand aesthetic." },
  { slug: "v3-life-07", name: "Bright Fitness Studio", categorySlug: "lifestyle",
    prompt: "Modern lifestyle photoshoot of [product] in a bright fitness studio, clean background, natural daylight, active lifestyle mood, realistic environment, premium health and wellness commercial photography." },
  { slug: "v3-life-08", name: "Stylish Workspace", categorySlug: "lifestyle",
    prompt: "Lifestyle photography of [product] in a stylish workspace, clean desk setup, soft daylight, realistic props, shallow depth of field, premium modern productivity brand aesthetic." },
  { slug: "v3-life-09", name: "Luxury Hotel Bathroom", categorySlug: "lifestyle",
    prompt: "Candid lifestyle photo of [product] in a luxury hotel bathroom, marble counter, soft natural lighting, elegant environment, realistic use case, premium commercial photography." },
  { slug: "v3-life-10", name: "Morning Routine", categorySlug: "lifestyle",
    prompt: "Lifestyle photoshoot of [product] during a morning routine in a modern home, warm sunlight, natural hand interaction, realistic composition, premium brand campaign storytelling." },

  // ── 4. Minimalist ──────────────────────────────────────────────────────────
  { slug: "v3-min-01", name: "Warm Beige Scandinavian", categorySlug: "minimalist",
    prompt: "Minimalist product photography of [product], simple centered composition on a warm beige background, soft natural shadows, Scandinavian aesthetic, clean negative space, high-resolution commercial photo." },
  { slug: "v3-min-02", name: "Off-White Matte", categorySlug: "minimalist",
    prompt: "Clean minimalist product shot of [product], placed on an off-white matte surface, neutral background, soft daylight from the left, subtle contact shadow, calm premium brand aesthetic." },
  { slug: "v3-min-03", name: "Pale Gray Backdrop", categorySlug: "minimalist",
    prompt: "Minimalist commercial photo of [product], centered on a pale gray backdrop, uncluttered layout, gentle natural shadows, accurate product texture, modern Scandinavian product photography." },
  { slug: "v3-min-04", name: "Cream Diffused Light", categorySlug: "minimalist",
    prompt: "Modern minimalist product photography of [product], placed against a smooth cream background, diffused daylight, refined composition, soft shadow, premium commercial finish." },
  { slug: "v3-min-05", name: "Neutral Taupe", categorySlug: "minimalist",
    prompt: "Minimalist product image of [product], neutral taupe backdrop, large negative space, soft shadows, clean premium branding style, high-resolution advertising photography." },
  { slug: "v3-min-06", name: "Matte Stone Surface", categorySlug: "minimalist",
    prompt: "Simple minimalist photoshoot of [product], placed on a matte stone surface, muted beige background, natural daylight, subtle shadows, clean luxury product presentation." },
  { slug: "v3-min-07", name: "White Sand Tone", categorySlug: "minimalist",
    prompt: "Clean product photography of [product], white and sand-tone background, minimal props, soft lighting, realistic shadows, Scandinavian commercial design aesthetic." },
  { slug: "v3-min-08", name: "Soft Ivory Balance", categorySlug: "minimalist",
    prompt: "Minimalist product shot of [product], soft ivory background, balanced negative space, gentle natural shadow, crisp product details, premium modern brand photography." },
  { slug: "v3-min-09", name: "Light Wood Neutral", categorySlug: "minimalist",
    prompt: "Elegant minimalist photo of [product], placed on a light wooden surface, neutral wall background, soft daylight, clean composition, high-end commercial product look." },
  { slug: "v3-min-10", name: "Matte Beige Calm", categorySlug: "minimalist",
    prompt: "Minimalist studio product photography of [product], matte beige backdrop, centered layout, calm lighting, natural shadow, ultra-realistic premium aesthetic." },

  // ── 5. Nature / Organic ────────────────────────────────────────────────────
  { slug: "v3-nat-01", name: "Stone and Leaves", categorySlug: "nature-organic",
    prompt: "Natural product photoshoot of [product], placed on a stone surface and surrounded by fresh green leaves, earthy tones, warm sunlight, organic textures, fresh clean commercial aesthetic." },
  { slug: "v3-nat-02", name: "Eucalyptus Linen", categorySlug: "nature-organic",
    prompt: "Organic product photography of [product], styled with eucalyptus leaves, natural stone, linen fabric, warm sunlight, soft shadows, earthy premium wellness brand aesthetic." },
  { slug: "v3-nat-03", name: "Dried Flowers Botanical", categorySlug: "nature-organic",
    prompt: "Nature-inspired product photoshoot of [product], surrounded by dried flowers, beige linen, and botanical textures, soft natural daylight, clean organic commercial photography." },
  { slug: "v3-nat-04", name: "Citrus Water Droplets", categorySlug: "nature-organic",
    prompt: "Fresh natural product photo of [product], placed among citrus slices, green leaves, and water droplets, bright sunlight, refreshing mood, premium clean brand aesthetic." },
  { slug: "v3-nat-05", name: "Moss Stones Botanical", categorySlug: "nature-organic",
    prompt: "Earthy product photography of [product], styled with moss, smooth stones, and botanical elements, natural sunlight, realistic shadows, clean eco-friendly commercial look." },
  { slug: "v3-nat-06", name: "Rustic Wood Herbs", categorySlug: "nature-organic",
    prompt: "Organic lifestyle product image of [product], placed on rustic wood with fresh herbs, warm sunlight, natural textures, soft shadows, premium clean-label brand photography." },
  { slug: "v3-nat-07", name: "Aloe Water Droplets", categorySlug: "nature-organic",
    prompt: "Natural commercial photoshoot of [product], surrounded by aloe vera leaves and water droplets, bright clean lighting, fresh skincare-inspired aesthetic, ultra-realistic product photography." },
  { slug: "v3-nat-08", name: "Recycled Paper Grass", categorySlug: "nature-organic",
    prompt: "Eco-inspired product photo of [product], placed on recycled paper with dried grass and natural fibers, earthy color palette, soft daylight, premium organic product look." },
  { slug: "v3-nat-09", name: "Wildflowers Stone", categorySlug: "nature-organic",
    prompt: "Fresh nature product photography of [product], styled with wildflowers, stone texture, warm sunlight, realistic shadow, clean natural commercial aesthetic." },
  { slug: "v3-nat-10", name: "Green Leaves Wood", categorySlug: "nature-organic",
    prompt: "Premium organic product photoshoot of [product], surrounded by green leaves, wooden textures, and soft sunlight, earthy neutral colors, realistic high-end commercial photography." },

  // ── 6. Floating / 3D ──────────────────────────────────────────────────────
  { slug: "v3-float-01", name: "Floating Geometric", categorySlug: "floating-3d",
    prompt: "Creative product photoshoot of [product] floating in mid-air, clean white background, suspended geometric shapes around it, realistic shadows, sharp details, studio lighting, premium advertising style." },
  { slug: "v3-float-02", name: "Floating Particles Beige", categorySlug: "floating-3d",
    prompt: "Floating product photography of [product], suspended above a soft beige background, dynamic product angle, elegant floating particles, realistic lighting, premium commercial ad composition." },
  { slug: "v3-float-03", name: "Water Droplets Blue", categorySlug: "floating-3d",
    prompt: "Creative advertising shot of [product] floating in mid-air with water droplets around it, clean blue background, high-speed photography effect, sharp details, bright studio lighting, ultra-realistic." },
  { slug: "v3-float-04", name: "Suspended Petals", categorySlug: "floating-3d",
    prompt: "Dynamic product photoshoot of [product], floating above a reflective surface, suspended petals around it, soft studio lighting, natural motion, premium social media advertising style." },
  { slug: "v3-float-05", name: "Metallic Levitation", categorySlug: "floating-3d",
    prompt: "High-end floating product image of [product], suspended with sleek metallic elements, gray gradient background, dramatic rim lighting, realistic shadows, futuristic commercial photography." },
  { slug: "v3-float-06", name: "Colorful Abstract Float", categorySlug: "floating-3d",
    prompt: "Creative product shot of [product], floating with colorful abstract shapes, pastel background, bright studio lighting, crisp product detail, modern playful advertising look." },
  { slug: "v3-float-07", name: "Liquid Splash Float", categorySlug: "floating-3d",
    prompt: "Premium floating product photoshoot of [product], suspended with splashing liquid elements, clean background, realistic motion freeze, sharp highlights, commercial campaign photography." },
  { slug: "v3-float-08", name: "Fabric Wave Float", categorySlug: "floating-3d",
    prompt: "3D concept product photo of [product], floating among soft fabric waves, warm neutral background, elegant shadows, studio lighting, premium editorial advertising style." },
  { slug: "v3-float-09", name: "Leaf Particle Float", categorySlug: "floating-3d",
    prompt: "Creative mid-air product photography of [product], surrounded by floating leaves and natural particles, clean cream background, soft shadows, premium organic advertising aesthetic." },
  { slug: "v3-float-10", name: "Neon Light Rings", categorySlug: "floating-3d",
    prompt: "Dynamic futuristic product ad of [product], floating with glowing rings and abstract light trails, dark gradient background, sharp details, premium high-tech advertising style." },

  // ── 7. Macro ───────────────────────────────────────────────────────────────
  { slug: "v3-macro-01", name: "Surface Texture", categorySlug: "macro",
    prompt: "Extreme close-up macro product photo of [product], focusing on fine surface texture, premium material finish, shallow depth of field, soft highlights, realistic commercial photography." },
  { slug: "v3-macro-02", name: "Craftsmanship Detail", categorySlug: "macro",
    prompt: "Macro photography of [product], close focus on detailed texture and craftsmanship, soft studio highlights, blurred background, accurate material finish, premium product advertising style." },
  { slug: "v3-macro-03", name: "Label Logo Texture", categorySlug: "macro",
    prompt: "Ultra-detailed macro shot of [product], close-up on label, logo area, and packaging texture, soft reflections, shallow depth of field, luxury commercial photography." },
  { slug: "v3-macro-04", name: "Edge Material Detail", categorySlug: "macro",
    prompt: "Extreme close-up photo of [product], highlighting edges, texture, material finish, and fine details, cinematic soft lighting, realistic depth, premium advertising look." },
  { slug: "v3-macro-05", name: "Surface Highlight", categorySlug: "macro",
    prompt: "Macro product image of [product], sharp focus on the most detailed surface area, gentle highlights, smooth background blur, refined premium commercial photography." },
  { slug: "v3-macro-06", name: "Quality Finish", categorySlug: "macro",
    prompt: "Close-up macro product photography of [product], emphasizing craftsmanship, surface texture, material quality, soft light, shallow depth of field, ultra-realistic." },
  { slug: "v3-macro-07", name: "Logo Reflective", categorySlug: "macro",
    prompt: "Premium macro shot of [product], focused on logo, texture, and reflective material, elegant highlights, smooth bokeh background, luxury product advertising style." },
  { slug: "v3-macro-08", name: "Extreme Detail", categorySlug: "macro",
    prompt: "Extreme detail photo of [product], macro lens perspective, rich surface texture, realistic reflections, soft shadows, high-resolution commercial product photography." },
  { slug: "v3-macro-09", name: "Packaging Premium", categorySlug: "macro",
    prompt: "Macro product photoshoot of [product], close focus on packaging texture and premium finish, natural highlights, shallow depth of field, editorial commercial look." },
  { slug: "v3-macro-10", name: "Material Surface", categorySlug: "macro",
    prompt: "Ultra-realistic macro image of [product], detailed material surface, crisp focus area, soft bokeh background, premium craftsmanship photography, high-end advertising style." },

  // ── 8. Flat Lay ────────────────────────────────────────────────────────────
  { slug: "v3-flat-01", name: "Beige Stationery", categorySlug: "flat-lay",
    prompt: "Flat lay product photoshoot of [product], arranged with neutral stationery props on a beige surface, top-down view, balanced spacing, soft daylight, clean social media campaign style." },
  { slug: "v3-flat-02", name: "Linen Dried Flowers", categorySlug: "flat-lay",
    prompt: "Top-down flat lay photo of [product], styled with linen fabric, dried flowers, and minimal accessories, soft natural light, refined composition, premium clean brand aesthetic." },
  { slug: "v3-flat-03", name: "Marble Beauty Accessories", categorySlug: "flat-lay",
    prompt: "Flat lay product photography of [product], arranged with beauty accessories on a marble background, top-down view, soft daylight, balanced composition, premium social media ad style." },
  { slug: "v3-flat-04", name: "Warm Beige Minimal", categorySlug: "flat-lay",
    prompt: "Modern flat lay photoshoot of [product], placed on a warm beige surface with minimal props, top-down perspective, natural shadows, clean commercial photography." },
  { slug: "v3-flat-05", name: "Wooden Lifestyle Props", categorySlug: "flat-lay",
    prompt: "Flat lay product image of [product], surrounded by lifestyle props on a wooden table, soft morning light, balanced composition, realistic premium brand campaign look." },
  { slug: "v3-flat-06", name: "Silk Flowers Elegant", categorySlug: "flat-lay",
    prompt: "Premium flat lay photography of [product], arranged with silk fabric, small flowers, and elegant accessories, top-down angle, soft daylight, luxury social media style." },
  { slug: "v3-flat-07", name: "Pastel Color Match", categorySlug: "flat-lay",
    prompt: "Clean flat lay product shot of [product], positioned with matching color props on a pastel background, bright natural light, modern balanced commercial composition." },
  { slug: "v3-flat-08", name: "Desk Productivity", categorySlug: "flat-lay",
    prompt: "Flat lay commercial photo of [product], styled with notebook, coffee cup, and minimal desk props, top-down perspective, soft daylight, productivity lifestyle brand aesthetic." },
  { slug: "v3-flat-09", name: "Towel Marble Skincare", categorySlug: "flat-lay",
    prompt: "Elegant flat lay product photography of [product], arranged with soft towels, marble texture, and skincare-style props, balanced layout, premium clean aesthetic." },
  { slug: "v3-flat-10", name: "Colorful Social Media", categorySlug: "flat-lay",
    prompt: "Social media flat lay image of [product], placed with colorful props on a bright background, top-down view, clean lighting, playful balanced composition, modern campaign style." },

  // ── 9. Dark Moody ──────────────────────────────────────────────────────────
  { slug: "v3-dark-01", name: "Black Rim Light", categorySlug: "dark-moody",
    prompt: "Dark moody product photography of [product], black background, dramatic rim lighting, cinematic shadows, premium luxury advertising style, ultra-realistic sharp details." },
  { slug: "v3-dark-02", name: "Dark Reflective Surface", categorySlug: "dark-moody",
    prompt: "Moody luxury product photo of [product], placed on a dark reflective surface, low-key lighting, sharp highlights, deep shadows, refined premium commercial photography." },
  { slug: "v3-dark-03", name: "Cinematic Side Light", categorySlug: "dark-moody",
    prompt: "Cinematic dark product photoshoot of [product], black matte background, dramatic side lighting, realistic reflections, elegant shadow falloff, luxury editorial style." },
  { slug: "v3-dark-04", name: "Charcoal Gradient Rim", categorySlug: "dark-moody",
    prompt: "Premium dark product image of [product], placed against a charcoal gradient backdrop, rim lighting, soft reflections, high-contrast advertising photography." },
  { slug: "v3-dark-05", name: "Smoke Spotlight", categorySlug: "dark-moody",
    prompt: "Dark luxury commercial photo of [product], black background with subtle smoke atmosphere, dramatic spotlighting, cinematic shadows, sharp product details, ultra-realistic." },
  { slug: "v3-dark-06", name: "Black Stone Shadow", categorySlug: "dark-moody",
    prompt: "Moody product photography of [product], positioned on black stone, deep shadows, narrow highlights, elegant contrast, premium luxury brand campaign style." },
  { slug: "v3-dark-07", name: "Overhead Spotlight Black", categorySlug: "dark-moody",
    prompt: "High-end dark product photoshoot of [product], dramatic overhead spotlight, black reflective surface, cinematic atmosphere, refined shadows, ultra-realistic advertising look." },
  { slug: "v3-dark-08", name: "Gold Edge Black", categorySlug: "dark-moody",
    prompt: "Dark premium product image of [product], black background, warm golden edge lighting, glossy reflection, dramatic shadows, luxury editorial photography." },
  { slug: "v3-dark-09", name: "Low Key Cinematic", categorySlug: "dark-moody",
    prompt: "Cinematic product photo of [product], low-key studio lighting, deep black background, realistic rim highlights, moody premium advertising composition." },
  { slug: "v3-dark-10", name: "Black Marble Drama", categorySlug: "dark-moody",
    prompt: "Luxury dark product shot of [product], placed on black marble, dramatic soft lighting, rich shadows, sharp detail, realistic reflection, premium commercial style." },

  // ── 10. Colorful Pop Art ───────────────────────────────────────────────────
  { slug: "v3-pop-01", name: "Coral Geometric", categorySlug: "colorful-pop",
    prompt: "Vibrant product photoshoot of [product], bold coral background, playful geometric props, bright studio lighting, energetic composition, modern social media ad style." },
  { slug: "v3-pop-02", name: "Bright Yellow Gen Z", categorySlug: "colorful-pop",
    prompt: "Colorful product photography of [product], placed on a bright yellow background with playful props, crisp details, fun Gen Z campaign aesthetic, clean commercial finish." },
  { slug: "v3-pop-03", name: "Blue Pink Pop", categorySlug: "colorful-pop",
    prompt: "Pop art product photoshoot of [product], bold blue and pink background, energetic layout, glossy props, bright lighting, modern social media advertising style." },
  { slug: "v3-pop-04", name: "Orange Shapes", categorySlug: "colorful-pop",
    prompt: "Vibrant commercial product image of [product], colorful orange background, playful floating shapes, bright studio lighting, cheerful social media campaign look." },
  { slug: "v3-pop-05", name: "Pastel Purple Fun", categorySlug: "colorful-pop",
    prompt: "Creative colorful product photo of [product], placed on a pastel purple background with fun props, clean shadows, energetic modern brand aesthetic." },
  { slug: "v3-pop-06", name: "Vivid Green Bold", categorySlug: "colorful-pop",
    prompt: "Bold pop-style product photography of [product], vivid green background, playful composition, bright lighting, sharp details, trendy social media ad design." },
  { slug: "v3-pop-07", name: "Neon Pink Quirky", categorySlug: "colorful-pop",
    prompt: "Colorful product campaign image of [product], neon pink background, quirky props, dynamic composition, bright studio lighting, youthful energetic style." },
  { slug: "v3-pop-08", name: "Turquoise Modern", categorySlug: "colorful-pop",
    prompt: "Modern social media product photo of [product], bold turquoise background, playful props, clean highlights, vibrant composition, premium Gen Z advertising look." },
  { slug: "v3-pop-09", name: "Bright Red Contrast", categorySlug: "colorful-pop",
    prompt: "Fun colorful product photoshoot of [product], placed on a bright red background with contrasting props, energetic lighting, bold commercial campaign style." },
  { slug: "v3-pop-10", name: "Gradient Pop Suspended", categorySlug: "colorful-pop",
    prompt: "Vibrant pop art product shot of [product], colorful gradient background, playful suspended props, bright studio lighting, sharp focus, modern social media aesthetic." },

  // ── 11. Seasonal ───────────────────────────────────────────────────────────
  { slug: "v3-season-01", name: "Summer Tropical", categorySlug: "seasonal",
    prompt: "Seasonal product photoshoot of [product] for a summer campaign, tropical leaves, citrus fruits, bright sunlight, refreshing atmosphere, realistic shadows, premium commercial photography." },
  { slug: "v3-season-02", name: "Christmas Festive", categorySlug: "seasonal",
    prompt: "Festive product photoshoot of [product] for a Christmas campaign, warm fairy lights, pine branches, red and gold props, cozy premium commercial style." },
  { slug: "v3-season-03", name: "Winter Cool Blue", categorySlug: "seasonal",
    prompt: "Winter product photography of [product], soft snow-like surface, cool blue background, warm highlights, elegant seasonal props, crisp details, premium advertising campaign look." },
  { slug: "v3-season-04", name: "Spring Flowers Pastel", categorySlug: "seasonal",
    prompt: "Spring product photoshoot of [product], fresh flowers, pastel background, soft daylight, clean bright atmosphere, natural shadows, premium commercial photography." },
  { slug: "v3-season-05", name: "Autumn Golden Leaves", categorySlug: "seasonal",
    prompt: "Autumn product photography of [product], dried leaves, warm brown tones, golden sunlight, cozy seasonal atmosphere, realistic premium brand campaign style." },
  { slug: "v3-season-06", name: "Diwali Diyas Gold", categorySlug: "seasonal",
    prompt: "Diwali product photoshoot of [product], warm golden lighting, decorative diyas, marigold flowers, elegant festive props, premium commercial photography." },
  { slug: "v3-season-07", name: "Valentine Romance", categorySlug: "seasonal",
    prompt: "Valentine's Day product photo of [product], soft pink background, roses, romantic lighting, elegant composition, realistic shadow, premium seasonal advertising style." },
  { slug: "v3-season-08", name: "New Year Champagne", categorySlug: "seasonal",
    prompt: "New Year product photoshoot of [product], champagne gold background, sparkling confetti, dramatic festive lighting, premium celebration campaign look." },
  { slug: "v3-season-09", name: "Monsoon Rain", categorySlug: "seasonal",
    prompt: "Monsoon-inspired product photography of [product], fresh raindrops, cool gray-blue background, wet stone texture, soft natural light, premium seasonal style." },
  { slug: "v3-season-10", name: "Holiday Glow", categorySlug: "seasonal",
    prompt: "Holiday product photoshoot of [product], warm festive background, gift boxes, soft glowing lights, cozy atmosphere, polished premium commercial campaign photography." },

  // ── 12. E-commerce White ───────────────────────────────────────────────────
  { slug: "v3-ecom-01", name: "White Front View", categorySlug: "ecommerce-white",
    prompt: "Professional e-commerce product photo of [product], pure white background, centered front view, evenly lit, crisp edges, realistic soft shadow, high-resolution catalog photography." },
  { slug: "v3-ecom-02", name: "Seamless Isolated", categorySlug: "ecommerce-white",
    prompt: "Clean marketplace product image of [product], isolated on a pure white seamless background, front-facing angle, soft realistic shadow, sharp details, professional e-commerce style." },
  { slug: "v3-ecom-03", name: "Catalog Balanced", categorySlug: "ecommerce-white",
    prompt: "High-resolution e-commerce photo of [product], centered on a white seamless background, balanced studio lighting, accurate colors, crisp product outline, catalog-ready image." },
  { slug: "v3-ecom-04", name: "Online Store Shadow", categorySlug: "ecommerce-white",
    prompt: "Professional online store product photography of [product], pure white background, natural contact shadow underneath, sharp focus, clean edges, realistic commercial finish." },
  { slug: "v3-ecom-05", name: "Catalog Dual Lit", categorySlug: "ecommerce-white",
    prompt: "Catalog product image of [product], isolated on a seamless white background, evenly lit from both sides, crisp details, soft shadow, professional marketplace listing style." },
  { slug: "v3-ecom-06", name: "Clean Studio White", categorySlug: "ecommerce-white",
    prompt: "Clean e-commerce studio photo of [product], centered composition, bright white background, realistic product texture, sharp edges, soft shadow, high-resolution." },
  { slug: "v3-ecom-07", name: "Listing Clear Label", categorySlug: "ecommerce-white",
    prompt: "Professional product listing photo of [product], isolated on white, balanced studio lighting, natural shadow, clear label visibility, commercial catalog photography." },
  { slug: "v3-ecom-08", name: "Marketplace Ready", categorySlug: "ecommerce-white",
    prompt: "Marketplace-ready product photo of [product], pure white background, centered layout, even lighting, crisp silhouette, realistic shadow, clean high-resolution finish." },
  { slug: "v3-ecom-09", name: "Studio Accurate Color", categorySlug: "ecommerce-white",
    prompt: "Studio e-commerce product photography of [product], white seamless backdrop, soft natural shadow, accurate color reproduction, sharp product details, catalog style." },
  { slug: "v3-ecom-10", name: "High-End Retail", categorySlug: "ecommerce-white",
    prompt: "High-end e-commerce image of [product], isolated on white background, clean lighting, realistic shadow, sharp focus, professional online retail photography." },

  // ── 13. Hero Banner ────────────────────────────────────────────────────────
  { slug: "v3-hero-01", name: "Beige Left Text Right", categorySlug: "hero-banner",
    prompt: "Hero banner product photoshoot of [product], wide horizontal composition, product placed on the left, soft beige background, negative space for text on the right, premium lighting, advertising campaign style." },
  { slug: "v3-hero-02", name: "Blue Right Text Left", categorySlug: "hero-banner",
    prompt: "Website hero banner image of [product], product placed on the right, clean pastel blue background, spacious negative area on the left, soft commercial lighting, premium brand style." },
  { slug: "v3-hero-03", name: "Cream Center Wide", categorySlug: "hero-banner",
    prompt: "Premium hero banner photo of [product], centered composition, wide horizontal layout, warm cream background, subtle realistic shadow, elegant lighting, advertising campaign aesthetic." },
  { slug: "v3-hero-04", name: "Marble Dark Left", categorySlug: "hero-banner",
    prompt: "Hero banner product photography of [product], product placed on the left side, marble surface, dark luxury background, empty space for headline text, premium editorial lighting." },
  { slug: "v3-hero-05", name: "Gray Gradient Right", categorySlug: "hero-banner",
    prompt: "Modern website header photo of [product], product placed on the right, soft gray gradient background, clean negative space, realistic shadows, premium commercial style." },
  { slug: "v3-hero-06", name: "Pink Center Wide", categorySlug: "hero-banner",
    prompt: "Hero banner product campaign image of [product], wide composition with product centered, pastel pink background, soft natural shadows, elegant advertising layout." },
  { slug: "v3-hero-07", name: "Black Luxury Left", categorySlug: "hero-banner",
    prompt: "Luxury hero banner shot of [product], product placed on the left, black reflective surface, dramatic lighting, negative text space on the right, premium commercial photography." },
  { slug: "v3-hero-08", name: "White Clean Right", categorySlug: "hero-banner",
    prompt: "Clean e-commerce hero banner photo of [product], product placed on the right, white background, large empty space for text, soft shadow, professional advertising style." },
  { slug: "v3-hero-09", name: "Colorful Center Props", categorySlug: "hero-banner",
    prompt: "Social media hero banner image of [product], product centered with colorful background, playful props around the edges, clear negative space, bright premium campaign lighting." },
  { slug: "v3-hero-10", name: "Neutral Off-Center", categorySlug: "hero-banner",
    prompt: "Premium website banner photoshoot of [product], wide horizontal composition, product placed slightly off-center, soft neutral background, elegant lighting, commercial brand campaign style." },

  // ── 14. Ingredient-Based ──────────────────────────────────────────────────
  { slug: "v3-ingr-01", name: "Citrus Mint Droplets", categorySlug: "ingredient-based",
    prompt: "Product photoshoot of [product], surrounded by citrus slices, mint leaves, and water droplets, fresh textures, natural lighting, clean premium brand aesthetic, realistic commercial photography." },
  { slug: "v3-ingr-02", name: "Aloe Cucumber", categorySlug: "ingredient-based",
    prompt: "Ingredient-based product photography of [product], surrounded by aloe vera leaves, cucumber slices, and fresh botanicals, soft daylight, clean natural commercial style." },
  { slug: "v3-ingr-03", name: "Honey Oats Almonds", categorySlug: "ingredient-based",
    prompt: "Premium product photo of [product], styled with honey, oats, and almonds, warm natural lighting, fresh textures, clean organic brand aesthetic." },
  { slug: "v3-ingr-04", name: "Berries Mint Ice", categorySlug: "ingredient-based",
    prompt: "Fresh commercial photoshoot of [product], surrounded by berries, mint, and crushed ice, bright natural light, realistic textures, refreshing premium campaign style." },
  { slug: "v3-ingr-05", name: "Coffee Cocoa Vanilla", categorySlug: "ingredient-based",
    prompt: "Ingredient-focused product photography of [product], placed among coffee beans, cocoa powder, and vanilla pods, rich textures, warm lighting, premium commercial look." },
  { slug: "v3-ingr-06", name: "Lavender Chamomile", categorySlug: "ingredient-based",
    prompt: "Natural ingredient product shoot of [product], surrounded by lavender, chamomile flowers, and soft linen, calming tones, natural daylight, premium wellness aesthetic." },
  { slug: "v3-ingr-07", name: "Green Tea Lemon", categorySlug: "ingredient-based",
    prompt: "Clean product photoshoot of [product], styled with green tea leaves, lemon slices, and water droplets, fresh bright lighting, realistic premium commercial photography." },
  { slug: "v3-ingr-08", name: "Coconut Tropical", categorySlug: "ingredient-based",
    prompt: "Premium ingredient-based photo of [product], surrounded by coconut pieces, tropical leaves, and soft sand tones, warm sunlight, clean natural brand aesthetic." },
  { slug: "v3-ingr-09", name: "Rose Botanical Drops", categorySlug: "ingredient-based",
    prompt: "Commercial product image of [product], placed with rose petals, botanical extracts, and glass droplets, soft elegant lighting, premium skincare-inspired aesthetic." },
  { slug: "v3-ingr-10", name: "Herbs Citrus Texture", categorySlug: "ingredient-based",
    prompt: "Fresh ingredient product photography of [product], surrounded by herbs, citrus, and natural textures, clean composition, soft daylight, realistic commercial brand style." },

  // ── 15. Tech / Futuristic ─────────────────────────────────────────────────
  { slug: "v3-tech-01", name: "Neon Blue Reflective", categorySlug: "tech-futuristic",
    prompt: "Futuristic product photoshoot of [product], sleek reflective black surface, neon blue accent lighting, dark gradient background, high-tech atmosphere, premium commercial render style." },
  { slug: "v3-tech-02", name: "Cyan Neon Glass", categorySlug: "tech-futuristic",
    prompt: "High-tech product photography of [product], placed on glossy black glass, cyan neon highlights, dark futuristic background, sharp reflections, premium advertising style." },
  { slug: "v3-tech-03", name: "Blue Purple Metallic", categorySlug: "tech-futuristic",
    prompt: "Futuristic commercial shot of [product], metallic platform, blue and purple neon lighting, cinematic shadows, sleek modern technology brand aesthetic." },
  { slug: "v3-tech-04", name: "Digital Light Glow", categorySlug: "tech-futuristic",
    prompt: "Premium tech product image of [product], reflective glass surface, dark gradient background, glowing digital light accents, sharp focus, futuristic commercial photography." },
  { slug: "v3-tech-05", name: "Neon Rim Dark", categorySlug: "tech-futuristic",
    prompt: "Sleek futuristic photoshoot of [product], placed in a dark studio with neon rim lighting, reflective surface, high-tech atmosphere, ultra-realistic product render." },
  { slug: "v3-tech-06", name: "Electric Blue Minimal", categorySlug: "tech-futuristic",
    prompt: "Modern technology product photo of [product], black background, electric blue lighting, glossy reflections, minimal futuristic composition, premium commercial style." },
  { slug: "v3-tech-07", name: "Holographic Light", categorySlug: "tech-futuristic",
    prompt: "Futuristic product advertisement for [product], surrounded by subtle holographic light elements, dark gradient background, sharp details, premium high-tech photography." },
  { slug: "v3-tech-08", name: "Neon Green Metallic", categorySlug: "tech-futuristic",
    prompt: "Premium tech photoshoot of [product], placed on a metallic surface, neon green accents, dramatic lighting, sleek reflections, futuristic brand campaign style." },
  { slug: "v3-tech-09", name: "Blue Edge Cinematic", categorySlug: "tech-futuristic",
    prompt: "High-end futuristic product shot of [product], dark reflective environment, blue neon edge lighting, cinematic shadows, ultra-realistic commercial technology photography." },
  { slug: "v3-tech-10", name: "Neon Glowing Black", categorySlug: "tech-futuristic",
    prompt: "Sleek commercial render-style photo of [product], glowing neon background, reflective black surface, sharp details, futuristic atmosphere, premium tech advertising look." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NEG =
  "blurry image, low resolution, distorted product, wrong product shape, changed packaging, incorrect logo, unreadable label, misspelled text, extra text, extra logos, duplicate product, cropped product, deformed edges, unrealistic proportions, noisy background, harsh shadows, overexposed highlights, watermark, amateur photo";

function buildGenPrompt(template: Template, catTempProduct: string): string {
  const withProduct = template.prompt.replace("[product]", catTempProduct);
  return `${withProduct} Avoid: ${NEG}.`;
}

async function generateImage(prompt: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const item = json?.data?.[0];
  if (!item) throw new Error("No image data returned");

  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }
  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error("No b64_json or url in response");
}

async function uploadToR2(buffer: Buffer, key: string): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const force = process.argv.includes("--force");

  // 1. Upsert categories
  const catMap: Record<string, string> = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const existing = await prisma.photoshootCategory.findFirst({ where: { slug: c.slug } });
    let record;
    if (existing) {
      record = await prisma.photoshootCategory.update({
        where: { id: existing.id },
        data: { name: c.name, sortOrder: i },
      });
    } else {
      record = await prisma.photoshootCategory.create({
        data: { name: c.name, slug: c.slug, sortOrder: i },
      });
    }
    catMap[c.slug] = record.id;
    console.log(`  category: ${c.name}`);
  }

  // 2. For each template
  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i];
    const catId = catMap[t.categorySlug];
    if (!catId) {
      console.warn(`  ! unknown category slug "${t.categorySlug}" for ${t.slug}`);
      continue;
    }

    // Upsert DB record
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
          active: true,
        },
      });
    } else {
      tpl = await prisma.photoshootTemplate.update({
        where: { id: tpl.id },
        data: { prompt: t.prompt, sortOrder: i, active: true },
      });
    }

    // Skip if already has image
    if (tpl.imageUrl && tpl.imageUrl.startsWith("http") && !force) {
      console.log(`  · ${t.name} — already has image, skipping`);
      continue;
    }

    const cat = CATEGORIES.find((c) => c.slug === t.categorySlug)!;
    const genPrompt = buildGenPrompt(t, cat.tempProduct);

    try {
      console.log(`  → [${i + 1}/150] ${t.name} (${t.categorySlug})`);
      const buffer = await generateImage(genPrompt);
      const r2Url = await uploadToR2(buffer, `photoshoot-templates/${t.slug}.png`);
      await prisma.photoshootTemplate.update({
        where: { id: tpl.id },
        data: { imageUrl: r2Url },
      });
      console.log(`    ✓ ${r2Url}`);
    } catch (e) {
      console.error(`    ✗ ${t.name}:`, e instanceof Error ? e.message : e);
    }

    // Small pause to stay within rate limits
    await new Promise((r) => setTimeout(r, 500));
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
