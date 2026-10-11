import { useState, useEffect } from 'react'
import { Calendar, Settings, X, Check } from 'lucide-react'
import { useCountdownStore } from '../../store/countdownStore'

function calcDays(target: string): number {
  const targetDate = new Date(target + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = targetDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Countdown() {
  const { targetDate, name, hidden, setTarget, toggleHidden } = useCountdownStore()
  const [editing, setEditing] = useState(false)
  const [dateInput, setDateInput] = useState(targetDate)
  const [nameInput, setNameInput] = useState(name)
  const [days, setDays] = useState(() => calcDays(targetDate))

  useEffect(() => {
    setDays(calcDays(targetDate))
  }, [targetDate])

  const save = () => {
    if (dateInput && nameInput.trim()) {
      setTarget(dateInput, nameInput.trim())
      setEditing(false)
    }
  }

  if (hidden) return null

  const isPast = days < 0
  const displayDays = Math.abs(days)

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-2xl card-2 px-3.5 py-2">
        <Calendar size={14} className="shrink-0 text-tomato-400" />
        <div className="flex flex-1 items-baseline gap-1.5">
          <span className="text-xs text-ink-300">{name}</span>
          {editing ? (
            <span className="text-xs text-ink-400">设置中</span>
          ) : (
            <>
              <span className="font-mono text-sm font-bold text-tomato-400">
                {displayDays}
              </span>
              <span className="text-xs text-ink-400">{isPast ? '天前' : '天'}</span>
            </>
          )}
        </div>
        <button
          onClick={() => { setEditing(!editing); setDateInput(targetDate); setNameInput(name) }}
          className="shrink-0 rounded-lg p-1 text-ink-400 hover:text-ink-100"
          aria-label="设置"
        >
          {editing ? <X size={14} /> : <Settings size={14} />}
        </button>
        <button
          onClick={toggleHidden}
          className="shrink-0 rounded-lg p-1 text-ink-500 hover:text-ink-300"
          aria-label="隐藏"
        >
          <X size={14} />
        </button>
      </div>

      {editing && (
        <div className="mt-2 rounded-2xl border border-ink-600 bg-ink-800 p-3 animate-slide-up">
          <div className="mb-2 flex items-center gap-2">
            <label className="w-10 text-xs text-ink-400">名称</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="如：考研、期末考试"
              className="flex-1 rounded-lg bg-ink-700 px-2 py-1.5 text-xs text-ink-100 outline-none placeholder:text-ink-500"
              autoFocus
            />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <label className="w-10 text-xs text-ink-400">日期</label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="flex-1 rounded-lg bg-ink-700 px-2 py-1.5 text-xs text-ink-100 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="rounded-full bg-ink-600 px-3 py-1 text-xs text-ink-300"
            >
              取消
            </button>
            <button
              onClick={save}
              disabled={!dateInput || !nameInput.trim()}
              className="flex items-center gap-1 rounded-full bg-tomato-500 px-3 py-1 text-xs text-white disabled:opacity-40"
            >
              <Check size={12} />
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
