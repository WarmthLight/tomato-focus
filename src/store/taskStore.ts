import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskMode, Priority } from '../types'

export interface CreateTaskPayload {
  title: string
  categoryId?: string | null
  priority?: Priority
  mode?: TaskMode
  estimatedPomodoros?: number
  totalMinutes?: number | null
}

export interface UpdateTaskPayload {
  title?: string
  categoryId?: string | null
  priority?: Priority
  mode?: TaskMode
  estimatedPomodoros?: number
  totalMinutes?: number | null
}

interface TaskState {
  tasks: Task[]
  currentTaskId: string | null
  addTask: (payload: CreateTaskPayload) => Task
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  updateTask: (id: string, payload: UpdateTaskPayload) => void
  addPomodoro: (id: string) => void
  setElapsed: (id: string, minutes: number) => void
  setCurrentTaskId: (id: string | null) => void
  refreshTask: (task: Task) => void
}

// 本地持久化任务存储，脱离后端
export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTaskId: null,

      addTask: (payload) => {
        const now = Date.now()
        const task: Task = {
          id: crypto.randomUUID(),
          title: payload.title,
          categoryId: payload.categoryId ?? null,
          priority: payload.priority ?? 'medium',
          mode: payload.mode ?? 'pomodoro',
          estimatedPomodoros: payload.estimatedPomodoros ?? 1,
          totalMinutes: payload.totalMinutes ?? null,
          completedPomodoros: 0,
          elapsedMinutes: 0,
          completed: false,
          createdAt: now,
          completedAt: null,
        }
        set((state) => ({ tasks: [task, ...state.tasks] }))
        return task
      },

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          currentTaskId: state.currentTaskId === id ? null : state.currentTaskId,
        })),

      updateTask: (id, payload) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...payload } : t)),
        })),

      addPomodoro: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t,
          ),
        })),

      setElapsed: (id, minutes) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, elapsedMinutes: (t.elapsedMinutes || 0) + minutes } : t,
          ),
        })),

      setCurrentTaskId: (id) => set({ currentTaskId: id }),

      refreshTask: (task) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        })),
    }),
    { name: 'tasks-storage' },
  ),
)
