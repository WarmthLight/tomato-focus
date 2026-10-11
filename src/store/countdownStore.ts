import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CountdownState {
  targetDate: string // ISO 格式 YYYY-MM-DD
  name: string
  hidden: boolean
  setTarget: (date: string, name: string) => void
  toggleHidden: () => void
}

// 默认考研日期（2026 年 12 月底）
const DEFAULT_DATE = '2026-12-26'

export const useCountdownStore = create<CountdownState>()(
  persist(
    (set) => ({
      targetDate: DEFAULT_DATE,
      name: '考研',
      hidden: false,
      setTarget: (date, name) => set({ targetDate: date, name }),
      toggleHidden: () => set((s) => ({ hidden: !s.hidden })),
    }),
    { name: 'countdown-storage' },
  ),
)
