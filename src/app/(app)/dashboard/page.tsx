import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requireUser();

  // Fetch user's real generations + stats
  const [recentGenerations, totalAds, thisMonthCount, weeklyCounts] = await Promise.all([
    prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.generation.count({ where: { userId: user.id } }),
    prisma.generation.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    getWeeklyCounts(user.id),
  ]);

  // Get plan info
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const creditsTotal = subscription?.monthlyCredits ?? 0;

  return (
    <DashboardClient
      userName={user.name?.split(" ")[0] || "there"}
      credits={user.credits}
      creditsTotal={creditsTotal}
      totalAds={totalAds}
      thisMonthCount={thisMonthCount}
      weeklyData={weeklyCounts}
      recentGenerations={recentGenerations.map((g) => ({
        id: g.id,
        title: makeTitle(g.type, g.id),
        type: typeLabel(g.type),
        status: statusLabel(g.status),
        date: formatDate(g.createdAt),
        characterImage: g.characterImage,
        thumbnailUrl: g.thumbnailUrl || g.finalVideoUrl,
      }))}
    />
  );
}

async function getWeeklyCounts(userId: string) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const result = await Promise.all(
    days.map(async (day, i) => {
      const start = new Date(startOfWeek);
      start.setDate(startOfWeek.getDate() + i);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      const count = await prisma.generation.count({
        where: {
          userId,
          createdAt: { gte: start, lt: end },
        },
      });
      return { day, value: count };
    })
  );
  return result;
}

function typeLabel(t: string) {
  switch (t) {
    case "UGC_AD": return "UGC Ad";
    case "PRODUCT_AD": return "Product Ad";
    case "MOCKUP": return "AI Photoshoot";
    default: return t;
  }
}

function statusLabel(s: string) {
  switch (s) {
    case "COMPLETED": return "Complete";
    case "FAILED": return "Failed";
    case "PENDING":
    case "GENERATING_SCENE":
    case "GENERATING_AUDIO":
    case "GENERATING_VIDEO":
    case "SYNCING_LIPS":
      return "Processing";
    default: return s;
  }
}

function makeTitle(type: string, id: string) {
  const prefix = type === "MOCKUP" ? "Photoshoot" : type === "PRODUCT_AD" ? "Product Ad" : "UGC Ad";
  return `${prefix} #${id.slice(-6).toUpperCase()}`;
}

function formatDate(d: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
