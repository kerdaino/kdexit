export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold">Built for clarity and control</h2>
          <p className="mt-4 text-gray-400">
            KDEXIT is being designed as a serious product, not a hype bot.
            The focus is structure, usability, and safe automation planning.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold text-white">Strategy management</h3>
            <p className="mt-2 text-sm text-gray-400">
              Create, edit, pause, resume, and delete strategies from one
              dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold text-white">Persistent dashboard</h3>
            <p className="mt-2 text-sm text-gray-400">
              Strategy data and activity history remain available after refresh.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold text-white">Execution history</h3>
            <p className="mt-2 text-sm text-gray-400">
              Every meaningful action is reflected in activity logs for better
              product feedback.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold text-white">Future wallet layer</h3>
            <p className="mt-2 text-sm text-gray-400">
              Wallet integration will be added only when the workflow and risk
              model are ready.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}