import TodaySummary from '../components/stats/TodaySummary'
import HeatmapCalendar from '../components/stats/HeatmapCalendar'
import CategoryPie from '../components/stats/CategoryPie'
import { useTaskStore } from '../store/taskStore'

export default function StatsPage() {
  const { tasks } = useTaskStore()
  const total = tasks.length
  const done = tasks.filter((t) => t.completed).length
  const rate = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-full px-5 pt-10 pb-28">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-ink-100">数据统计</h1>

        <div className="mb-5">
          <TodaySummary />
        </div>

        <div className="mb-5">
          <HeatmapCalendar />
        </div>

        {/* 饼图 + 完成率：桌面并排 */}
        <div className="mb-5 md:grid md:grid-cols-2 md:gap-5">
          <div className="mb-5 md:mb-0">
            <CategoryPie />
          </div>

          {/* 任务完成率 */}
          <div className="rounded-2xl card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink-200">任务完成率</h3>
              <span className="font-mono text-sm text-tomato-400">{rate}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink-600">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tomato-500 to-tomato-400 transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">
              已完成 {done} / {total} 项任务
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
