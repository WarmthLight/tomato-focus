import { useEffect, useState } from 'react'
import { statsApi } from '../../api/stats'
import type { TodayStats } from '../../types'

export default function TodaySummary() {
  const [data, setData] = useState<TodayStats | null>(null)

  useEffect(() => {
    statsApi.today().then(setData).catch(console.error)
  }, [])

  if (!data) {
    return <div className="h-28 animate-pulse rounded-2xl bg-ink-700/60" />
  }

  const hours = Math.floor(data.focusMinutes / 60)
  const mins = data.focusMinutes % 60

  const cards = [
    { label: '今日番茄', value: data.pomodoros, unit: '个', color: 'text-tomato-400' },
    {
      label: '专注时长',
      value: hours > 0 ? `${hours}h${mins}m` : `${mins}m`,
      unit: '',
      color: 'text-mint-400',
    },
    { label: '完成任务', value: data.completedTasks, unit: '项', color: 'text-blue-400' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl card p-4 text-center transition-colors hover:bg-ink-700/80"
        >
          <div className={`font-mono text-2xl font-bold ${c.color}`}>
            {c.value}
            <span className="ml-0.5 text-sm text-ink-400">{c.unit}</span>
          </div>
          <div className="mt-1 text-xs text-ink-400">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
