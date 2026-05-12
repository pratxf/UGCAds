import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.ugcads.us";
const STATIC_DATE = new Date("2026-05-12");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_DATE },
    { url: `${BASE_URL}/pricing`, lastModified: STATIC_DATE },
    { url: `${BASE_URL}/about`, lastModified: STATIC_DATE },
    { url: `${BASE_URL}/blog`, lastModified: STATIC_DATE },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_DATE },
    { url: `${BASE_URL}/privacy`, lastModified: new Date("2026-01-01") },
    { url: `${BASE_URL}/terms`, lastModified: new Date("2026-01-01") },
    { url: `${BASE_URL}/refund`, lastModified: new Date("2026-01-01") },
    { url: `${BASE_URL}/acceptable-use`, lastModified: new Date("2026-01-01") },
    { url: `${BASE_URL}/cookies`, lastModified: new Date("2026-01-01") },
  ];

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticPages, ...blogPages];
}
