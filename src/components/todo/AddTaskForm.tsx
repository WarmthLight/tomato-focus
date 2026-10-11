import { useState } from 'react'
import { Plus, Clock, Timer, Hash } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { useCategoryStore } from '../../store/categoryStore'
import type { TaskMode } from '../../types'

const MODE_OPTIONS: { key: TaskMode; label: string; icon: typeof Hash }[] = [
  { key: 'pomodoro', label: '番茄轮数', icon: Hash },
  { key: 'duration', label: '总时间', icon: Clock },
  { key: 'timer', label: '计时', icon: Timer },
]

export default function AddTaskForm() {
  const { addTask } = useTaskStore()
  const { selectedCategoryId, getColor, getName } = useCategoryStore()
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState<TaskMode>('pomodoro')
  const [pomodoros, setPomodoros] = useState(2)
  const [minutes, setMinutes] = useState(60)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      categoryId: selectedCategoryId,
      mode,
      estimatedPomodoros: mode === 'pomodoro' ? pomodoros : 0,
      totalMinutes: mode === 'duration' ? minutes : null,
    })
    setTitle('')
    setPomodoros(2)
    setMinutes(60)
  }

  const selColor = getColor(selectedCategoryId)
  const selName = selectedCategoryId ? getName(selectedCategoryId) : '全部'

  return (
    <form onSubmit={submit} className="rounded-2xl card p-4">
      <div className="flex items-center gap-2">
        {/* 当前分类标记 */}
        <span
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
          style={{ backgroundColor: `${selColor}20`, color: selColor }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: selColor }} />
          {selName}
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加任务..."
          className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 outline-none"
          autoFocus
        />
      </div>

      {/* 模式选择 */}
      <div className="mt-3 flex gap-1">
        {MODE_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all active:scale-95 ${
              mode === key
                ? 'bg-tomato-500 text-white'
                : 'bg-ink-600 text-ink-300 hover:text-ink-100'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* 模式参数 */}
      {mode === 'pomodoro' && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPomodoros((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-600 text-ink-300 transition-all hover:text-ink-100 active:scale-90"
            >−</button>
            <span className="w-8 text-center text-sm font-mono text-ink-100">{pomodoros}</span>
            <button
              type="button"
              onClick={() => setPomodoros((p) => Math.min(20, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-600 text-ink-300 transition-all hover:text-ink-100 active:scale-90"
            >+</button>
          </div>
          <span className="text-xs text-ink-500">≈ {pomodoros * 25} 分钟</span>
        </div>
      )}

      {mode === 'duration' && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinutes((m) => Math.max(5, m - 5))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-600 text-ink-300 transition-all hover:text-ink-100 active:scale-90"
            >−</button>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 rounded-lg bg-ink-600 py-1 text-center text-sm font-mono text-ink-100 outline-none"
            />
            <button
              type="button"
              onClick={() => setMinutes((m) => Math.min(600, m + 5))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-600 text-ink-300 transition-all hover:text-ink-100 active:scale-90"
            >+</button>
          </div>
          <span className="text-xs text-ink-500">{Math.floor(minutes / 60)}h{minutes % 60}m</span>
        </div>
      )}

      {mode === 'timer' && (
        <p className="mt-3 text-xs text-ink-400">自由计时模式，开始后记录实际专注时间</p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex h-9 items-center gap-1.5 rounded-full bg-tomato-500 px-5 text-sm text-white transition-all hover:bg-tomato-600 active:scale-95 disabled:opacity-40"
        >
          <Plus size={16} />
          添加
        </button>
      </div>
    </form>
  )
}
