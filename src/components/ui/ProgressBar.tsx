interface Props {
  current: number
  total: number
  t: (key: string, vars?: Record<string, string | number>) => string
}

export default function ProgressBar({ current, total, t }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">
          {t('learning.progress', { current, total })}
        </span>
        <span className="text-xs font-semibold text-blue-500">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
