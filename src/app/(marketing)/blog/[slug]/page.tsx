import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ShareButtons from "@/components/blog/ShareButtons";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true }, select: { title: true, excerpt: true } });
  if (!post) return {};
  return {
    title: `${post.title} — UGCAds Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://www.ugcads.us/blog/${slug}`,
    },
  };
}

const categoryColors: Record<string, string> = {
  Product: "bg-blue-50 text-[#2563EB]",
  Guide: "bg-green-50 text-[#10B981]",
  "Case Study": "bg-amber-50 text-[#F59E0B]",
  Tips: "bg-purple-50 text-purple-600",
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  const relatedPosts = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, category: true, coverImage: true, publishedAt: true, readTime: true },
  });

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const postUrl = `https://www.ugcads.us/blog/${post.slug}`;

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: { "@type": "ImageObject", url: post.coverImage, width: 1200, height: 630 },
            url: postUrl,
            inLanguage: "en-US",
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: {
              "@type": "Person",
              name: post.author,
              ...(post.authorRole && { jobTitle: post.authorRole }),
              ...(post.authorImage && { image: { "@type": "ImageObject", url: post.authorImage } }),
            },
            publisher: { "@id": "https://www.ugcads.us/#organization" },
            mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ugcads.us" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.ugcads.us/blog" },
                { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
              ],
            },
            isPartOf: {
              "@type": "Blog",
              "@id": "https://www.ugcads.us/blog",
              name: "UGCAds Blog",
              publisher: { "@id": "https://www.ugcads.us/#organization" },
            },
          }),
        }}
      />

      <main className="bg-white">
        {/* Hero */}
        <section className="pt-24 pb-12 px-4 bg-[#F6F8FF]">
          <div className="mx-auto max-w-3xl">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#2563EB] transition-colors mb-6">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Blog
            </Link>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4 ${categoryColors[post.category] ?? "bg-gray-100 text-gray-600"}`}>
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-[#6B7280] leading-relaxed">
              {post.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {post.authorImage && (
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
              <div>
                <div className="text-sm font-semibold text-[#111111]">{post.author}</div>
                <div className="text-xs text-[#9CA3AF]">
                  {post.authorRole && <>{post.authorRole} &nbsp;</>}
                  {fmt(post.publishedAt)} &nbsp; {post.readTime}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cover image */}
        <div className="mx-auto max-w-5xl px-4 -mt-2 pb-12">
          <div className="overflow-hidden rounded-2xl shadow-lg bg-[#F6F8FF] flex items-center justify-center">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Content + sidebar */}
        <div className="mx-auto max-w-5xl px-4 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

          {/* Article body */}
          <article className="prose-article">
            <style>{`
              .prose-article h2 { font-size: 1.375rem; font-weight: 700; color: #111111; margin-top: 2.5rem; margin-bottom: 0.75rem; }
              .prose-article h3 { font-size: 1.125rem; font-weight: 600; color: #111111; margin-top: 2rem; margin-bottom: 0.5rem; }
              .prose-article p { font-size: 1rem; color: #374151; line-height: 1.8; margin-bottom: 1.25rem; }
              .prose-article ul { list-style: disc; padding-left: 1.5rem; color: #374151; line-height: 1.8; margin-bottom: 1.25rem; }
              .prose-article ul li { margin-bottom: 0.4rem; }
              .prose-article ol { list-style: decimal; padding-left: 1.5rem; color: #374151; line-height: 1.8; margin-bottom: 1.25rem; }
              .prose-article ol li { margin-bottom: 0.4rem; }
              .prose-article strong { color: #111111; font-weight: 600; }
              .prose-article a { color: #2563EB; text-decoration: underline; }
              .prose-article blockquote { border-left: 3px solid #2563EB; padding-left: 1.25rem; margin: 1.5rem 0; color: #6B7280; font-style: italic; }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Sidebar */}
          <aside className="space-y-8 lg:pt-0">

            {/* Author card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
              {post.authorImage && (
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="h-14 w-14 rounded-full object-cover mb-3"
                />
              )}
              <div className="text-sm font-semibold text-[#111111]">{post.author}</div>
              {post.authorRole && <div className="text-xs text-[#9CA3AF] mb-3">{post.authorRole} at UGCAds</div>}
            </div>

            {/* Share */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <h4 className="text-sm font-semibold text-[#111111] mb-4">Share this post</h4>
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-[#F7F7F5] py-16 px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-xl font-bold text-[#111111] mb-8">More from the blog</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-video overflow-hidden bg-[#F6F8FF] flex items-center justify-center">
                      <img src={related.coverImage} alt={related.title} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold mb-2 ${categoryColors[related.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {related.category}
                      </span>
                      <h3 className="text-sm font-semibold text-[#111111] leading-snug group-hover:text-[#2563EB] transition-colors">
                        {related.title}
                      </h3>
                      <div className="mt-auto pt-3 text-xs text-[#9CA3AF]">
                        {fmt(related.publishedAt)} &nbsp; {related.readTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
