import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Contact — UGCAds",
  description: "Get in touch with the UGCAds team. We are here to help.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#F6F8FF] pt-28 pb-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            Get in touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            We would love to{" "}
            <span style={{
              background: "linear-gradient(90deg, #2563EB, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              hear from you
            </span>
          </h1>
          <p className="mt-5 text-lg text-[#6B7280]">
            Have a question, a feature request, or just want to say hi? Send us a message and we will get back to you.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* Contact form */}
          <div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-8 sm:p-10"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-xl font-bold text-[#111111] mb-6">Send us a message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">First name</label>
                  <input
                    type="text"
                    placeholder="Alex"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Last name</label>
                  <input
                    type="text"
                    placeholder="Rivera"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Subject</label>
                <select className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#374151] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20">
                  <option>General question</option>
                  <option>Billing and payments</option>
                  <option>Technical issue</option>
                  <option>Feature request</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Send message
              </button>
            </form>
          </div>

          {/* Details column */}
          <div className="space-y-6">
            {/* Intro */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-2">How we can help</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Whether you have a question about your account, need help with a generation, or want to explore a partnership, we are here. Our team is online Monday through Friday.
              </p>
            </div>

            {/* Contact detail cards */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Email us directly</p>
                  <p className="text-xs text-[#6B7280] mt-0.5 mb-2">We reply within 24 hours on business days.</p>
                  <a href="mailto:support@ugcads.us" className="text-sm font-semibold text-[#2563EB] hover:underline">
                    support@ugcads.us
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#06B6D4]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Live chat in the app</p>
                  <p className="text-xs text-[#6B7280] mt-0.5 mb-2">Log in to get real-time help from our support team.</p>
                  <a href="/login" className="text-sm font-semibold text-[#06B6D4] hover:underline">
                    Open chat
                  </a>
                </div>
              </div>
            </div>

            {/* Response time badge */}
            <div className="rounded-2xl bg-[#F0FDF4] border border-[#D1FAE5] p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-sm font-semibold text-[#065F46]">Typically reply in under 2 hours</p>
              </div>
              <p className="text-xs text-[#047857]">Our team is online Monday through Friday, 9am to 6pm EST.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
