import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";

export const metadata: Metadata = {
  title: "UGCAds Pricing: AI UGC Video Ads from $5",
  description:
    "Start creating AI UGC video ads from $5. No subscription required. Basic from $39/mo, Creator $79/mo, Agency $129/mo. Cancel anytime.",
  alternates: { canonical: "https://www.ugcads.us/pricing" },
  openGraph: {
    title: "UGCAds Pricing: AI UGC Video Ads from $5",
    description:
      "Start creating AI UGC video ads from $5. No subscription required. Basic from $39/mo, Creator $79/mo, Agency $129/mo.",
    url: "https://www.ugcads.us/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />

      {/* Pricing component */}
      <Pricing headingAs="h1" />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </>
  );
}
