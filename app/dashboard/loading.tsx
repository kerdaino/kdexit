import { DashboardLoadingState } from "@/components/dashboard/dashboard-state-panels"
import Footer from "@/components/shared/footer"
import TopNavigation from "@/components/shared/top-navigation"

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <TopNavigation variant="dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <DashboardLoadingState message="Preparing dashboard workspace..." />
      </div>
      <Footer />
    </main>
  )
}
