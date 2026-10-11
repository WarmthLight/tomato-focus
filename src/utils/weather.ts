/**
 * 天气类型 + 色温配置
 * 直连 Open-Meteo（免费、支持 CORS、无需 key）
 */
export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'thunder' | 'unknown'

export interface WeatherInfo {
  type: WeatherType
  desc: string
  tempC: number
  feelsC: number
}

// Open-Meteo WMO weather_code 映射
const WMO_CODE_MAP: Record<number, WeatherType> = {
  0: 'sunny',
  1: 'sunny',
  2: 'cloudy',
  3: 'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain',
  56: 'rain', 57: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain',
  66: 'rain', 67: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow',
  77: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain',
  85: 'snow', 86: 'snow',
  95: 'thunder', 96: 'thunder', 99: 'thunder',
}

const TYPE_DESC: Record<WeatherType, string> = {
  sunny: '晴',
  cloudy: '阴',
  rain: '雨',
  snow: '雪',
  fog: '雾',
  thunder: '雷',
  unknown: '',
}

// 各天气色温 overlay 配色（深色基础上的微调）
export const WEATHER_TINT: Record<WeatherType, { color: string; opacity: number; label: string }> = {
  sunny: { color: '#F59E0B', opacity: 0.06, label: '晴' },
  cloudy: { color: '#94A3B8', opacity: 0.05, label: '阴' },
  rain: { color: '#3B82F6', opacity: 0.09, label: '雨' },
  snow: { color: '#BAE6FD', opacity: 0.08, label: '雪' },
  fog: { color: '#CBD5E1', opacity: 0.10, label: '雾' },
  thunder: { color: '#A855F7', opacity: 0.08, label: '雷' },
  unknown: { color: '#000000', opacity: 0, label: '' },
}

// 获取浏览器地理位置（5 秒超时，失败返回 null）
function getPosition(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 600000 }, // 缓存 10 分钟
    )
  })
}

interface OpenMeteoResponse {
  current?: {
    weather_code?: number
    temperature_2m?: number
    apparent_temperature?: number
  }
}

export async function getWeather(): Promise<WeatherInfo> {
  try {
    const pos = await getPosition()
    if (!pos) return { type: 'unknown', desc: '', tempC: 0, feelsC: 0 }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lon}&current=weather_code,temperature_2m,apparent_temperature`
    const resp = await fetch(url)
    if (!resp.ok) throw new Error('open-meteo failed')
    const data: OpenMeteoResponse = await resp.json()
    const cur = data.current
    if (!cur) throw new Error('no current data')

    const code = cur.weather_code ?? -1
    const type: WeatherType = WMO_CODE_MAP[code] ?? 'unknown'
    const tempC = Math.round(cur.temperature_2m ?? 0)
    const feelsC = Math.round(cur.apparent_temperature ?? tempC)

    return { type, desc: TYPE_DESC[type], tempC, feelsC }
  } catch (e) {
    console.error('获取天气失败', e)
    return { type: 'unknown', desc: '', tempC: 0, feelsC: 0 }
  }
}
