import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.ugcads.us";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/pricing`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE_URL}/contact`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/refund`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/acceptable-use`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/cookies`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  return [...staticPages, ...blogPages];
}
