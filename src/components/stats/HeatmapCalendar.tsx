import { useEffect, useState } from 'react'
import { statsApi } from '../../api/stats'
import type { DailyStat } from '../../types'

function heatColor(count: number): string {
  if (count === 0) return '#2E2E35'
  if (count <= 2) return '#FF9B93'
  if (count <= 4) return '#FF6B60'
  if (count <= 6) return '#FF5A4F'
  return '#ED3E33'
}

export default function HeatmapCalendar() {
  const [data, setData] = useState<DailyStat[]>([])
  const [days, setDays] = useState(35)

  useEffect(() => {
    // 先获取默认35天，检测连续打卡天数，如果超过默认天数则自动扩展
    statsApi.daily(35).then((initial) => {
      setData(initial)

      // 计算从最后一天往前连续有番茄的天数
      let streak = 0
      for (let i = initial.length - 1; i >= 0; i--) {
        if (initial[i].count > 0) streak++
        else break
      }

      // 如果连续天数 >= 默认天数的 80%，扩展到 streak + 30 天
      if (streak >= Math.floor(35 * 0.8)) {
        const expandedDays = streak + 30
        setDays(expandedDays)
        statsApi.daily(expandedDays).then(setData).catch(console.error)
      }
    }).catch(console.error)
  }, [])

  if (data.length === 0) {
    return <div className="h-40 animate-pulse rounded-2xl bg-ink-700/60" />
  }

  // 补齐到整周
  const padded = [...data]
  while (padded.length % 7 !== 0) {
    padded.unshift({ date: '', timestamp: 0, count: -1 })
  }

  // 按周排列
  const weeks: DailyStat[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="rounded-2xl card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-200">打卡热力图</h3>
        <span className="text-xs text-ink-400">最近 {data.length} 天</span>
      </div>

      <div className="flex gap-1">
        {/* 星期标签 */}
        <div className="flex flex-col gap-1 pr-1">
          {weekdayLabels.map((d, i) => (
            <div
              key={d}
              className="flex h-5 items-center text-[10px] text-ink-400"
              style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 热力格子 */}
        <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  title={
                    day.count >= 0 ? `${day.date} · ${day.count} 个番茄` : ''
                  }
                  className="h-5 w-5 flex-shrink-0 rounded-sm transition-transform hover:scale-125"
                  style={{
                    backgroundColor: day.count >= 0 ? heatColor(day.count) : 'transparent',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-ink-400">
        <span>少</span>
        {[0, 1, 3, 5, 7].map((c) => (
          <div
            key={c}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: heatColor(c) }}
          />
        ))}
        <span>多</span>
      </div>

      {days > 35 && (
        <p className="mt-2 text-[10px] text-tomato-400">
          连续打卡超过默认范围，已自动扩展至 {days} 天
        </p>
      )}
    </div>
  )
}
