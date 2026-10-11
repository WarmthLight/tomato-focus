import { useState } from 'react'
import { Folder, Plus, Trash2, Check, X } from 'lucide-react'
import { useCategoryStore } from '../../store/categoryStore'
import { useTaskStore } from '../../store/taskStore'

export default function CategoryBar() {
  const {
    categories,
    selectedCategoryId,
    selectCategory,
    addCategory,
    deleteCategory,
  } = useCategoryStore()
  const { tasks } = useTaskStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const countByCategory = (catId: string | null) =>
    tasks.filter((t) => t.categoryId === catId && !t.completed).length

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addCategory(name.trim())
    setName('')
    setAdding(false)
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {/* 全部 */}
      <button
        onClick={() => selectCategory(null)}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all active:scale-95 ${
          selectedCategoryId === null
            ? 'bg-tomato-500 text-white'
            : 'bg-ink-700 text-ink-300 hover:text-ink-100'
        }`}
      >
        <Folder size={14} />
        全部
        <span className="opacity-60">{tasks.filter((t) => !t.completed).length}</span>
      </button>

      {/* 各分类文件夹 */}
      {categories.map((cat) => (
        <div key={cat.id} className="relative shrink-0 group">
          <button
            onClick={() => selectCategory(cat.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all active:scale-95 ${
              selectedCategoryId === cat.id
                ? 'text-white'
                : 'text-ink-300 hover:text-ink-100'
            }`}
            style={{
              backgroundColor: selectedCategoryId === cat.id ? cat.color : `${cat.color}20`,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
            <span className="opacity-60">{countByCategory(cat.id)}</span>
          </button>
          {/* 删除按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteCategory(cat.id)
            }}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-600 text-ink-400 opacity-0 transition-opacity hover:bg-tomato-500 hover:text-white group-hover:opacity-100"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ))}

      {/* 新建分类 */}
      {adding ? (
        <form onSubmit={submit} className="flex shrink-0 items-center gap-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="分类名"
            className="w-20 rounded-full bg-ink-700 px-3 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 outline-none"
            autoFocus
          />
          <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-full bg-tomato-500 text-white">
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setName('') }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 text-ink-400"
          >
            <X size={14} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-ink-500 px-3 py-1.5 text-xs text-ink-400 transition-all hover:border-tomato-500 hover:text-tomato-400 active:scale-95"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  )
}
