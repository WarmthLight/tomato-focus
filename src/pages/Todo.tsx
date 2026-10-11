import AddTaskForm from '../components/todo/AddTaskForm'
import TaskList from '../components/todo/TaskList'
import CategoryBar from '../components/todo/CategoryBar'

export default function TodoPage() {
  return (
    <div className="min-h-full px-5 pt-10 pb-28">
      <div className="mx-auto max-w-md">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight text-ink-100">待办清单</h1>
        </div>

        {/* 文件夹式分类栏 */}
        <div className="mb-4 -mx-5 px-5">
          <CategoryBar />
        </div>

        <div className="mb-5">
          <AddTaskForm />
        </div>

        <TaskList />
      </div>
    </div>
  )
}
