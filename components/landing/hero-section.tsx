import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-gray-300 sm:text-sm">
        Non-custodial auto-sell protection for DEX users
      </div>

      <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
        Auto-protect your trades while you sleep.
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:mt-6 sm:text-base md:text-lg">
        KDEXIT helps traders manage take-profit and stop-loss strategies with a
        clean dashboard built for control, visibility, and future automation.
      </p>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:opacity-90"
        >
          Open Dashboard
        </Link>

        <a
          href="#how-it-works"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
        >
          Learn More
        </a>
      </div>

      <p className="mt-4 text-xs text-gray-500 sm:text-sm">
        No seed phrase collection. No private key access. User-first design.
      </p>
    </section>
  )
}
