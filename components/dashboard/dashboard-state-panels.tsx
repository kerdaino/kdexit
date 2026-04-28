type DashboardLoadingStateProps = {
  message?: string
}

type DashboardFailedRequestPanelProps = {
  eyebrow?: string
  title?: string
  description?: string
  issues: Array<{
    resource: string
    message: string
  }>
  onRetry?: () => void
}

export function DashboardLoadingState({
  message = "Loading dashboard...",
}: DashboardLoadingStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="animate-pulse space-y-5">
        <div className="h-3 w-32 rounded-full bg-white/10" />
        <div className="h-8 w-64 max-w-full rounded-full bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl border border-white/10 bg-black/20"
            />
          ))}
        </div>
        <div className="h-40 rounded-2xl border border-white/10 bg-black/20" />
      </div>
      <p className="mt-5 text-sm text-gray-400">{message}</p>
    </div>
  )
}

export function DashboardFailedRequestPanel({
  eyebrow = "Partial Load",
  title = "Some dashboard data could not be loaded.",
  description = "Existing sections stay visible where data is available. Retry when the connection or backend service is healthy again.",
  issues,
  onRetry,
}: DashboardFailedRequestPanelProps) {
  if (issues.length === 0) {
    return null
  }

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-200">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-100/80">
            {description}
          </p>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/20 bg-black/20 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-black/30"
          >
            Retry
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3">
        {issues.map((issue) => (
          <div
            key={`${issue.resource}-${issue.message}`}
            className="rounded-2xl border border-amber-300/20 bg-black/20 px-4 py-3 text-sm leading-6 text-amber-100"
          >
            <span className="font-semibold text-white">{issue.resource}:</span>{" "}
            {issue.message}
          </div>
        ))}
      </div>
    </div>
  )
}
