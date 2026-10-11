import { useTaskStore } from '../../store/taskStore'
import { useCategoryStore } from '../../store/categoryStore'
import TaskItem from './TaskItem'
import CompletedStack from './CompletedStack'

export default function TaskList() {
  const { tasks } = useTaskStore()
  const { selectedCategoryId, categories, getColor, getName } = useCategoryStore()

  // 按选中分类过滤
  const filtered = selectedCategoryId
    ? tasks.filter((t) => t.categoryId === selectedCategoryId)
    : tasks

  const active = filtered.filter((t) => !t.completed)
  const done = filtered.filter((t) => t.completed)

  if (tasks.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-tomato-500/10 text-3xl">
          🍅
        </div>
        <p className="text-sm text-ink-300">还没有任务</p>
        <p className="mt-1 text-xs text-ink-500">添加一个，开始今天的专注</p>
      </div>
    )
  }

  // 未选中具体分类时按分类分组显示
  const groupByCategory = () => {
    const map = new Map<string | null, typeof active>()
    for (const t of active) {
      const key = t.categoryId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    const result: { id: string | null; name: string; color: string; items: typeof active }[] = []
    for (const cat of categories) {
      const items = map.get(cat.id)
      if (items && items.length > 0) {
        result.push({ id: cat.id, name: cat.name, color: cat.color, items })
      }
    }
    const unassigned = map.get(null)
    if (unassigned && unassigned.length > 0) {
      result.push({ id: null, name: '未分类', color: '#6B7280', items: unassigned })
    }
    return result
  }

  // 选中具体分类时直接列表展示
  if (selectedCategoryId) {
    return (
      <div className="flex flex-col gap-2">
        {active.length === 0 && done.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-400">这个分类还没有任务</p>
        )}
        {active.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
        {done.length > 0 && <CompletedStack tasks={done} />}
      </div>
    )
  }

  // "全部"视图：按分类分组
  const groups = groupByCategory()

  return (
    <div className="flex flex-col gap-4">
      {groups.length === 0 && active.length === 0 && done.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-400">没有进行中的任务</p>
      )}
      {groups.map((group) => (
        <div key={String(group.id)} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
            <h3 className="text-xs font-medium text-ink-200">
              {group.name} · {group.items.length}
            </h3>
          </div>
          {group.items.map((t) => (
            <TaskItem key={t.id} task={t} />
          ))}
        </div>
      ))}

      {done.length > 0 && <CompletedStack tasks={done} />}
    </div>
  )
}
