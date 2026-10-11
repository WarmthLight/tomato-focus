import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from '../types'

// 自动分配颜色池
const AUTO_COLORS = [
  '#FF5A4F', '#3B82F6', '#A855F7', '#F59E0B',
  '#22C55E', '#EC4899', '#06B6D4', '#F97316',
  '#8B5CF6', '#14B8A6', '#E11D48', '#65A30D',
]

interface CategoryState {
  categories: Category[]
  selectedCategoryId: string | null // null = 全部
  addCategory: (name: string) => Category
  updateCategory: (id: string, payload: { name?: string; color?: string }) => void
  deleteCategory: (id: string) => void
  selectCategory: (id: string | null) => void
  getColor: (categoryId: string | null) => string
  getName: (categoryId: string | null) => string
}

// 本地持久化分类存储
export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      selectedCategoryId: null,

      addCategory: (name) => {
        const cat: Category = {
          id: crypto.randomUUID(),
          name,
          color: AUTO_COLORS[get().categories.length % AUTO_COLORS.length],
          createdAt: Date.now(),
        }
        set((state) => ({ categories: [...state.categories, cat] }))
        return cat
      },

      updateCategory: (id, payload) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...payload } : c)),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId,
        })),

      selectCategory: (id) => set({ selectedCategoryId: id }),

      getColor: (categoryId) => {
        const cat = get().categories.find((c) => c.id === categoryId)
        return cat?.color ?? '#6B7280'
      },

      getName: (categoryId) => {
        const cat = get().categories.find((c) => c.id === categoryId)
        return cat?.name ?? '未分类'
      },
    }),
    { name: 'categories-storage' },
  ),
)
