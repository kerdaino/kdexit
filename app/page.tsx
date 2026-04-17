import HeroSection from "@/components/landing/hero-section"
import ProblemSection from "@/components/landing/problem-section"
import HowItWorksSection from "@/components/landing/how-it-works-section"
import FeaturesSection from "@/components/landing/features-section"
import TrustSection from "@/components/landing/trust-section"
import FinalCtaSection from "@/components/landing/final-cta-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TrustSection />
      <FinalCtaSection />
    </main>
  )
}