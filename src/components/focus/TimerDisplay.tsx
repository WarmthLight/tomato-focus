import { useTimerStore } from '../../store/timerStore'
import { formatTime } from '../../utils/date'
import type { TimerMode } from '../../types'

const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#FF5A4F',
  shortBreak: '#4ADE80',
  longBreak: '#4ADE80',
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: '专注中',
  shortBreak: '短休息',
  longBreak: '长休息',
}

// 生成 60 个刻度（每 5 个加长加粗）
const TICKS = Array.from({ length: 60 }, (_, i) => ({
  major: i % 5 === 0,
  angle: (i / 60) * 360,
}))

export default function TimerDisplay() {
  const { mode, secondsLeft, totalSeconds, isRunning } = useTimerStore()
  const color = MODE_COLORS[mode]
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  const radius = 130
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)
  const pct = Math.round(progress * 100)

  return (
    <div className="relative flex items-center justify-center">
      {/* 径向辉光（替代生硬纯色圆） */}
      {isRunning && (
        <div
          className="absolute h-80 w-80 rounded-full timer-glow animate-pulse-ring lg:h-96 lg:w-96"
          style={{ ['--glow-color' as string]: color, opacity: 0.5 }}
        />
      )}

      <svg viewBox="0 0 300 300" className="relative h-[300px] w-[300px] lg:h-[380px] lg:w-[380px]">
        {/* 刻度标记 */}
        {TICKS.map((t, i) => {
          const rad = (t.angle - 90) * (Math.PI / 180)
          const inner = t.major ? 112 : 118
          const outer = 124
          const x1 = 150 + inner * Math.cos(rad)
          const y1 = 150 + inner * Math.sin(rad)
          const x2 = 150 + outer * Math.cos(rad)
          const y2 = 150 + outer * Math.sin(rad)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={t.major ? '#52525B' : '#3A3A42'}
              strokeWidth={t.major ? 2 : 1}
              strokeLinecap="round"
            />
          )
        })}

        {/* 背景环 */}
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke="#2E2E35"
          strokeWidth="10"
        />
        {/* 进度环 */}
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="progress-ring__circle"
          style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>

      {/* 中心文字 */}
      <div className="absolute flex flex-col items-center">
        <span className="mb-1 text-[11px] font-medium tracking-[0.3em] text-ink-300 uppercase">
          {MODE_LABELS[mode]}
        </span>
        <span
          className="font-mono text-6xl font-bold tabular-nums leading-none lg:text-7xl"
          style={{ color }}
        >
          {formatTime(secondsLeft)}
        </span>
        <span className="mt-2 text-xs font-medium text-ink-500">
          {pct}% · 已过
        </span>
      </div>
    </div>
  )
}
