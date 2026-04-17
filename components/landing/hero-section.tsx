import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center">
      <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-gray-300">
        Non-custodial auto-sell protection for DEX users
      </div>

      <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
        Auto-protect your trades while you sleep.
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base text-gray-400 md:text-lg">
        KDEXIT helps traders manage take-profit and stop-loss strategies with a
        clean dashboard built for control, visibility, and future automation.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/dashboard"
          className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:opacity-90"
        >
          Open Dashboard
        </Link>

        <a
          href="#how-it-works"
          className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
        >
          Learn More
        </a>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        No seed phrase collection. No private key access. User-first design.
      </p>
    </section>
  )
}