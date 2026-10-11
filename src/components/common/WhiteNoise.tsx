import { useEffect, useState } from 'react'
import { Volume2, VolumeX, ChevronDown } from 'lucide-react'
import { useNoiseStore } from '../../store/noiseStore'
import { NOISE_LABELS, type NoiseType } from '../../utils/audio'

const NOISE_TYPES = Object.keys(NOISE_LABELS) as NoiseType[]

export default function WhiteNoise() {
  const { isOn, type, toggle, setType, syncFromGenerator } = useNoiseStore()
  const [expanded, setExpanded] = useState(false)

  // 组件挂载时从 generator 单例同步真实播放状态，修复 tab 切换后图标不同步
  useEffect(() => {
    syncFromGenerator()
  }, [syncFromGenerator])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
          isOn ? 'bg-tomato-500/20 text-tomato-400' : 'bg-ink-700 text-ink-300'
        }`}
      >
        {isOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>{isOn ? '播放中' : '白噪音'}</span>
      </button>

      {isOn && (
        <div className="relative">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-full bg-ink-700 px-3 py-1.5 text-xs text-ink-200 transition-colors hover:text-ink-100"
          >
            <span>{NOISE_LABELS[type]}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          {expanded && (
            <div className="absolute right-0 top-full mt-1 z-50 grid w-48 grid-cols-2 gap-1 rounded-2xl border border-ink-600 bg-ink-800 p-2 animate-slide-up">
              {NOISE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t)
                    setExpanded(false)
                  }}
                  className={`rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                    type === t
                      ? 'bg-tomato-500 text-white'
                      : 'text-ink-300 hover:bg-ink-700'
                  }`}
                >
                  {NOISE_LABELS[t]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
