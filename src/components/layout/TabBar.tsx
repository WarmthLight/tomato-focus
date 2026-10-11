import { Clock, ListTodo, BarChart3 } from 'lucide-react'

export type TabKey = 'focus' | 'todo' | 'stats'

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

const tabs: { key: TabKey; label: string; icon: typeof Clock }[] = [
  { key: 'focus', label: '专注', icon: Clock },
  { key: 'todo', label: '待办', icon: ListTodo },
  { key: 'stats', label: '统计', icon: BarChart3 },
]

export default function TabBar({ active, onChange }: TabBarProps) {
  const activeIndex = tabs.findIndex((t) => t.key === active)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-4 lg:pointer-events-none">
      <div className="relative mx-auto flex max-w-md border-t border-white/[0.06] bg-ink-800/80 backdrop-blur-xl lg:pointer-events-auto lg:max-w-sm lg:rounded-2xl lg:border lg:border-white/[0.06] lg:shadow-2xl lg:shadow-black/40">
        {/* 滑动指示器 */}
        <div
          className="absolute top-1.5 bottom-1.5 left-0 rounded-full bg-tomato-500/15 transition-transform duration-300 ease-out"
          style={{
            width: 'calc((100% - 0px) / 3)',
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {tabs.map(({ key, label, icon: Icon }, i) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative z-10 flex flex-1 flex-col items-center gap-1 py-3 transition-colors duration-200 ${
                isActive ? 'text-tomato-400' : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                {/* 激活顶部小圆点 */}
                <span
                  className={`absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-tomato-400 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
