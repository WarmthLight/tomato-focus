export type Priority = 'high' | 'medium' | 'low'
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
export type TaskMode = 'pomodoro' | 'duration' | 'timer'

export interface Category {
  id: string
  name: string
  color: string
  createdAt: number
}

export interface Task {
  id: string
  title: string
  categoryId: string | null
  priority: Priority
  mode: TaskMode
  estimatedPomodoros: number
  totalMinutes: number | null
  completedPomodoros: number
  elapsedMinutes: number
  completed: boolean
  createdAt: number
  completedAt: number | null
}

export interface PomodoroRecord {
  id: string
  taskId: string | null
  type: TimerMode
  duration: number
  startedAt: number
  endedAt: number
  completed: boolean
}

export interface TodayStats {
  pomodoros: number
  focusMinutes: number
  completedTasks: number
}

export interface DailyStat {
  date: string
  timestamp: number
  count: number
}

// 可选的预设颜色
export const CATEGORY_PRESET_COLORS = [
  '#FF5A4F', // 番茄红
  '#3B82F6', // 蓝
  '#A855F7', // 紫
  '#F59E0B', // 琥珀
  '#22C55E', // 绿
  '#EC4899', // 粉
  '#06B6D4', // 青
  '#F97316', // 橙
  '#8B5CF6', // 紫罗兰
  '#14B8A6', // 蓝绿
]
