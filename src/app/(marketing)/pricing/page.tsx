import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";

export default function PricingPage() {
  return (
    <>
      <Navbar />

      {/* Hero section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#FAFAFA] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#888888] max-w-xl mx-auto">
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
