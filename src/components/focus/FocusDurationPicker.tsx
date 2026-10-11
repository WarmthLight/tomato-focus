import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTimerStore } from '../../store/timerStore'

const PRESETS = [25, 50, 90, 120]

export default function FocusDurationPicker() {
  const { mode, isRunning, customFocus, setCustomFocus } = useTimerStore()
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(customFocus ?? 25))

  // 仅专注模式且未运行时显示
  if (mode !== 'focus' || isRunning) return null

  const current = customFocus ?? 25

  const applyCustom = () => {
    const n = Math.max(1, Math.min(600, Number(input) || 25))
    setCustomFocus(n)
    setInput(String(n))
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => setCustomFocus(current === p ? null : p)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            current === p
              ? 'bg-tomato-500 text-white'
              : 'bg-ink-700 text-ink-400 hover:text-ink-100'
          }`}
        >
          {p}m
        </button>
      ))}
      <button
        onClick={() => { setEditing(!editing); setInput(String(current)) }}
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors ${
          customFocus !== null && !PRESETS.includes(customFocus)
            ? 'bg-tomato-500 text-white'
            : 'bg-ink-700 text-ink-400 hover:text-ink-100'
        }`}
      >
        自定义
      </button>
      {editing && (
        <div className="flex items-center gap-1 animate-slide-up">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-14 rounded-full bg-ink-700 px-2 py-1 text-center text-xs text-ink-100 outline-none"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
          />
          <button
            onClick={applyCustom}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-tomato-500 text-white"
          >
            <Check size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
