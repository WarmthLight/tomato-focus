import { create } from 'zustand'
import type { TimerMode } from '../types'
import { useRecordsStore } from './recordsStore'
import { useTaskStore } from './taskStore'
import { playExamBell, playHeartbeat, startClockTicker, stopClockTicker } from '../utils/audio'
import { useNoiseStore } from './noiseStore'

interface TimerSettings {
  focus: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
}

interface TimerState {
  mode: TimerMode
  settings: TimerSettings
  customFocus: number | null // 自定义专注时长（分钟），null 用默认 25
  isRunning: boolean
  secondsLeft: number
  totalSeconds: number
  focusCount: number // 当前轮次已完成的专注番茄数
  currentTaskId: string | null
  startedAt: number | null
  intervalId: ReturnType<typeof setInterval> | null

  setMode: (mode: TimerMode) => void
  setCustomFocus: (minutes: number | null) => void
  setCurrentTaskId: (id: string | null) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  tick: () => void
  complete: (skipped?: boolean) => void
  cleanup: () => void
  // 考试高压模式
  examMode: boolean
  lastWarnAt: number // 上次警告的秒数，避免重复
  startExam: (minutes: number) => void
  stopExam: () => void
}

function modeDuration(mode: TimerMode, settings: TimerSettings, customFocus: number | null) {
  if (mode === 'focus') return customFocus ?? settings.focus
  if (mode === 'shortBreak') return settings.shortBreak
  return settings.longBreak
}

// 记录一次专注到本地 recordsStore + 更新任务番茄数
function recordFocus(
  taskId: string | null,
  type: TimerMode,
  duration: number,
  startedAt: number | null,
  endedAt: number,
  completed: boolean,
) {
  if (type !== 'focus' || duration <= 0) return
  const records = useRecordsStore.getState()
  records.add({
    taskId,
    type,
    duration,
    startedAt: startedAt ?? endedAt - duration * 60 * 1000,
    endedAt,
    completed,
  })
  if (taskId) {
    const tasks = useTaskStore.getState()
    tasks.addPomodoro(taskId)
    tasks.setElapsed(taskId, duration)
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'focus',
  settings: DEFAULT_SETTINGS,
  customFocus: null,
  isRunning: false,
  secondsLeft: DEFAULT_SETTINGS.focus * 60,
  totalSeconds: DEFAULT_SETTINGS.focus * 60,
  focusCount: 0,
  currentTaskId: null,
  startedAt: null,
  intervalId: null,
  examMode: false,
  lastWarnAt: 0,

  setMode: (mode) => {
    const { settings, customFocus, isRunning, intervalId } = get()
    if (isRunning && intervalId) clearInterval(intervalId)
    const seconds = modeDuration(mode, settings, customFocus) * 60
    set({ mode, secondsLeft: seconds, totalSeconds: seconds, isRunning: false, startedAt: null, intervalId: null })
  },

  setCustomFocus: (minutes) => {
    const { settings, isRunning, intervalId, mode } = get()
    if (isRunning && intervalId) clearInterval(intervalId)
    const m = minutes && minutes > 0 ? minutes : null
    const seconds = mode === 'focus' ? (m ?? settings.focus) * 60 : get().secondsLeft
    set({
      customFocus: m,
      secondsLeft: mode === 'focus' ? seconds : get().secondsLeft,
      totalSeconds: mode === 'focus' ? seconds : get().totalSeconds,
      isRunning: false,
      startedAt: null,
      intervalId: null,
    })
  },

  setCurrentTaskId: (id) => set({ currentTaskId: id }),

  start: () => {
    const { isRunning, intervalId, tick } = get()
    if (isRunning) return
    if (intervalId) clearInterval(intervalId)
    const id = setInterval(tick, 1000)
    set({ isRunning: true, startedAt: get().startedAt ?? Date.now(), intervalId: id })
  },

  pause: () => {
    const { intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    set({ isRunning: false, intervalId: null })
  },

  reset: () => {
    const { mode, settings, customFocus, intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    const seconds = modeDuration(mode, settings, customFocus) * 60
    set({ secondsLeft: seconds, isRunning: false, startedAt: null, intervalId: null })
  },

  skip: () => {
    get().complete(true)
  },

  tick: () => {
    const { secondsLeft, complete, examMode } = get()
    if (secondsLeft <= 1) {
      complete(false)
      return
    }
    // 考试模式：最后5分钟每秒心跳
    if (examMode && secondsLeft <= 300 && secondsLeft > 0) {
      playHeartbeat()
    }
    set({ secondsLeft: secondsLeft - 1 })
  },

  complete: (skipped = false) => {
    const { mode, settings, customFocus, focusCount, currentTaskId, startedAt, intervalId, examMode } = get()
    if (intervalId) clearInterval(intervalId)

    const endedAt = Date.now()
    const fullDuration = modeDuration(mode, settings, customFocus)
    // 跳过时记录实际专注时长；自然完成记录完整时长
    const actualMinutes = startedAt
      ? Math.max(0, Math.round((endedAt - startedAt) / 60000))
      : 0
    const duration = skipped ? actualMinutes : fullDuration

    // 考试模式结束铃音 + 停止白噪音 + 停止钟表声
    if (examMode && mode === 'focus') {
      playExamBell('end')
      stopClockTicker()
      const noise = useNoiseStore.getState()
      if (noise.isOn) {
        noise.toggle()
        noise.setVolume(0.3)
      }
    }

    // 记录番茄（专注模式且有时长才记录）
    recordFocus(currentTaskId, mode, duration, startedAt, endedAt, !skipped)

    // 计算下一个模式
    const newFocusCount = mode === 'focus' ? focusCount + 1 : focusCount
    let nextMode: TimerMode
    if (mode === 'focus') {
      nextMode = newFocusCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak'
    } else {
      nextMode = 'focus'
    }

    const nextSeconds = modeDuration(nextMode, settings, customFocus) * 60
    set({
      mode: nextMode,
      secondsLeft: nextSeconds,
      totalSeconds: nextSeconds,
      isRunning: false,
      focusCount: newFocusCount,
      startedAt: null,
      intervalId: null,
      examMode: false,
      lastWarnAt: 0,
    })
  },

  cleanup: () => {
    const { intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    stopClockTicker()
  },

  startExam: (minutes) => {
    const { tick } = get()
    const seconds = minutes * 60
    const id = setInterval(tick, 1000)
    playExamBell('start')
    startClockTicker()
    // 播放自习室白噪音（小音量）
    const noise = useNoiseStore.getState()
    noise.setType('cafe')
    noise.setVolume(0.15)
    if (!noise.isOn) noise.toggle()
    set({
      mode: 'focus',
      examMode: true,
      customFocus: minutes,
      secondsLeft: seconds,
      totalSeconds: seconds,
      isRunning: true,
      startedAt: Date.now(),
      intervalId: id,
      lastWarnAt: 0,
    })
  },

  stopExam: () => {
    const { intervalId, startedAt, mode, currentTaskId, settings } = get()
    if (intervalId) clearInterval(intervalId)

    const endedAt = Date.now()
    const actualMinutes = startedAt
      ? Math.max(0, Math.round((endedAt - startedAt) / 60000))
      : 0

    // 记录实际专注时长
    recordFocus(currentTaskId, mode, actualMinutes, startedAt, endedAt, false)

    // 结束铃音 + 停止白噪音 + 停止钟表声
    playExamBell('end')
    stopClockTicker()
    const noise = useNoiseStore.getState()
    if (noise.isOn) {
      noise.toggle()
      noise.setVolume(0.3)
    }

    // 重置到正常专注模式
    const seconds = settings.focus * 60
    set({
      examMode: false,
      isRunning: false,
      startedAt: null,
      intervalId: null,
      lastWarnAt: 0,
      mode: 'focus',
      customFocus: null,
      secondsLeft: seconds,
      totalSeconds: seconds,
    })
  },
}))
