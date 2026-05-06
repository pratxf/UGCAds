import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";

export default function PricingPage() {
  return (
    <>
      <Navbar />

      {/* Hero section */}
      <section className="relative pt-32 pb-16 px-6 bg-[#F7F7F5]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#111111] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto">
            Choose the plan that works for you. No hidden fees, no surprises. Upgrade or downgrade
            at any time.
          </p>
        </div>
      </section>

      {/* Pricing component */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </>
  );
}
