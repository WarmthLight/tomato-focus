import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { useTimerStore } from '../../store/timerStore'
import { useCategoryStore } from '../../store/categoryStore'

export default function CurrentTask() {
  const { tasks, currentTaskId, setCurrentTaskId } = useTaskStore()
  const { isRunning, mode, setCurrentTaskId: setTimerTask } = useTimerStore()
  const { getColor, getName } = useCategoryStore()
  const [open, setOpen] = useState(false)

  // 专注计时进行中：禁止切换任务
  const locked = isRunning && mode === 'focus'

  const incomplete = tasks.filter((t) => !t.completed)
  const current = tasks.find((t) => t.id === currentTaskId) ?? null

  const select = (id: string | null) => {
    if (locked) return
    setCurrentTaskId(id)
    setTimerTask(id)
    setOpen(false)
  }

  return (
    <div className="w-full max-w-sm lg:max-w-none">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-2xl card px-4 py-3 text-left transition-colors ${
          locked ? 'opacity-80' : 'hover:bg-ink-700/80'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-ink-300 text-sm">当前任务：</span>
          {current ? (
            <>
              {current.categoryId && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getColor(current.categoryId) }}
                />
              )}
              <span className="truncate font-medium text-ink-100">{current.title}</span>
            </>
          ) : (
            <span className="text-ink-400">未选择（自由专注）</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-2 max-h-64 overflow-y-auto scrollbar-hide rounded-2xl border border-ink-600 bg-ink-800 p-1 animate-slide-up">
          {locked && (
            <div className="mb-1 rounded-xl bg-tomato-500/10 px-3 py-2 text-center text-xs text-tomato-400">
              专注计时中，无法切换任务
            </div>
          )}
          <button
            onClick={() => select(null)}
            disabled={locked}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              locked ? 'cursor-not-allowed text-ink-500' : 'text-ink-300 hover:bg-ink-700'
            } ${!current ? 'text-tomato-400' : ''}`}
          >
            {!current && <Check size={16} />}
            <span className={!current ? 'pl-0' : 'pl-6'}>不绑定任务</span>
          </button>
          {incomplete.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-ink-400">
              暂无待办任务，去「待办」页添加
            </div>
          )}
          {incomplete.map((t) => {
            const color = getColor(t.categoryId)
            return (
              <button
                key={t.id}
                onClick={() => select(t.id)}
                disabled={locked}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  locked ? 'cursor-not-allowed text-ink-500' : 'hover:bg-ink-700'
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 truncate text-ink-100">{t.title}</span>
                <span className="shrink-0 text-xs text-ink-400">
                  {t.mode === 'pomodoro'
                    ? `${t.completedPomodoros}/${t.estimatedPomodoros} 🍅`
                    : t.mode === 'duration' && t.totalMinutes
                    ? `${t.elapsedMinutes || 0}/${t.totalMinutes}m`
                    : `${t.elapsedMinutes || 0}m`}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
