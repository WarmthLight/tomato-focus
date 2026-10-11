import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Task } from '../../types'
import { useCategoryStore } from '../../store/categoryStore'
import TaskItem from './TaskItem'

interface CompletedStackProps {
  tasks: Task[]
}

export default function CompletedStack({ tasks }: CompletedStackProps) {
  const [expanded, setExpanded] = useState(false)
  const { getColor } = useCategoryStore()

  if (tasks.length === 0) return null

  const top = tasks[0]
  const stacked = tasks.slice(0, 3)

  // 收起状态：紧凑卡片，左侧堆叠彩色竖条
  if (!expanded) {
    return (
      <div className="mt-3">
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-2.5 rounded-2xl card-2 p-2.5 pl-3 transition-colors hover:bg-ink-700/60"
        >
          {/* 堆叠彩色竖条（代表多个已完成任务） */}
          <div className="relative h-6 w-4 shrink-0">
            {stacked.slice().reverse().map((t, i) => (
              <span
                key={t.id}
                className="absolute top-0 h-full w-[3px] rounded-full"
                style={{
                  left: `${i * 2}px`,
                  backgroundColor: getColor(t.categoryId),
                  opacity: 0.4 + i * 0.25,
                }}
              />
            ))}
          </div>

          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-500/20 text-mint-400">
            <Check size={12} strokeWidth={3} />
          </span>

          <span className="flex-1 truncate text-sm text-ink-400 line-through">
            {top.title}
          </span>

          {tasks.length > 1 && (
            <span className="shrink-0 rounded-full bg-ink-600 px-2 py-0.5 text-[10px] text-ink-300">
              +{tasks.length - 1}
            </span>
          )}
          <ChevronDown size={14} className="shrink-0 text-ink-500" />
        </button>
      </div>
    )
  }

  // 展开状态
  return (
    <div className="mt-3 flex flex-col gap-2">
      <button
        onClick={() => setExpanded(false)}
        className="flex items-center gap-1.5 px-1 text-xs font-medium text-ink-400"
      >
        <Check size={12} className="text-mint-400" />
        已完成 · {tasks.length}
        <ChevronDown size={12} className="rotate-180 text-ink-500" />
      </button>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}
    </div>
  )
}
