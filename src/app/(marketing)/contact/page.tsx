import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Contact — UGCAds",
  description: "Get in touch with the UGCAds team. We are here to help.",
};

const channels = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Email support",
    description: "Our team replies within 24 hours on business days.",
    action: "support@ugcads.com",
    href: "mailto:support@ugcads.com",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    ),
    title: "Live chat",
    description: "Chat with us directly from the app dashboard.",
    action: "Open chat",
    href: "/login",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Help center",
    description: "Browse guides, tutorials, and FAQs.",
    action: "Visit help center",
    href: "#",
  },
];

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
            Have a question, a feature request, or just want to say hi? Pick the channel that works best for you.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6">
          {channels.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-7 text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
                {c.icon}
              </div>
              <h3 className="text-base font-semibold text-[#111111]">{c.title}</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{c.description}</p>
              <a
                href={c.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline"
              >
                {c.action}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section className="py-16 px-4 bg-[#F7F7F5]">
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-8 sm:p-12"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-2xl font-bold text-[#111111] mb-8">Send us a message</h2>
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
        </div>
      </section>

      <Footer />
    </>
  );
}
