import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Blog — UGCAds",
  description: "Tips, tutorials, and insights on AI-powered video ads and creative marketing.",
};

const featured = {
  slug: "ugcads-2-0-faster-smarter-more-human",
  category: "Product",
  title: "Introducing UGCAds 2.0: Faster, smarter, more human",
  excerpt:
    "We have completely rebuilt our generation pipeline. Here is everything that is new and how it will change the way you create ads.",
  author: "Alex Rivera",
  authorRole: "CEO",
  authorImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
  date: "May 7, 2026",
  readTime: "5 min read",
  img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=1200&h=600",
};

const posts = [
  {
    slug: "#",
    category: "Guide",
    title: "How to write a UGC script that actually converts",
    excerpt: "The best AI actors in the world won't save a bad script. Here is a proven framework for writing hooks that stop the scroll.",
    author: "Sofia Andersen",
    date: "May 3, 2026",
    readTime: "7 min read",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600&h=360",
  },
  {
    slug: "#",
    category: "Case Study",
    title: "How a skincare brand cut ad spend by 60% using AI product photos",
    excerpt: "Studio shoots were costing them $2,000 a month. They switched to UGCAds and never looked back.",
    author: "Marcus Chen",
    date: "Apr 28, 2026",
    readTime: "4 min read",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600&h=360",
  },
  {
    slug: "#",
    category: "Tips",
    title: "5 ad formats that are crushing it on TikTok right now",
    excerpt: "TikTok's algorithm rewards novelty. These five formats are getting outsized reach in 2026.",
    author: "Priya Nair",
    date: "Apr 21, 2026",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=600&h=360",
  },
  {
    slug: "#",
    category: "Guide",
    title: "AI Try-On for fashion brands: a complete walkthrough",
    excerpt: "A step-by-step look at how to use the AI Try-On feature to generate on-model product shots at scale.",
    author: "Sofia Andersen",
    date: "Apr 14, 2026",
    readTime: "8 min read",
    img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600&h=360",
  },
  {
    slug: "#",
    category: "Product",
    title: "New: Veo 3.1 and Sora 2 are now available in UGC Studio",
    excerpt: "We added two of the most powerful video models on the market. Here is how to choose the right one for your use case.",
    author: "Alex Rivera",
    date: "Apr 9, 2026",
    readTime: "3 min read",
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600&h=360",
  },
];

const categoryColors: Record<string, string> = {
  Product: "bg-blue-50 text-[#2563EB]",
  Guide: "bg-green-50 text-[#10B981]",
  "Case Study": "bg-amber-50 text-[#F59E0B]",
  Tips: "bg-purple-50 text-purple-600",
};

export default function BlogPage() {
  return (
    <>
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
          <Link
            href={featured.slug}
            className="group block overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-lg"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <div className="aspect-[2/1] overflow-hidden">
              <img
                src={featured.img}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[featured.category]}`}>
                {featured.category}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-[#111111] group-hover:text-[#2563EB] transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="mt-3 text-[#6B7280] leading-relaxed">{featured.excerpt}</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={featured.authorImg} alt={featured.author} className="h-8 w-8 rounded-full object-cover" />
                <div className="text-sm">
                  <span className="font-medium text-[#111111]">{featured.author}</span>
                  <span className="mx-1.5 text-[#D1D5DB]">·</span>
                  <span className="text-[#9CA3AF]">{featured.date}</span>
                  <span className="mx-1.5 text-[#D1D5DB]">·</span>
                  <span className="text-[#9CA3AF]">{featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.title}
                href={post.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.img}
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
                  <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-[#F7F7F5]">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-[#111111]">Stay in the loop</h2>
          <p className="mt-3 text-[#6B7280]">Get new posts, product updates, and ad tips delivered to your inbox.</p>
          <form className="mt-6 flex gap-2 flex-col sm:flex-row">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
