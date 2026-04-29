/* eslint-disable */
// Run: npx tsx scripts/seed-voices.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FEMALE = [
  { name: "Sarah",   voiceId: "kPzsL2i3teMYv0FxEYQ6", descriptor: "Friendly & warm" },
  { name: "Emma",    voiceId: "eXpIbVcVbLo8ZJQDlDnl", descriptor: "Soft & expressive" },
  { name: "Jessica", voiceId: "6u6JbqKdaQy89ENzLSju", descriptor: "Confident & strong" },
  { name: "Lisa",    voiceId: "h2dQOVyUfIDqY2whPOMo", descriptor: "Smooth & calm" },
  { name: "Mia",     voiceId: "kdnRe2koJdOK4Ovxn2DI", descriptor: "Energetic & bright" },
  { name: "Zoe",     voiceId: "WzsP0bfiCpSDfNgLrUuN", descriptor: "Warm & natural" },
  { name: "Ava",     voiceId: "WAhoMTNdLdMoq1j3wf3I", descriptor: "Clear & professional" },
  { name: "Lily",    voiceId: "uYXf8XasLslADfZ2MB4u", descriptor: "Youthful & fun" },
  { name: "Grace",   voiceId: "56AoDkrOh6qfVPDXZ7Pt", descriptor: "Elegant & polished" },
  { name: "Chloe",   voiceId: "eR40ATw9ArzDf9h3v7t7", descriptor: "Bright & cheerful" },
];

const MALE = [
  { name: "James",  voiceId: "L0Dsvb3SLTyegXwtm47J", descriptor: "Deep & trustworthy" },
  { name: "Marcus", voiceId: "c6SfcYrb2t09NHXiT80T", descriptor: "Bold & confident" },
  { name: "Ryan",   voiceId: "RXZGC6H41rpnXBWuHTQD", descriptor: "Casual & relatable" },
  { name: "Noah",   voiceId: "yl2ZDV1MzN4HbQJbMihG", descriptor: "Smooth & engaging" },
  { name: "Ethan",  voiceId: "UgBBYS2sOqTuMpoF3BR0", descriptor: "Energetic & young" },
  { name: "Liam",   voiceId: "q0IMILNRPxOgtBTS4taI", descriptor: "Warm & friendly" },
  { name: "Tyler",  voiceId: "rPMkKgdwgIwqv4fXgR6N", descriptor: "Sharp & direct" },
  { name: "Alex",   voiceId: "aKUMgdkpitgitOAQ9gZN", descriptor: "Natural & conversational" },
  { name: "Cole",   voiceId: "4e32WqNVWRquDa1OcRYZ", descriptor: "Rich & authoritative" },
  { name: "Jordan", voiceId: "Q1QcmfZPmFDVUWmzASdy", descriptor: "Upbeat & modern" },
];

async function main() {
  let i = 0;
  for (const v of FEMALE) {
    await prisma.voice.upsert({
      where: { voiceId: v.voiceId },
      update: { name: v.name, descriptor: v.descriptor, gender: "female", sortOrder: i },
      create: {
        name: v.name,
        gender: "female",
        voiceId: v.voiceId,
        descriptor: v.descriptor,
        previewUrl: "", // populated by separate generator
        sortOrder: i,
      },
    });
    i++;
  }
  i = 0;
  for (const v of MALE) {
    await prisma.voice.upsert({
      where: { voiceId: v.voiceId },
      update: { name: v.name, descriptor: v.descriptor, gender: "male", sortOrder: i },
      create: {
        name: v.name,
        gender: "male",
        voiceId: v.voiceId,
        descriptor: v.descriptor,
        previewUrl: "",
        sortOrder: i,
      },
    });
    i++;
  }
  console.log(`Seeded ${FEMALE.length + MALE.length} voices.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
