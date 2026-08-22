import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductDemo from "@/components/landing/ProductDemo";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import LearningLoop from "@/components/landing/LearningLoop";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

// Public marketing landing page. Deliberately independent of the
// authenticated app's light theme/Sidebar (see components/AppShell.js) —
// this is a dark, product-first page for signed-out visitors.
export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060a] text-neutral-50">
      {/* ambient blue/violet background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-700/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-blue-700/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 -left-40 h-[26rem] w-[26rem] rounded-full bg-violet-700/15 blur-[120px]"
      />

      <div className="relative">
        <Navbar />
        <Hero />
        <ProductDemo />
        <FeatureShowcase />
        <HowItWorks />
        <LearningLoop />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}
