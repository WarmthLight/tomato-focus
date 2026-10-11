import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PomodoroRecord, TimerMode } from '../types'

interface RecordsState {
  records: PomodoroRecord[]
  add: (payload: Omit<PomodoroRecord, 'id'>) => void
  clear: () => void
}

// 本地持久化专注记录，供统计页面使用
export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      records: [],
      add: (payload) =>
        set((state) => ({
          records: [...state.records, { ...payload, id: crypto.randomUUID() }],
        })),
      clear: () => set({ records: [] }),
    }),
    { name: 'focus-records' },
  ),
)
