import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Introducing UGCAds 2.0: Faster, smarter, more human — UGCAds Blog",
  description: "We have completely rebuilt our generation pipeline. Here is everything that is new.",
};

const relatedPosts = [
  {
    slug: "ugc-script-that-converts",
    category: "Guide",
    title: "How to write a UGC script that actually converts",
    date: "May 3, 2026",
    readTime: "7 min read",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600&h=360",
  },
  {
    slug: "skincare-brand-ai-photos",
    category: "Case Study",
    title: "How a skincare brand cut ad spend by 60% using AI product photos",
    date: "Apr 28, 2026",
    readTime: "4 min read",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600&h=360",
  },
  {
    slug: "tiktok-ad-formats-2026",
    category: "Tips",
    title: "5 ad formats that are crushing it on TikTok right now",
    date: "Apr 21, 2026",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=600&h=360",
  },
];

const categoryColors: Record<string, string> = {
  Product: "bg-blue-50 text-[#2563EB]",
  Guide: "bg-green-50 text-[#10B981]",
  "Case Study": "bg-amber-50 text-[#F59E0B]",
  Tips: "bg-purple-50 text-purple-600",
};

export default function BlogPostPage() {
  return (
    <>
      <Navbar />

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
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB] mb-4">
              Product
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
              Introducing UGCAds 2.0: Faster, smarter, more human
            </h1>
            <p className="mt-5 text-lg text-[#6B7280] leading-relaxed">
              We have completely rebuilt our generation pipeline. Here is everything that is new and how it will change the way you create ads.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                alt="Alex Rivera"
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <div className="text-sm font-semibold text-[#111111]">Alex Rivera</div>
                <div className="text-xs text-[#9CA3AF]">CEO &nbsp; May 7, 2026 &nbsp; 5 min read</div>
              </div>
            </div>
          </div>
        </section>

        {/* Cover image */}
        <div className="mx-auto max-w-5xl px-4 -mt-2 pb-12">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=1200&h=500"
              alt="UGCAds 2.0"
              className="w-full object-cover"
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
              .prose-article strong { color: #111111; font-weight: 600; }
              .prose-article blockquote { border-left: 3px solid #2563EB; padding-left: 1.25rem; margin: 1.5rem 0; color: #6B7280; font-style: italic; }
            `}</style>

            <h2>Why we rebuilt everything</h2>
            <p>
              When we launched UGCAds a year ago, we stitched together the best available models and shipped fast. It worked, but cracks started showing. Generation times were unpredictable. Quality was inconsistent across actors. The pipeline could not scale to the volume our users needed.
            </p>
            <p>
              So we went back to the drawing board. Over the past six months, a small team rewrote the entire generation pipeline from scratch, integrating newer and more capable models, rebuilding our queuing system, and rethinking how we handle video, image, and voice tasks.
            </p>

            <h2>What is new in 2.0</h2>

            <h3>Faster generation times</h3>
            <p>
              The average UGC video now completes in under 90 seconds, down from 3 to 5 minutes. Product photoshoots are near-instant for most models. We achieved this by moving to a dedicated GPU cluster and pre-warming the most popular model checkpoints so cold starts are eliminated for 95% of requests.
            </p>

            <h3>Four new video models</h3>
            <p>
              UGC Studio now supports four state-of-the-art video models:
            </p>
            <ul>
              <li><strong>Seedance 2</strong> by ByteDance, up to 15 seconds, best for lifestyle and beauty content</li>
              <li><strong>Sora 2</strong> by OpenAI, up to 20 seconds, unmatched photorealism</li>
              <li><strong>Kling 3.0</strong>, up to 15 seconds, great for product close-ups</li>
              <li><strong>Veo 3.1</strong> by Google, up to 8 seconds, crisp motion and lighting</li>
            </ul>
            <p>
              Each model has different strengths. We recommend Seedance 2 for most UGC content and Sora 2 when you need cinematic quality and have a slightly longer format.
            </p>

            <h3>Five image models for product photoshoots</h3>
            <p>
              Product Photoshoot now offers five models ranging from $3 to $6 per generation. The new <strong>GPT Image 2</strong> integration is our most affordable option and delivers surprisingly strong results for clean, white-background product shots. <strong>Flux 2 Pro</strong> is our premium pick for lifestyle and editorial-style imagery.
            </p>

            <h3>100+ AI actors</h3>
            <p>
              We have expanded the avatar library to over 100 actors across a wide range of ages, ethnicities, and styles. Every actor has been recorded in HD with consistent lighting, so your ads look professional regardless of which one you choose. Custom avatar upload is still available if you want to use your own talent.
            </p>

            <blockquote>
              "We went from spending $800 per video with an agency to generating 10 videos a week for less than the cost of one. The quality difference is barely noticeable." Priya, DTC founder
            </blockquote>

            <h2>What is coming next</h2>
            <p>
              We are working on multi-scene composition so you can chain multiple clips together into a full ad with a single prompt. Voice cloning is also on the roadmap, which will let you upload a voice sample and generate ads in that exact voice.
            </p>
            <p>
              If you have feature requests, reply to this post or email us at <a href="mailto:support@ugcads.us" className="text-[#2563EB] hover:underline">support@ugcads.us</a>. We read every message.
            </p>

            <h2>Try it now</h2>
            <p>
              UGCAds 2.0 is live for all users today. Log in, head to UGC Studio or Product Photoshoot, and you will see the new model options in the dropdown. Your existing credits carry over with no change.
            </p>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8 lg:pt-0">

            {/* Author card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                alt="Alex Rivera"
                className="h-14 w-14 rounded-full object-cover mb-3"
              />
              <div className="text-sm font-semibold text-[#111111]">Alex Rivera</div>
              <div className="text-xs text-[#9CA3AF] mb-3">Co-founder and CEO at UGCAds</div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Building AI tools that make great advertising accessible to every brand, not just the ones with big budgets.
              </p>
            </div>

            {/* Share */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <h4 className="text-sm font-semibold text-[#111111] mb-4">Share this post</h4>
              <div className="flex gap-2">
                {[
                  { label: "X", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label: "LinkedIn", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                ].map((s) => (
                  <button key={s.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <h4 className="text-sm font-semibold text-[#111111] mb-1">Get posts like this</h4>
              <p className="text-xs text-[#6B7280] mb-4">New articles delivered to your inbox weekly.</p>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 mb-2"
              />
              <button className="w-full rounded-xl bg-[#2563EB] py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </aside>
        </div>

        {/* Related posts */}
        <section className="bg-[#F7F7F5] py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-[#111111] mb-8">More from the blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={post.img} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold mb-2 ${categoryColors[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {post.category}
                    </span>
                    <h3 className="text-sm font-semibold text-[#111111] leading-snug group-hover:text-[#2563EB] transition-colors">
                      {post.title}
                    </h3>
                    <div className="mt-auto pt-3 text-xs text-[#9CA3AF]">
                      {post.date} &nbsp; {post.readTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
