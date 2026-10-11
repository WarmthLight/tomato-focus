import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { useTimerStore } from '../../store/timerStore'

export default function TimerControls() {
  const { isRunning, start, pause, reset, skip, mode } = useTimerStore()

  const isFocus = mode === 'focus'

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={reset}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-700 text-ink-300 transition-all hover:bg-ink-600 hover:text-ink-100 active:scale-90"
        aria-label="重置"
      >
        <RotateCcw size={20} />
      </button>

      <button
        onClick={isRunning ? pause : start}
        className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-95 ${
          isFocus
            ? 'bg-tomato-500 shadow-tomato-500/40 hover:bg-tomato-600'
            : 'bg-mint-500 shadow-mint-500/40 hover:bg-mint-400'
        }`}
        aria-label={isRunning ? '暂停' : '开始'}
      >
        {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
      </button>

      <button
        onClick={skip}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-700 text-ink-300 transition-all hover:bg-ink-600 hover:text-ink-100 active:scale-90"
        aria-label="跳过"
      >
        <SkipForward size={20} />
      </button>
    </div>
  )
}
