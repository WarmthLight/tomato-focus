/**
 * 白噪音生成器 - 使用 Web Audio API 合成环境音
 * 支持：白噪音、粉红噪音、棕色噪音、雨声、海浪、风声、森林、咖啡馆、壁炉
 */

export type NoiseType =
  | 'white'
  | 'pink'
  | 'brown'
  | 'rain'
  | 'ocean'
  | 'wind'
  | 'forest'
  | 'cafe'
  | 'fireplace'

export const NOISE_LABELS: Record<NoiseType, string> = {
  white: '白噪音',
  pink: '粉红噪音',
  brown: '棕色噪音',
  rain: '雨声',
  ocean: '海浪',
  wind: '风声',
  forest: '森林',
  cafe: '咖啡馆',
  fireplace: '壁炉',
}

class NoiseGenerator {
  private ctx: AudioContext | null = null
  private source: AudioBufferSourceNode | null = null
  private gain: GainNode | null = null
  private filters: AudioNode[] = []
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private currentType: NoiseType = 'rain'
  private currentVolume = 0.3

  private ensureCtx() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AC()
    }
    return this.ctx
  }

  // 生成白噪音 buffer
  private generateWhiteNoise(duration: number): AudioBuffer {
    const ctx = this.ensureCtx()
    const size = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  // 生成粉红噪音（Voss-McCartney 算法）
  private generatePinkNoise(duration: number): AudioBuffer {
    const ctx = this.ensureCtx()
    const size = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
    return buffer
  }

  // 生成棕色噪音（积分白噪音）
  private generateBrownNoise(duration: number): AudioBuffer {
    const ctx = this.ensureCtx()
    const size = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    return buffer
  }

  play(type: NoiseType = 'rain', volume = 0.3) {
    this.stop()
    const ctx = this.ensureCtx()
    if (ctx.state === 'suspended') ctx.resume()

    this.currentType = type
    this.currentVolume = volume

    // 选择基础噪音 buffer
    let baseBuffer: AudioBuffer
    let needFilters = false
    let needLFO = false
    let lfoFreq = 0.5

    switch (type) {
      case 'white':
        baseBuffer = this.generateWhiteNoise(2)
        break
      case 'pink':
        baseBuffer = this.generatePinkNoise(2)
        break
      case 'brown':
        baseBuffer = this.generateBrownNoise(2)
        break
      case 'rain':
        // 雨声 = 棕色噪音 + 高频白噪音叠加 + 带通滤波
        baseBuffer = this.generateBrownNoise(2)
        needFilters = true
        break
      case 'ocean':
        // 海浪 = 棕色噪音 + 低频幅度调制
        baseBuffer = this.generateBrownNoise(3)
        needFilters = true
        needLFO = true
        lfoFreq = 0.1 // 10秒一个波
        break
      case 'wind':
        // 风声 = 粉红噪音 + 带通滤波 + 幅度调制
        baseBuffer = this.generatePinkNoise(3)
        needFilters = true
        needLFO = true
        lfoFreq = 0.3
        break
      case 'forest':
        // 森林 = 粉红噪音 + 高通滤波（树叶沙沙声）
        baseBuffer = this.generatePinkNoise(3)
        needFilters = true
        break
      case 'cafe':
        // 咖啡馆 = 棕色噪音 + 低通滤波（低频嗡嗡声）
        baseBuffer = this.generateBrownNoise(3)
        needFilters = true
        break
      case 'fireplace':
        // 壁炉 = 棕色噪音 + 高通滤波（噼啪声）
        baseBuffer = this.generateBrownNoise(3)
        needFilters = true
        break
      default:
        baseBuffer = this.generateWhiteNoise(2)
    }

    this.source = ctx.createBufferSource()
    this.source.buffer = baseBuffer
    this.source.loop = true

    this.gain = ctx.createGain()
    this.gain.gain.value = volume

    // 连接滤波器链
    let lastNode: AudioNode = this.source

    if (needFilters) {
      switch (type) {
        case 'rain': {
          // 雨声：带通 + 高频叠加
          const bandpass = ctx.createBiquadFilter()
          bandpass.type = 'bandpass'
          bandpass.frequency.value = 1000
          bandpass.Q.value = 0.5
          this.filters.push(bandpass)
          lastNode.connect(bandpass)

          // 叠加高频白噪音模拟雨滴
          const hissSrc = ctx.createBufferSource()
          hissSrc.buffer = this.generateWhiteNoise(1)
          hissSrc.loop = true
          const hissFilter = ctx.createBiquadFilter()
          hissFilter.type = 'highpass'
          hissFilter.frequency.value = 4000
          const hissGain = ctx.createGain()
          hissGain.gain.value = 0.15
          hissSrc.connect(hissFilter)
          hissFilter.connect(hissGain)
          hissGain.connect(this.gain)
          hissSrc.start()
          this.filters.push(hissSrc, hissFilter, hissGain)

          lastNode = bandpass
          break
        }
        case 'ocean': {
          // 海浪：低通滤波 + 幅度调制
          const lowpass = ctx.createBiquadFilter()
          lowpass.type = 'lowpass'
          lowpass.frequency.value = 500
          this.filters.push(lowpass)
          lastNode.connect(lowpass)
          lastNode = lowpass
          break
        }
        case 'wind': {
          // 风声：带通滤波
          const bandpass = ctx.createBiquadFilter()
          bandpass.type = 'bandpass'
          bandpass.frequency.value = 800
          bandpass.Q.value = 2
          this.filters.push(bandpass)
          lastNode.connect(bandpass)
          lastNode = bandpass
          break
        }
        case 'forest': {
          // 森林：高通滤波模拟树叶声
          const highpass = ctx.createBiquadFilter()
          highpass.type = 'highpass'
          highpass.frequency.value = 2000
          this.filters.push(highpass)
          lastNode.connect(highpass)
          lastNode = highpass
          break
        }
        case 'cafe': {
          // 咖啡馆：低通滤波模拟室内嗡嗡声
          const lowpass = ctx.createBiquadFilter()
          lowpass.type = 'lowpass'
          lowpass.frequency.value = 300
          this.filters.push(lowpass)
          lastNode.connect(lowpass)
          lastNode = lowpass
          break
        }
        case 'fireplace': {
          // 壁炉：高通滤波模拟噼啪声
          const highpass = ctx.createBiquadFilter()
          highpass.type = 'highpass'
          highpass.frequency.value = 1000
          this.filters.push(highpass)
          lastNode.connect(highpass)
          lastNode = highpass
          break
        }
      }
    }

    // LFO 幅度调制（海浪、风声）
    if (needLFO && this.gain) {
      this.lfo = ctx.createOscillator()
      this.lfo.frequency.value = lfoFreq
      this.lfoGain = ctx.createGain()
      this.lfoGain.gain.value = volume * 0.5 // 调制深度
      this.lfo.connect(this.lfoGain)
      // 调制 gain 的值
      const baseGain = volume
      this.lfoGain.connect(this.gain.gain)
      // 设定基础值
      this.gain.gain.value = baseGain
      this.lfo.start()
    }

    lastNode.connect(this.gain)
    this.gain.connect(ctx.destination)
    this.source.start()
  }

  setVolume(v: number) {
    this.currentVolume = v
    if (this.gain) {
      this.gain.gain.setTargetAtTime(v, this.ensureCtx().currentTime, 0.1)
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop()
      } catch {
        // ignore
      }
      this.source.disconnect()
      this.source = null
    }
    if (this.lfo) {
      try {
        this.lfo.stop()
      } catch {
        // ignore
      }
      this.lfo.disconnect()
      this.lfo = null
    }
    if (this.lfoGain) {
      this.lfoGain.disconnect()
      this.lfoGain = null
    }
    for (const f of this.filters) {
      try {
        if ('stop' in f && typeof (f as { stop: () => void }).stop === 'function') {
          (f as { stop: () => void }).stop()
        }
      } catch {
        // ignore
      }
      try {
        f.disconnect()
      } catch {
        // ignore
      }
    }
    this.filters = []
    if (this.gain) {
      this.gain.disconnect()
      this.gain = null
    }
  }

  isPlaying() {
    return this.source !== null
  }

  getType() {
    return this.currentType
  }
}

export const noiseGenerator = new NoiseGenerator()

// 共享 AudioContext（避免高频创建/销毁）
let sharedCtx: AudioContext | null = null
function getSharedCtx(): AudioContext {
  if (!sharedCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    sharedCtx = new Ctor()
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {})
  }
  return sharedCtx
}

/**
 * 考试铃音 - 用 Web Audio 合成钟声
 * type: 'start' 开始铃（上行三音），'end' 结束铃（下行三音）
 */
export function playExamBell(type: 'start' | 'end') {
  try {
    const ctx = getSharedCtx()
    const notes = type === 'start' ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.35
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.4, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.85)
    })
  } catch (e) {
    console.error('铃音播放失败', e)
  }
}

/**
 * 心跳声 - "咚-咚"两声低频脉冲，用于高压状态最后五分钟
 */
export function playHeartbeat() {
  try {
    const ctx = getSharedCtx()
    // 两声"咚-咚"，间隔 180ms，频率 80Hz（扬声器可播放）
    for (let i = 0; i < 2; i++) {
      const t = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(90, t)
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.15)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.9, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.22)
    }
  } catch (e) {
    console.error('心跳声播放失败', e)
  }
}

// 传统钟表指针滴答声循环（考试全程）
let clockInterval: ReturnType<typeof setInterval> | null = null

export function startClockTicker() {
  if (clockInterval) return
  const ctx = getSharedCtx()
  clockInterval = setInterval(() => {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 1000
      const t = ctx.currentTime
      gain.gain.setValueAtTime(0.06, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.04)
    } catch {
      // ignore
    }
  }, 1000)
}

export function stopClockTicker() {
  if (clockInterval) {
    clearInterval(clockInterval)
    clockInterval = null
  }
}

/**
 * 警告滴答声 - 短促高频（保留兼容）
 */
export function playTick() {
  try {
    const ctx = getSharedCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 1200
    const t = ctx.currentTime
    gain.gain.setValueAtTime(0.15, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.06)
  } catch (e) {
    console.error('滴答声失败', e)
  }
}
