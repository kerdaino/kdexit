export default function ProblemSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold sm:text-xl">Missed exits</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Crypto moves fast. Manual exits are easy to miss when you are away
            from the market.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold sm:text-xl">Emotional decisions</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Traders often react too late, take profit too early, or fail to
            manage downside risk properly.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold sm:text-xl">Need for control</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            A serious trading tool should give visibility, structure, and
            better execution planning.
          </p>
        </div>
      </div>
    </section>
  )
}
