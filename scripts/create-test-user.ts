import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_EMAIL = "test@ugcads.us";
const TEST_PASSWORD = "TestUser123!";
const TEST_PLAN = "CREATOR" as const;

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error("Missing Supabase env vars");
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const prisma = new PrismaClient();

  console.log("→ Creating Supabase auth user...");

  // Create or fetch existing
  let supabaseUserId: string;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Test User" },
  });

  if (createErr) {
    if (createErr.message.includes("already") || createErr.message.includes("exist")) {
      console.log("→ User already exists, fetching...");
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list.users.find((u) => u.email === TEST_EMAIL);
      if (!existing) throw createErr;
      supabaseUserId = existing.id;
    } else {
      throw createErr;
    }
  } else {
    supabaseUserId = created.user.id;
  }

  console.log(`✓ Supabase user: ${supabaseUserId}`);

  // Upsert Prisma User
  console.log("→ Syncing Prisma User...");
  const dbUser = await prisma.user.upsert({
    where: { supabaseId: supabaseUserId },
    create: {
      supabaseId: supabaseUserId,
      email: TEST_EMAIL,
      name: "Test User",
      credits: 300, // 30.0 credits in tenths
      role: "USER",
    },
    update: { credits: 300 },
  });
  console.log(`✓ Prisma user: ${dbUser.id}`);

  // Upsert Subscription
  console.log("→ Creating Subscription...");
  const now = new Date();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await prisma.subscription.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      plan: TEST_PLAN,
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      monthlyCredits: 300,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      provider: "DODO",
      providerSubId: "test_sub_creator_001",
    },
    update: {
      plan: TEST_PLAN,
      status: "ACTIVE",
      monthlyCredits: 300,
      currentPeriodEnd: periodEnd,
    },
  });
  console.log(`✓ Subscription: ${TEST_PLAN}`);

  // Initial transaction record
  await prisma.transaction.create({
    data: {
      userId: dbUser.id,
      type: "SUBSCRIPTION",
      status: "COMPLETED",
      credits: 300, // 30.0 credits in tenths
      amountCents: 7900,
      currency: "USD",
      provider: "DODO",
      description: "Test Creator Plan signup",
    },
  });

  console.log("\n========================================");
  console.log("✅ Test user ready!");
  console.log("----------------------------------------");
  console.log(`Email:    ${TEST_EMAIL}`);
  console.log(`Password: ${TEST_PASSWORD}`);
  console.log(`Plan:     ${TEST_PLAN}`);
  console.log(`Credits:  30`);
  console.log("========================================\n");
  console.log("Login at: https://ugcads.us/login");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
