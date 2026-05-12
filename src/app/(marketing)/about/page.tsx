import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "About UGCAds — AI UGC Video Ad Generator for Brands",
  description: "UGCAds is an AI-powered platform that lets any brand create UGC-style video ads, product photos, and AI try-on shots in under 2 minutes. No studio, no actors.",
  alternates: { canonical: "https://www.ugcads.us/about" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ugcads.us" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://www.ugcads.us/about" },
  ],
};

const values = [
  {
    title: "Speed over perfection",
    description: "We believe great ads shouldn't take weeks. Our tools let creators go from idea to live ad in under two minutes.",
  },
  {
    title: "AI that feels human",
    description: "We obsess over authenticity. Every actor, voice, and scene is crafted to feel real so your audience connects.",
  },
  {
    title: "Creators first",
    description: "We build for the solo founder, the small team, the scrappy marketer who needs results without a big budget.",
  },
  {
    title: "Radical transparency",
    description: "No hidden fees, no lock-in. We earn your business every month by actually delivering results.",
  },
];

const team = [
  {
    name: "Alex Rivera",
    role: "Co-founder and CEO",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160&h=160",
  },
  {
    name: "Priya Nair",
    role: "Co-founder and CTO",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=160&h=160",
  },
  {
    name: "Marcus Chen",
    role: "Head of Product",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=160&h=160",
  },
  {
    name: "Sofia Andersen",
    role: "Head of Design",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=160&h=160",
  },
];

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#F6F8FF] pt-28 pb-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            Our story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
            We are on a mission to make great ads{" "}
            <span style={{
              background: "linear-gradient(90deg, #2563EB, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              accessible to everyone
            </span>
          </h1>
          <p className="mt-6 text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
            UGCAds was born from a simple frustration: creating high-quality video ads was slow, expensive, and gatekept by agencies. We built the tools we wished existed.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#111111] tracking-tight">
              Why we built UGCAds
            </h2>
            <p className="mt-4 text-[#6B7280] leading-relaxed">
              Traditional agencies charge $300 to $1,000 for a single video ad and take weeks to deliver. Smaller brands simply couldn't compete.
            </p>
            <p className="mt-4 text-[#6B7280] leading-relaxed">
              We combined the latest AI video and image models into one platform so any brand can generate authentic-looking UGC content in minutes for a fraction of the cost.
            </p>
            <p className="mt-4 text-[#6B7280] leading-relaxed">
              Today, thousands of brands use UGCAds to create content that converts across TikTok, Instagram, YouTube, and beyond.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "10K+", label: "Ads generated" },
              { value: "100+", label: "AI actors" },
              { value: "98%", label: "Cost reduction" },
              { value: "2 min", label: "Average delivery" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center"
              >
                <div className="text-3xl font-bold text-[#2563EB]">{stat.value}</div>
                <div className="mt-1 text-sm text-[#6B7280]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-[#F7F7F5]">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-[#111111] tracking-tight text-center mb-12">
            What we believe in
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <h3 className="text-base font-semibold text-[#111111]">{v.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-[#111111] tracking-tight text-center mb-12">
            The team
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <img
                  src={member.img}
                  alt={member.name}
                  className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-[#E5E7EB]"
                />
                <div className="mt-3 text-sm font-semibold text-[#111111]">{member.name}</div>
                <div className="text-xs text-[#6B7280] mt-0.5">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
