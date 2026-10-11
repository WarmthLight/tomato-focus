import { useEffect, useState } from 'react'
import FocusPage from './pages/Focus'
import TodoPage from './pages/Todo'
import StatsPage from './pages/Stats'
import TabBar, { type TabKey } from './components/layout/TabBar'
import ThemeOverlay from './components/common/ThemeOverlay'
import { useThemeStore } from './store/themeStore'

export default function App() {
  const [tab, setTab] = useState<TabKey>('focus')
  const { fetchWeather } = useThemeStore()

  // 任务和分类数据由 zustand persist 自动从 localStorage 加载，无需 fetch
  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  return (
    <div className="safe-top mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
      <ThemeOverlay />
      {tab === 'focus' && <FocusPage />}
      {tab === 'todo' && <TodoPage />}
      {tab === 'stats' && <StatsPage />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
