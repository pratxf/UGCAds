import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const templates = await prisma.photoshootTemplate.findMany({
  where: { active: true },
  orderBy: { sortOrder: "asc" },
  select: { name: true, imageUrl: true, prompt: true },
});

let mismatches = 0;
for (const t of templates) {
  // Extract slug from imageUrl e.g. "photoshoot-templates/v3-studio-01.png" → "v3-studio-01"
  const slugMatch = t.imageUrl?.match(/photoshoot-templates\/(v3-[^.]+)/);
  const urlSlug = slugMatch?.[1] ?? "(none)";
  const hasPlaceholder = t.prompt?.includes("[product]");
  if (!hasPlaceholder || !t.imageUrl?.startsWith("http")) {
    console.log(`ISSUE: ${t.name} | urlSlug=${urlSlug} | hasPlaceholder=${hasPlaceholder} | imageUrl=${t.imageUrl?.slice(0,60)}`);
    mismatches++;
  }
}

if (mismatches === 0) {
  console.log(`All ${templates.length} templates: ✓ every record has a valid imageUrl + [product] prompt`);
}

// Show 5 random samples
const samples = templates.sort(() => Math.random() - 0.5).slice(0, 5);
console.log("\nRandom samples:");
for (const t of samples) {
  const slug = t.imageUrl?.match(/photoshoot-templates\/(v3-[^.]+)/)?.[1];
  console.log(`  ${t.name} → ${slug} | prompt: ${t.prompt?.slice(0, 60)}...`);
}

await prisma.$disconnect();
