import HeroSection from "@/components/landing/hero-section"
import ProblemSection from "@/components/landing/problem-section"
import HowItWorksSection from "@/components/landing/how-it-works-section"
import FeaturesSection from "@/components/landing/features-section"
import TrustSection from "@/components/landing/trust-section"
import FinalCtaSection from "@/components/landing/final-cta-section"
import Footer from "@/components/shared/footer"
import TopNavigation from "@/components/shared/top-navigation"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <TopNavigation variant="landing" />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TrustSection />
      <FinalCtaSection />
      <Footer />
    </main>
  )
}
