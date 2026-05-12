import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoStrip from "@/components/landing/LogoStrip";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import ComparisonTable from "@/components/landing/ComparisonTable";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.ugcads.us" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How long does a video take to generate?", acceptedAnswer: { "@type": "Answer", text: "Most videos are ready in under 2 minutes. Generation time depends on the length of your script and current platform load, but we prioritize speed so you can iterate quickly." } },
    { "@type": "Question", name: "Can AI hold my product?", acceptedAnswer: { "@type": "Answer", text: "Yes. With our Product Ad mode you can upload your product image and the AI character will naturally hold and present it in the video ad." } },
    { "@type": "Question", name: "If I edit an already generated video, will it be considered a new video or take a video credit?", acceptedAnswer: { "@type": "Answer", text: "No. Light edits like trimming or caption changes on an existing generated video do not consume a new credit. Only generating a new video from scratch uses a credit." } },
    { "@type": "Question", name: "What should I do if my video is taking too long to generate?", acceptedAnswer: { "@type": "Answer", text: "If your video has been processing for more than 10 minutes, refresh the page. If it still shows as processing, contact our support team and we will investigate and refund the credit if needed." } },
    { "@type": "Question", name: "How do I upgrade my plan?", acceptedAnswer: { "@type": "Answer", text: "Go to Dashboard, then Billing, then Upgrade Plan. Upgrades take effect immediately and you are billed the prorated difference for the rest of your current billing cycle." } },
    { "@type": "Question", name: "How can I cancel?", acceptedAnswer: { "@type": "Answer", text: "You can cancel anytime from Dashboard, then Billing, then Cancel Subscription. Your plan stays active until the end of the billing period and you will not be charged again." } },
    { "@type": "Question", name: "Are there any limits on the use of ads made with UGCAds?", acceptedAnswer: { "@type": "Answer", text: "You own the ads you create. You can use them on any platform including TikTok, Instagram, Facebook, YouTube, and more for both organic and paid campaigns with no extra licensing fees." } },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://www.ugcads.us/#software",
  name: "UGCAds",
  description: "AI-powered platform to generate UGC-style video ads, product photoshoots, and AI model try-ons in under 2 minutes.",
  url: "https://www.ugcads.us",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  publisher: { "@id": "https://www.ugcads.us/#organization" },
  offers: [
    { "@type": "Offer", name: "Starter", price: "5.00", priceCurrency: "USD", description: "One-time purchase, 25 credits" },
    { "@type": "Offer", name: "Basic", price: "39.00", priceCurrency: "USD", description: "100 credits per month" },
    { "@type": "Offer", name: "Creator", price: "79.00", priceCurrency: "USD", description: "300 credits per month" },
    { "@type": "Offer", name: "Agency", price: "129.00", priceCurrency: "USD", description: "500 credits per month" },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <ComparisonTable />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
