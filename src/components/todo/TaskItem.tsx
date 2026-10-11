import { useState } from 'react'
import { Check, Trash2, Clock, Timer, Hash, Folder, ChevronDown } from 'lucide-react'
import type { Task, TaskMode } from '../../types'
import { useTaskStore } from '../../store/taskStore'
import { useCategoryStore } from '../../store/categoryStore'

interface TaskItemProps {
  task: Task
}

const MODE_ICON: Record<TaskMode, typeof Hash> = {
  pomodoro: Hash,
  duration: Clock,
  timer: Timer,
}

export default function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask } = useTaskStore()
  const { categories, getColor, getName } = useCategoryStore()
  const [showPicker, setShowPicker] = useState(false)

  const color = getColor(task.categoryId)
  const ModeIcon = MODE_ICON[task.mode]

  const renderProgress = () => {
    if (task.mode === 'pomodoro') {
      return <span className="text-xs text-ink-400">{task.completedPomodoros}/{task.estimatedPomodoros} 🍅</span>
    }
    if (task.mode === 'duration' && task.totalMinutes) {
      const pct = Math.min(100, Math.floor((task.elapsedMinutes || 0) / task.totalMinutes * 100))
      return <span className="text-xs text-ink-400">{task.elapsedMinutes || 0}/{task.totalMinutes}m ({pct}%)</span>
    }
    if (task.mode === 'timer') {
      return <span className="text-xs text-ink-400">已专注 {task.elapsedMinutes || 0}m</span>
    }
    return null
  }

  const handlePickCategory = async (categoryId: string | null) => {
    setShowPicker(false)
    if (categoryId === task.categoryId) return
    await updateTask(task.id, { categoryId })
  }

  return (
    <div className="relative rounded-2xl card transition-all animate-slide-up hover:bg-ink-700/80">
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start gap-3 p-3.5 pl-4">
        <button
          onClick={() => toggleTask(task.id)}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
            task.completed
              ? 'border-mint-500 bg-mint-500 text-ink-900'
              : 'border-ink-400 hover:border-tomato-500'
          }`}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <ModeIcon size={12} className="shrink-0 text-ink-500" />
            {/* 分类切换器 */}
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] transition-colors hover:opacity-80"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Folder size={8} />
                {task.categoryId ? getName(task.categoryId) : '未分类'}
                <ChevronDown size={9} />
              </button>
              {showPicker && (
                <div className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-xl border border-ink-600 bg-ink-800 p-1 shadow-xl animate-slide-up">
                  <button
                    onClick={() => handlePickCategory(null)}
                    className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-ink-700 ${
                      task.categoryId === null ? 'text-tomato-400' : 'text-ink-300'
                    }`}
                  >
                    {!task.categoryId && <Check size={11} />}
                    <span className={!task.categoryId ? 'pl-0' : 'pl-4'}>未分类</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handlePickCategory(cat.id)}
                      className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-ink-700 ${
                        task.categoryId === cat.id ? 'text-ink-100' : 'text-ink-300'
                      }`}
                    >
                      {task.categoryId === cat.id && <Check size={11} />}
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className={`mt-0.5 break-words text-sm ${task.completed ? 'text-ink-400 line-through' : 'text-ink-100'}`}>
            {task.title}
          </p>
          <div className="mt-1">{renderProgress()}</div>
        </div>

        <button
          onClick={() => deleteTask(task.id)}
          className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-all hover:bg-ink-600 hover:text-tomato-400 active:scale-90"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
