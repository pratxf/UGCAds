import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const user = await requireUser();

  const generations = await prisma.generation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const items = generations.map((g) => ({
    id: g.id,
    title: makeTitle(g.type, g.id),
    type: typeLabel(g.type),
    status: statusLabel(g.status),
    date: formatDate(g.createdAt),
    characterImage: g.characterImage,
    finalUrl: g.finalVideoUrl,
    thumbnailUrl: g.thumbnailUrl,
  }));

  return <HistoryClient items={items} />;
}

function typeLabel(t: string): "UGC Ad" | "Product Ad" | "Product Photoshoot" | "AI Try-On" {
  switch (t) {
    case "PRODUCT_AD": return "Product Ad";
    case "MOCKUP":
    case "PRODUCT_PHOTOSHOOT": return "Product Photoshoot";
    case "TRYON": return "AI Try-On";
    default: return "UGC Ad";
  }
}

function statusLabel(s: string): "Complete" | "Processing" | "Failed" {
  switch (s) {
    case "COMPLETED": return "Complete";
    case "FAILED": return "Failed";
    default: return "Processing";
  }
}

function makeTitle(type: string, id: string) {
  const prefix =
    type === "MOCKUP" || type === "PRODUCT_PHOTOSHOOT" ? "Photoshoot" :
    type === "PRODUCT_AD" ? "Product Ad" :
    type === "TRYON" ? "Try-On" :
    "UGC Ad";
  return `${prefix} #${id.slice(-6).toUpperCase()}`;
}

function formatDate(d: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
