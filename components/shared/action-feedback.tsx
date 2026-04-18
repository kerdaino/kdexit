type ActionFeedbackProps = {
  message: string
  tone?: "success" | "error"
}

export default function ActionFeedback({
  message,
  tone = "success",
}: ActionFeedbackProps) {
  if (!message) return null

  const toneClassName =
    tone === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClassName}`}>
      {message}
    </div>
  )
}
