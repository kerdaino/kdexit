type StatsCardProps = {
  label: string
  value: string | number
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/15 sm:p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">{value}</p>
    </div>
  )
}
