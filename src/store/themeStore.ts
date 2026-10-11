import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WeatherType, WeatherInfo } from '../utils/weather'
import { getWeather, WEATHER_TINT } from '../utils/weather'

interface ThemeState {
  weather: WeatherType
  weatherInfo: WeatherInfo | null
  lastFetchAt: number // 上次获取时间戳，用于缓存
  tint: { color: string; opacity: number; label: string }
  loading: boolean
  fetchWeather: () => Promise<void>
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      weather: 'unknown',
      weatherInfo: null,
      lastFetchAt: 0,
      tint: WEATHER_TINT.unknown,
      loading: false,

      fetchWeather: async () => {
        // 1 小时内不重复请求
        const now = Date.now()
        if (now - get().lastFetchAt < 60 * 60 * 1000 && get().weather !== 'unknown') {
          return
        }
        set({ loading: true })
        const info = await getWeather()
        set({
          weather: info.type,
          weatherInfo: info,
          lastFetchAt: now,
          tint: WEATHER_TINT[info.type],
          loading: false,
        })
      },
    }),
    {
      name: 'weather-theme',
      partialize: (s) => ({
        weather: s.weather,
        weatherInfo: s.weatherInfo,
        lastFetchAt: s.lastFetchAt,
        tint: s.tint,
      }),
    },
  ),
)
