import { useState } from 'react'
import { Zap, X, AlertTriangle } from 'lucide-react'
import { useTimerStore } from '../../store/timerStore'
import { useTaskStore } from '../../store/taskStore'

export default function ExamMode() {
  const { examMode, isRunning, secondsLeft, startExam, stopExam } = useTimerStore()
  const { setCurrentTaskId, addTask } = useTaskStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [minutes, setMinutes] = useState('120')

  const start = () => {
    const mins = Math.max(1, Number(minutes) || 120)
    const taskName = name.trim() || `考试 ${mins}分钟`
    // 创建任务用于统计关联（本地存储）
    const task = addTask({
      title: taskName,
      mode: 'duration',
      totalMinutes: mins,
    })
    setCurrentTaskId(task.id)
    useTimerStore.getState().setCurrentTaskId(task.id)
    startExam(mins)
    setName('')
    setMinutes('120')
    setOpen(false)
  }

  // 考试进行中：紧迫状态条
  if (examMode && isRunning) {
    const mins = Math.floor(secondsLeft / 60)
    const isUrgent = secondsLeft <= 60
    const isWarning = secondsLeft <= 300
    return (
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${
          isUrgent
            ? 'bg-tomato-500/30 text-tomato-400 animate-pulse'
            : isWarning
            ? 'bg-tomato-500/20 text-tomato-400/80'
            : 'bg-ink-700 text-ink-300'
        }`}
      >
        <Zap size={13} className={isUrgent ? 'text-tomato-400' : 'text-ink-400'} />
        <span className="font-medium">考试</span>
        {isUrgent ? (
          <span className="flex items-center gap-0.5">
            <AlertTriangle size={11} /> 冲刺
          </span>
        ) : (
          <span className="opacity-70">{mins}m</span>
        )}
        <button
          onClick={() => stopExam()}
          className="ml-1 rounded-full bg-ink-600 px-1.5 py-0.5 text-[10px] text-ink-400 hover:text-tomato-400"
        >
          结束
        </button>
      </div>
    )
  }

  // 入口 + 下拉面板
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-ink-700 px-2.5 py-1 text-xs text-ink-300 transition-colors hover:text-tomato-400"
      >
        <Zap size={13} />
        考试
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-ink-600 bg-ink-800 p-3.5 animate-slide-up">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-ink-100">
              <Zap size={14} className="text-tomato-400" />
              高压考试模式
            </h3>
            <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-100">
              <X size={14} />
            </button>
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-ink-500">
            自动播放自习室白噪音，开始/结束铃音，最后5分钟警告与心跳声
          </p>

          <label className="mb-1 block text-[11px] text-ink-400">考试名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：数学模拟卷一"
            className="mb-2.5 w-full rounded-lg bg-ink-700 px-2.5 py-2 text-xs text-ink-100 placeholder:text-ink-500 outline-none"
            autoFocus
          />

          <label className="mb-1 block text-[11px] text-ink-400">时长（分钟）</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-16 rounded-lg bg-ink-700 px-2 py-2 text-center text-xs text-ink-100 outline-none"
            />
            <button
              onClick={start}
              className="flex-1 rounded-lg bg-tomato-500 py-2 text-xs font-medium text-white transition-colors hover:bg-tomato-600"
            >
              开始考试
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
