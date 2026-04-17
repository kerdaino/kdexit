type ActionFeedbackProps = {
  message: string
}

export default function ActionFeedback({ message }: ActionFeedbackProps) {
  if (!message) return null

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      {message}
    </div>
  )
}