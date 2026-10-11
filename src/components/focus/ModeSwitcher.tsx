import { useTimerStore } from '../../store/timerStore'
import type { TimerMode } from '../../types'

const MODES: { key: TimerMode; label: string }[] = [
  { key: 'focus', label: '专注' },
  { key: 'shortBreak', label: '短休息' },
  { key: 'longBreak', label: '长休息' },
]

export default function ModeSwitcher() {
  const { mode, setMode } = useTimerStore()

  return (
    <div className="flex gap-1 rounded-full bg-ink-700 p-1">
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-95 ${
            mode === key
              ? key === 'focus'
                ? 'bg-tomato-500 text-white shadow-lg shadow-tomato-500/30'
                : 'bg-mint-500 text-ink-900 shadow-lg shadow-mint-500/30'
              : 'text-ink-300 hover:text-ink-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
