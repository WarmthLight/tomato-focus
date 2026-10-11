import { useEffect, useState } from 'react'
import { statsApi, type PieSlice } from '../../api/stats'
import { useCategoryStore } from '../../store/categoryStore'

// 极坐标转笛卡尔坐标（角度从顶部开始，顺时针）
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// 生成扇形 path
function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // 整圆特殊处理
  if (endAngle - startAngle >= 360) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
  }
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

// 同分类下按索引微调亮度，便于区分不同任务
function shadeColor(hex: string, idx: number) {
  if (idx === 0) return hex
  // 简单实现：向白色混合 10%*idx
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  const mix = Math.min(0.4, idx * 0.12)
  const nr = Math.round(r + (255 - r) * mix)
  const ng = Math.round(g + (255 - g) * mix)
  const nb = Math.round(b + (255 - b) * mix)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

export default function CategoryPie() {
  const [slices, setSlices] = useState<PieSlice[]>([])
  const [loading, setLoading] = useState(true)
  const { getColor, getName } = useCategoryStore()

  const load = async () => {
    try {
      const data = await statsApi.pie()
      setSlices(data)
    } catch (e) {
      console.error('加载饼图数据失败', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalMinutes = slices.reduce((s, x) => s + x.minutes, 0)

  if (loading) {
    return (
      <div className="rounded-2xl card p-4">
        <p className="text-center text-xs text-ink-400">加载中...</p>
      </div>
    )
  }

  if (slices.length === 0 || totalMinutes === 0) {
    return (
      <div className="rounded-2xl card p-4">
        <h3 className="mb-2 text-sm font-medium text-ink-200">今日任务专注分布</h3>
        <p className="py-6 text-center text-xs text-ink-400">
          今天还没有专注记录，开始一个番茄吧 🍅
        </p>
      </div>
    )
  }

  // 计算每个扇形角度，同分类按出现顺序微调颜色
  let acc = 0
  const catCounter = new Map<string, number>()
  const arcs = slices
    .filter((s) => s.minutes > 0)
    .map((s) => {
      const angle = (s.minutes / totalMinutes) * 360
      const start = acc
      acc += angle
      const baseColor = getColor(s.categoryId)
      const idx = catCounter.get(s.categoryId ?? 'null') ?? 0
      catCounter.set((s.categoryId ?? 'null'), idx + 1)
      return { ...s, startAngle: start, endAngle: acc, angle, color: shadeColor(baseColor, idx) }
    })

  const cx = 70
  const cy = 70
  const r = 60

  return (
    <div className="rounded-2xl card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-200">今日任务专注分布</h3>
        <span className="font-mono text-xs text-ink-400">{totalMinutes}m</span>
      </div>

      <div className="flex items-center gap-4">
        {/* SVG 饼图 */}
        <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
          {arcs.map((a) => (
            <path
              key={String(a.taskId)}
              d={arcPath(cx, cy, r, a.startAngle, a.endAngle)}
              fill={a.color}
              stroke="#1A1A1A"
              strokeWidth={1.5}
            />
          ))}
          {/* 中心空心圆 */}
          <circle cx={cx} cy={cy} r={32} fill="#2A2A2A" />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="fill-ink-100 font-mono"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            {totalMinutes}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="fill-ink-400"
            style={{ fontSize: 9 }}
          >
            分钟
          </text>
        </svg>

        {/* 图例：按任务 */}
        <div className="flex-1 space-y-1.5">
          {arcs.map((a) => {
            const catName = a.categoryId ? getName(a.categoryId) : '未分类'
            const pct = Math.round((a.minutes / totalMinutes) * 100)
            return (
              <div key={String(a.taskId)} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-ink-100">{a.title ?? '已删除任务'}</p>
                  <p className="text-[10px] text-ink-500">{catName}</p>
                </div>
                <span className="font-mono text-xs text-ink-400 shrink-0">
                  {a.minutes}m · {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
