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

export default function HomePage() {
  return (
    <>
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
