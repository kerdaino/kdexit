import Footer from "@/components/shared/footer"
import TopNavigation from "@/components/shared/top-navigation"

type AuthPageShellProps = {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}

export default function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <TopNavigation variant="landing" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.12),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-gray-400">{description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-gray-400">Phase</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Secure beta foundation
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">Method</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Email and password first
                </p>
              </div>
            </div>
          </div>

          <div>{children}</div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
