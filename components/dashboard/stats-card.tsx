type StatsCardProps = {
  label: string
  value: string | number
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/15">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}