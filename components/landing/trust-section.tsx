export default function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-bold">Why this matters</h2>
          <p className="mt-4 text-gray-400">
            Most traders do not just need a tool that “does something.”
            They need a workflow that helps them act with more discipline and
            less emotional pressure.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-bold">Security direction</h2>
          <p className="mt-4 text-gray-400">
            KDEXIT is being planned around non-custodial principles. That
            means no seed phrase requests, no secret-key collection, and no
            rushed wallet logic before the product flow is solid.
          </p>
        </div>
      </div>
    </section>
  )
}