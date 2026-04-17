import Link from "next/link"

export default function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10">
        <h2 className="text-3xl font-bold md:text-4xl">
          Start building your strategy workflow.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">
          Open the dashboard to create strategies, manage rules, and explore
          the product foundation we’re building.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </section>
  )
}