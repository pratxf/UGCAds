/* eslint-disable */
// Generates 20 photorealistic American/British models posed with empty
// hands forward (ready to hold a product), each in a different real-world
// UGC background. Uses fal-ai/flux-pro/v1.1-ultra for max realism.
//
// Run: npx tsx scripts/generate-product-ad-avatars.ts

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

type Spec = {
  name: string;
  gender: "female" | "male";
  nationality: "american" | "british";
  age: string;
  ethnicity: string;
  hair: string;
  outfit: string;
  background: string;
};

const SPECS: Spec[] = [
  // ─── 20 Women (10 American + 10 British), all under 30 ───
  { name: "Madison", gender: "female", nationality: "american", age: "23 year old",
    ethnicity: "white American", hair: "shoulder-length wavy honey-blonde hair",
    outfit: "soft cream cropped knit sweater and high-waisted blue jeans",
    background: "bright modern American kitchen with white cabinets, marble countertop, soft morning sunlight through a window" },
  { name: "Brianna", gender: "female", nationality: "american", age: "24 year old",
    ethnicity: "African American", hair: "long natural curly black hair",
    outfit: "white ribbed tank top and beige relaxed-fit trousers",
    background: "sunlit Brooklyn apartment with exposed brick wall and a small leafy plant in the corner" },
  { name: "Sofia", gender: "female", nationality: "american", age: "26 year old",
    ethnicity: "Latina American", hair: "long straight dark brown hair with subtle highlights",
    outfit: "pastel pink oversized hoodie",
    background: "cozy bedroom with warm fairy lights and a bed with white linen behind, late afternoon glow" },
  { name: "Hailey", gender: "female", nationality: "american", age: "22 year old",
    ethnicity: "white American", hair: "long straight light blonde hair",
    outfit: "fitted black ribbed long-sleeve top",
    background: "minimalist home office with a wooden desk, white wall, and a sunlit window to the right" },
  { name: "Nia", gender: "female", nationality: "american", age: "25 year old",
    ethnicity: "African American", hair: "natural short afro hair",
    outfit: "olive green crewneck sweatshirt",
    background: "bright bathroom with white subway tiles and warm vanity lighting" },
  { name: "Lily", gender: "female", nationality: "american", age: "21 year old",
    ethnicity: "East Asian American", hair: "shoulder-length straight black hair with curtain bangs",
    outfit: "soft pastel lilac oversized t-shirt",
    background: "sunny Los Angeles studio apartment with white walls and a soft beige curtain" },
  { name: "Camila", gender: "female", nationality: "american", age: "27 year old",
    ethnicity: "Latina American", hair: "long wavy chestnut brown hair",
    outfit: "white linen button-up tied at the waist",
    background: "cozy reading nook with bookshelves softly blurred behind, warm afternoon glow" },
  { name: "Aubrey", gender: "female", nationality: "american", age: "28 year old",
    ethnicity: "white American", hair: "shoulder-length wavy auburn hair",
    outfit: "muted sage cardigan over a white tee",
    background: "minimalist Brooklyn cafe with light wood tables softly blurred behind" },
  { name: "Zoe", gender: "female", nationality: "american", age: "23 year old",
    ethnicity: "Mixed-race American", hair: "long voluminous curly hair, dark brown",
    outfit: "off-white ribbed crop top",
    background: "Miami beachside apartment with light blue accents and warm late-afternoon sun" },
  { name: "Aaliyah", gender: "female", nationality: "american", age: "26 year old",
    ethnicity: "African American", hair: "long sleek box braids",
    outfit: "soft caramel turtleneck",
    background: "warm-lit New York loft with exposed brick and Edison bulb pendants softly blurred" },

  // ─── 10 British Women, all under 30 ───
  { name: "Charlotte", gender: "female", nationality: "british", age: "27 year old",
    ethnicity: "white British", hair: "long straight chestnut brown hair",
    outfit: "soft beige cashmere jumper",
    background: "London flat with neutral cream walls and a leafy plant, soft overcast daylight from a tall window" },
  { name: "Olivia", gender: "female", nationality: "british", age: "25 year old",
    ethnicity: "white British", hair: "shoulder-length wavy dark blonde hair",
    outfit: "fitted white t-shirt under a beige overshirt",
    background: "Notting Hill style cafe interior with subway tiles and warm pendant lights, slightly blurred" },
  { name: "Priya", gender: "female", nationality: "british", age: "26 year old",
    ethnicity: "South Asian British", hair: "long sleek straight black hair",
    outfit: "light grey crewneck cotton sweatshirt",
    background: "modern Manchester loft with grey concrete wall and warm window light" },
  { name: "Maya", gender: "female", nationality: "british", age: "28 year old",
    ethnicity: "Black British", hair: "long box braids in dark brown",
    outfit: "white linen button-up shirt",
    background: "bright cream-walled bedroom with sheer curtains diffusing daylight" },
  { name: "Freya", gender: "female", nationality: "british", age: "23 year old",
    ethnicity: "white British", hair: "messy bun light brown hair",
    outfit: "oversized grey marl t-shirt",
    background: "cosy living room with a beige sofa softly blurred behind, warm afternoon light" },
  { name: "Amelia", gender: "female", nationality: "british", age: "24 year old",
    ethnicity: "white British", hair: "shoulder-length wavy strawberry blonde hair",
    outfit: "soft pink ribbed knit jumper",
    background: "bright Soho cafe with hanging plants softly blurred behind, warm natural daylight" },
  { name: "Anika", gender: "female", nationality: "british", age: "22 year old",
    ethnicity: "South Asian British", hair: "long wavy dark brown hair",
    outfit: "white oversized t-shirt",
    background: "sunlit Manchester university dorm room with cream walls and fairy lights softly blurred" },
  { name: "Imani", gender: "female", nationality: "british", age: "29 year old",
    ethnicity: "Black British", hair: "natural curly afro hair, dark brown",
    outfit: "olive green silk button-up",
    background: "modern London bedroom with sage green walls and warm side lamp lighting" },
  { name: "Jade", gender: "female", nationality: "british", age: "25 year old",
    ethnicity: "East Asian British", hair: "shoulder-length straight black hair",
    outfit: "soft beige hoodie",
    background: "minimal Shoreditch flat with white walls and a small monstera plant softly blurred" },
  { name: "Hannah", gender: "female", nationality: "british", age: "26 year old",
    ethnicity: "white British", hair: "long straight light brown hair",
    outfit: "navy fitted long-sleeve top",
    background: "rustic English country kitchen with white tiles and copper accents softly blurred" },

  // ─── 10 American Men, all under 30 ───
  { name: "Jake", gender: "male", nationality: "american", age: "26 year old",
    ethnicity: "white American", hair: "short messy brown hair, light stubble",
    outfit: "plain white crew-neck t-shirt",
    background: "bright modern apartment with white wall and a small abstract art print, daylight" },
  { name: "Marcus", gender: "male", nationality: "american", age: "28 year old",
    ethnicity: "African American", hair: "short black fade haircut, clean shaven",
    outfit: "dark navy crew-neck t-shirt",
    background: "loft-style living space with grey couch softly blurred behind, warm side lighting" },
  { name: "Diego", gender: "male", nationality: "american", age: "24 year old",
    ethnicity: "Latino American", hair: "medium-length dark brown hair, light beard",
    outfit: "olive green Henley shirt",
    background: "sunlit kitchen with warm oak cabinets softly blurred behind" },
  { name: "Tyler", gender: "male", nationality: "american", age: "22 year old",
    ethnicity: "white American", hair: "short blonde hair, clean shaven",
    outfit: "grey heather hoodie",
    background: "small home gym with a wooden floor and weight rack softly out of focus behind" },
  { name: "Ethan", gender: "male", nationality: "american", age: "29 year old",
    ethnicity: "white American", hair: "side-parted dark brown hair, neat short beard",
    outfit: "black fitted t-shirt",
    background: "professional home office with a bookshelf softly blurred behind, warm desk lamp" },
  { name: "Kai", gender: "male", nationality: "american", age: "23 year old",
    ethnicity: "East Asian American", hair: "short black hair, undercut, clean shaven",
    outfit: "off-white crewneck sweatshirt",
    background: "minimalist Los Angeles studio apartment with a soft grey wall" },
  { name: "Andre", gender: "male", nationality: "american", age: "27 year old",
    ethnicity: "African American", hair: "short twists, neat goatee",
    outfit: "muted burgundy hoodie",
    background: "warm Brooklyn apartment with exposed brick wall softly blurred behind" },
  { name: "Mateo", gender: "male", nationality: "american", age: "25 year old",
    ethnicity: "Latino American", hair: "short curly dark brown hair, light stubble",
    outfit: "navy fitted long-sleeve top",
    background: "Miami balcony with palm trees softly blurred behind, golden hour light" },
  { name: "Cole", gender: "male", nationality: "american", age: "21 year old",
    ethnicity: "white American", hair: "short messy sandy blonde hair, clean shaven",
    outfit: "soft cream sweatshirt",
    background: "college dorm room with string lights and a soft posters wall softly blurred" },
  { name: "Jamal", gender: "male", nationality: "american", age: "28 year old",
    ethnicity: "African American", hair: "short clean fade, neat short beard",
    outfit: "olive green crewneck",
    background: "Chicago loft with warm wood floors and a soft grey couch softly blurred behind" },

  // ─── 10 British Men, all under 30 ───
  { name: "Oliver", gender: "male", nationality: "british", age: "27 year old",
    ethnicity: "white British", hair: "short messy chestnut hair, light stubble",
    outfit: "soft beige sweatshirt",
    background: "London flat with neutral cream walls and a window letting in soft overcast daylight" },
  { name: "Harry", gender: "male", nationality: "british", age: "25 year old",
    ethnicity: "white British", hair: "short dark brown hair, clean shaven",
    outfit: "navy crewneck jumper",
    background: "warm-toned cafe interior with bare brick wall softly blurred behind" },
  { name: "Arjun", gender: "male", nationality: "british", age: "29 year old",
    ethnicity: "South Asian British", hair: "short side-swept black hair, neat short beard",
    outfit: "charcoal grey fitted t-shirt",
    background: "modern Manchester apartment with a soft grey wall and a hint of a houseplant" },
  { name: "Jamal B", gender: "male", nationality: "british", age: "26 year old",
    ethnicity: "Black British", hair: "short fade haircut, clean shaven",
    outfit: "olive green hoodie",
    background: "bright bedroom with a white-painted brick wall and warm daylight" },
  { name: "Liam", gender: "male", nationality: "british", age: "23 year old",
    ethnicity: "white British", hair: "messy short ginger hair, light stubble",
    outfit: "pale blue oxford shirt with rolled sleeves",
    background: "rustic kitchen with white tiles and a wooden countertop softly blurred behind" },
  { name: "Aiden", gender: "male", nationality: "british", age: "22 year old",
    ethnicity: "white British", hair: "short messy dark blonde hair, clean shaven",
    outfit: "soft grey marl t-shirt",
    background: "Soho cafe with warm wooden tables softly blurred behind" },
  { name: "Rohan", gender: "male", nationality: "british", age: "28 year old",
    ethnicity: "South Asian British", hair: "short black hair with side parting, neat short beard",
    outfit: "white t-shirt under a charcoal overshirt",
    background: "Birmingham apartment with cream walls and a houseplant softly blurred behind" },
  { name: "Theo", gender: "male", nationality: "british", age: "24 year old",
    ethnicity: "white British", hair: "short brunette quiff, light stubble",
    outfit: "navy fitted polo shirt",
    background: "bright London living room with a sage green wall softly blurred behind" },
  { name: "Reuben", gender: "male", nationality: "british", age: "26 year old",
    ethnicity: "Black British", hair: "short twists, neat short beard",
    outfit: "cream cable knit jumper",
    background: "warm-toned home office with a bookshelf softly blurred behind, warm desk lamp" },
  { name: "Finn", gender: "male", nationality: "british", age: "21 year old",
    ethnicity: "white British", hair: "shaggy medium-length light brown hair, clean shaven",
    outfit: "oversized vintage band tee",
    background: "Camden flat with white walls and a vintage record player softly blurred behind" },
];

// Hyper-realistic prompt template designed to produce a UGC-style selfie/
// front-facing shot with hands forward, palms up, ready to hold a product.
function buildPrompt(s: Spec) {
  return [
    "Hyperrealistic medium-shot UGC selfie photograph,",
    `a ${s.age} ${s.ethnicity} ${s.gender === "female" ? "woman" : "man"},`,
    `${s.hair},`,
    "natural friendly expression, soft genuine smile, looking directly at the camera,",
    `wearing ${s.outfit},`,
    "BOTH HANDS RAISED FORWARD AT CHEST HEIGHT WITH OPEN PALMS FACING THE CAMERA AS IF GENTLY PRESENTING SOMETHING (HANDS COMPLETELY EMPTY, NO OBJECT, NO PRODUCT IN HANDS),",
    "natural relaxed posture, fingers slightly curled,",
    `background: ${s.background},`,
    "shot on iPhone 15 Pro, slight authentic candid feel, soft natural lighting,",
    "realistic skin texture with subtle pores, mild blemishes, no airbrushing, no over-smoothing, no makeup heavy look,",
    "shallow depth of field with softly blurred background, sharp focus on the person's face and hands,",
    "vertical 3:4 portrait composition, head and shoulders to mid-torso visible, hands clearly visible in lower frame,",
    "absolutely photorealistic, real human, no AI artifacts, no plastic skin, no extra fingers, no distorted hands, no warped anatomy, no text, no logos, no watermark",
  ].join(" ");
}

async function uploadImage(buffer: Buffer, key: string) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: "image/jpeg" }));
  return `${PUBLIC_URL}/${key}`;
}

async function generate(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
    input: {
      prompt,
      aspect_ratio: "3:4",
      num_images: 1,
      output_format: "jpeg",
      safety_tolerance: "5",
      raw: false,
    } as unknown as Parameters<typeof fal.subscribe>[1]["input"],
  });
  const data = result.data as { images?: { url?: string }[] };
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error("No image returned from flux-pro/v1.1-ultra");
  return url;
}

async function main() {
  const force = process.argv.includes("--force");

  for (let i = 0; i < SPECS.length; i++) {
    const s = SPECS[i];

    let row = await prisma.productAdAvatar.findFirst({
      where: { name: s.name, gender: s.gender, nationality: s.nationality },
    });
    if (!row) {
      row = await prisma.productAdAvatar.create({
        data: {
          name: s.name,
          gender: s.gender,
          nationality: s.nationality,
          imageUrl: "",
          sortOrder: i,
        },
      });
    } else {
      row = await prisma.productAdAvatar.update({
        where: { id: row.id },
        data: { sortOrder: i, isActive: true },
      });
    }

    if (row.imageUrl && row.imageUrl.startsWith("http") && !force) {
      console.log(`· ${s.name} — already has image, skipping`);
      continue;
    }

    try {
      console.log(`→ ${s.name} (${s.nationality} ${s.gender})`);
      const generated = await generate(buildPrompt(s));
      const res = await fetch(generated);
      const buffer = Buffer.from(await res.arrayBuffer());
      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const url = await uploadImage(buffer, `product-ad-avatars/${slug}-${row.id}.jpg`);
      await prisma.productAdAvatar.update({ where: { id: row.id }, data: { imageUrl: url } });
      console.log(`  ✓ ${url}`);
    } catch (e) {
      console.error(`  ✗ ${s.name}:`, e instanceof Error ? e.message : e);
    }
  }

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
