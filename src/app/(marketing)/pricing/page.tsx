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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ugcads.us" },
                { "@type": "ListItem", position: 2, name: "Pricing", item: "https://www.ugcads.us/pricing" },
              ],
            },
            {
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
            },
          ]),
        }}
      />
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
