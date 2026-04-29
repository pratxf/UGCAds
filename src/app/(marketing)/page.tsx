import { Banner } from "@/components/ui/banner";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoStrip from "@/components/landing/LogoStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import ComparisonTable from "@/components/landing/ComparisonTable";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Banner
        variant="rainbow"
        className="bg-transparent"
        rainbowColors={[
          "rgba(110,231,183,0.5)",
          "rgba(167,139,250,0.5)",
          "transparent",
          "rgba(110,231,183,0.5)",
          "transparent",
          "rgba(167,139,250,0.5)",
          "transparent",
        ]}
      >
        🚀 Create professional AI video ads in minutes. Get started today!
      </Banner>
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <ComparisonTable />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
