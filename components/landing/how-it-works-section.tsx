export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">How it works</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
          KDEXIT gives traders a clean workflow for planning and managing exit
          strategies before live wallet automation is connected.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-emerald-400">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold">Create a strategy</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Define token, chain, sell percentage, take-profit, stop-loss, and
            slippage.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-emerald-400">Step 2</p>
          <h3 className="mt-2 text-lg font-semibold">Manage intelligently</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Pause, resume, edit, delete, and organize strategies in one place.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-emerald-400">Step 3</p>
          <h3 className="mt-2 text-lg font-semibold">Track activity</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Review execution history and dashboard summaries for visibility.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-emerald-400">Step 4</p>
          <h3 className="mt-2 text-lg font-semibold">Prepare for automation</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            The product is being structured for safe, future non-custodial
            wallet execution.
          </p>
        </div>
      </div>
    </section>
  )
}
