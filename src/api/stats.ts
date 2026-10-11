import type { DailyStat, TodayStats } from '../types'
import { useRecordsStore } from '../store/recordsStore'
import { useTaskStore } from '../store/taskStore'
import { startOfDay, isSameDay, formatDate } from '../utils/date'

export interface PieSlice {
  taskId: string | null
  title: string | null
  categoryId: string | null
  minutes: number
  count: number
}

// 从本地数据现算统计，保持与原后端接口一致
export const statsApi = {
  today: async (): Promise<TodayStats> => {
    const { records } = useRecordsStore.getState()
    const { tasks } = useTaskStore.getState()
    const now = Date.now()

    const todayRecords = records.filter(
      (r) => r.type === 'focus' && isSameDay(r.endedAt, now),
    )
    const pomodoros = todayRecords.length
    const focusMinutes = todayRecords.reduce((s, r) => s + r.duration, 0)
    const completedTasks = tasks.filter(
      (t) => t.completed && t.completedAt && isSameDay(t.completedAt, now),
    ).length

    return { pomodoros, focusMinutes, completedTasks }
  },

  daily: async (days = 30): Promise<DailyStat[]> => {
    const { records } = useRecordsStore.getState()
    const today = startOfDay(Date.now())
    const dayMs = 24 * 60 * 60 * 1000

    const result: DailyStat[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = today - i * dayMs
      const count = records.filter(
        (r) => r.type === 'focus' && startOfDay(r.endedAt) === dayStart,
      ).length
      result.push({
        date: formatDate(dayStart),
        timestamp: dayStart,
        count,
      })
    }
    return result
  },

  pie: async (): Promise<PieSlice[]> => {
    const { records } = useRecordsStore.getState()
    const { tasks } = useTaskStore.getState()
    const now = Date.now()

    // 今日专注记录按 taskId 聚合
    const todayRecords = records.filter(
      (r) => r.type === 'focus' && isSameDay(r.endedAt, now),
    )
    const grouped = new Map<string, { minutes: number; count: number }>()
    for (const r of todayRecords) {
      const key = r.taskId ?? 'null'
      const cur = grouped.get(key) ?? { minutes: 0, count: 0 }
      cur.minutes += r.duration
      cur.count += 1
      grouped.set(key, cur)
    }

    const slices: PieSlice[] = []
    for (const [key, val] of grouped) {
      const taskId = key === 'null' ? null : key
      const task = taskId ? tasks.find((t) => t.id === taskId) : null
      slices.push({
        taskId,
        title: task?.title ?? null,
        categoryId: task?.categoryId ?? null,
        minutes: val.minutes,
        count: val.count,
      })
    }
    // 按时长降序
    slices.sort((a, b) => b.minutes - a.minutes)
    return slices
  },
}
