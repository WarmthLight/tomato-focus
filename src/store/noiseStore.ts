import { create } from 'zustand'
import { noiseGenerator, type NoiseType } from '../utils/audio'

interface NoiseState {
  isOn: boolean
  type: NoiseType
  volume: number
  toggle: () => void
  setType: (t: NoiseType) => void
  setVolume: (v: number) => void
  syncFromGenerator: () => void
}

export const useNoiseStore = create<NoiseState>((set, get) => ({
  isOn: false,
  type: 'rain',
  volume: 0.3,

  toggle: () => {
    const { isOn, type, volume } = get()
    if (isOn) {
      noiseGenerator.stop()
      set({ isOn: false })
    } else {
      noiseGenerator.play(type, volume)
      set({ isOn: true })
    }
  },

  setType: (t) => {
    const { isOn, volume } = get()
    set({ type: t })
    if (isOn) noiseGenerator.play(t, volume)
  },

  setVolume: (v) => {
    set({ volume: v })
    if (get().isOn) noiseGenerator.setVolume(v)
  },

  // 从 generator 单例同步真实播放状态（防止组件重挂载后状态丢失）
  syncFromGenerator: () => {
    set({ isOn: noiseGenerator.isPlaying() })
  },
}))
