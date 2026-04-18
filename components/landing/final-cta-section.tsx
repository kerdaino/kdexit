import Link from "next/link"

export default function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 text-center sm:px-6 sm:pb-24">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 sm:p-10">
        <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
          Start building your strategy workflow.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
          Open the dashboard to create strategies, manage rules, and explore
          the product foundation we’re building.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:opacity-90 sm:w-auto"
        >
          Go to Dashboard
        </Link>
      </div>
    </section>
  )
}
