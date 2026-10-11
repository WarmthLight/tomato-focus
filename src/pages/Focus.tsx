import TimerDisplay from '../components/focus/TimerDisplay'
import ModeSwitcher from '../components/focus/ModeSwitcher'
import TimerControls from '../components/focus/TimerControls'
import CurrentTask from '../components/focus/CurrentTask'
import WhiteNoise from '../components/common/WhiteNoise'
import Countdown from '../components/focus/Countdown'
import FocusDurationPicker from '../components/focus/FocusDurationPicker'
import ExamMode from '../components/focus/ExamMode'
import { useTimerStore } from '../store/timerStore'
import { useCountdownStore } from '../store/countdownStore'
import { Calendar } from 'lucide-react'

export default function FocusPage() {
  const { focusCount, settings } = useTimerStore()
  const { hidden, toggleHidden } = useCountdownStore()

  return (
    <div className="flex min-h-full flex-col px-5 pt-10 pb-28">
      {/* 顶部标题栏 */}
      <div className="mb-2 flex w-full max-w-sm items-center justify-between mx-auto md:max-w-full lg:mx-0">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink-100">
          <span className="h-2 w-2 rounded-full bg-tomato-500 shadow-[0_0_8px_rgba(255,90,79,0.6)]" />
          番茄专注
        </h1>
        <div className="flex items-center gap-2">
          <ExamMode />
          {hidden && (
            <button
              onClick={toggleHidden}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 text-ink-400 transition-colors hover:text-ink-100"
              aria-label="显示倒计时"
            >
              <Calendar size={14} />
            </button>
          )}
          <WhiteNoise />
        </div>
      </div>

      {/* 桌面双栏：左计时器栈 / 右任务侧栏（移动端保持原顺序单列） */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-12 lg:items-start">
        {/* 左栏：计时器主区 */}
        <div className="flex flex-col items-center">
          {!hidden && (
            <div className="mb-4 w-full flex justify-center">
              <Countdown />
            </div>
          )}

          <p className="mb-8 text-sm text-ink-400">
            已完成 <span className="font-mono text-tomato-400">{focusCount}</span> 个番茄 · 每{' '}
            {settings.longBreakInterval} 个番茄长休息
          </p>

          {/* 计时器 */}
          <div className="mb-8 lg:mb-10">
            <TimerDisplay />
          </div>

          {/* 桌面端：模式切换 + 时长选择并排；移动端：垂直堆叠 */}
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-6">
            <ModeSwitcher />
            <FocusDurationPicker />
          </div>

          {/* 控制按钮 */}
          <div className="mt-8 lg:mt-10">
            <TimerControls />
          </div>
        </div>

        {/* 右栏：当前任务（桌面侧边，吸顶） */}
        <div className="mt-8 lg:mt-0 lg:sticky lg:top-10">
          <CurrentTask />
        </div>
      </div>
    </div>
  )
}
