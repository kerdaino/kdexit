type SectionHeadingProps = {
  title: string
  description?: string
}

export default function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      ) : null}
    </div>
  )
}