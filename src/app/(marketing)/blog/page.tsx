import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog — UGCAds",
  description: "Tips, tutorials, and insights on AI-powered video ads and creative marketing.",
  alternates: { canonical: "https://www.ugcads.us/blog" },
};

export const revalidate = 60;

const categoryColors: Record<string, string> = {
  Product: "bg-blue-50 text-[#2563EB]",
  Guide: "bg-green-50 text-[#10B981]",
  "Case Study": "bg-amber-50 text-[#F59E0B]",
  Tips: "bg-purple-50 text-purple-600",
};

export default async function BlogPage() {
  const allPosts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true, slug: true, title: true, excerpt: true, category: true,
      coverImage: true, author: true, authorImage: true, readTime: true,
      publishedAt: true, featured: true,
    },
  });

  const featured = allPosts.find((p) => p.featured) ?? allPosts[0];
  const posts = allPosts.filter((p) => p.id !== featured?.id);

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://www.ugcads.us/blog#list",
    name: "UGCAds Blog",
    description: "Tips, tutorials, and insights on AI-powered video ads and creative marketing.",
    url: "https://www.ugcads.us/blog",
    numberOfItems: allPosts.length,
    itemListElement: allPosts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.ugcads.us/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#F6F8FF] pt-28 pb-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            UGCAds Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            Tips, tutorials and{" "}
            <span style={{
              background: "linear-gradient(90deg, #2563EB, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              ad insights
            </span>
          </h1>
          <p className="mt-5 text-lg text-[#6B7280]">
            Everything you need to create ads that convert, straight from the team building the tools.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-5xl space-y-12">

          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-lg"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="aspect-[2/1] overflow-hidden">
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[featured.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {featured.category}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-[#111111] group-hover:text-[#2563EB] transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[#6B7280] leading-relaxed">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-3">
                  {featured.authorImage && (
                    <img src={featured.authorImage} alt={featured.author} className="h-8 w-8 rounded-full object-cover" />
                  )}
                  <div className="text-sm">
                    <span className="font-medium text-[#111111]">{featured.author}</span>
                    <span className="mx-2 text-[#9CA3AF] text-xs">{fmt(featured.publishedAt)}</span>
                    <span className="text-[#9CA3AF] text-xs">{featured.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Post grid */}
          {posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold ${categoryColors[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-[#111111] leading-snug group-hover:text-[#2563EB] transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#6B7280] leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="mt-auto pt-4 text-xs text-[#9CA3AF]">
                      {post.author} &nbsp;{fmt(post.publishedAt)} &nbsp;{post.readTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {allPosts.length === 0 && (
            <p className="text-center text-[#9CA3AF] py-16">No posts yet. Check back soon.</p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
