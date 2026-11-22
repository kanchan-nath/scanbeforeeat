import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ScanDemo } from "@/components/demo/ScanDemo";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { SoftwareAppSchema } from "@/components/seo/JsonLd";

export default function HomePage() {
  return (
    <>
      {/* Schema.org Structured Data for Google Rich Snippets */}
      <SoftwareAppSchema />

      <Navbar />

      <main className="min-h-screen">
        <Hero />
        <ScanDemo />
        <FeatureGrid />
        <ComparisonSection />
        <PricingSection />
        <CtaBanner />
      </main>

      <Footer />
    </>
  );
}
