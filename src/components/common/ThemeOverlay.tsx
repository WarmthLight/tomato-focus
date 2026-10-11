import { useThemeStore } from '../../store/themeStore'
import { WEATHER_TINT } from '../../utils/weather'

/**
 * 天气色温 overlay 层 - 全屏固定，mix-blend-mode 微调色温
 * 不改动任何现有组件颜色，仅在深色基础上叠加天气氛围色
 */
export default function ThemeOverlay() {
  const { weather, weatherInfo } = useThemeStore()
  const tint = WEATHER_TINT[weather]

  if (weather === 'unknown' || tint.opacity === 0) return null

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundColor: tint.color,
          opacity: tint.opacity,
          mixBlendMode: 'soft-light',
        }}
      />
      {weatherInfo && (
        <div className="pointer-events-none fixed bottom-20 right-4 z-10 select-none">
          <span className="rounded-full bg-ink-800/60 px-2 py-0.5 text-[10px] text-ink-400">
            {tint.label} {weatherInfo.tempC}°
          </span>
        </div>
      )}
    </>
  )
}
