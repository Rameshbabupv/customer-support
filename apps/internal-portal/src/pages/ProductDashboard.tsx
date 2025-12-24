import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'

interface Epic {
  id: number
  productId: number
  title: string
  description: string | null
  status: string
  priority: number
  createdAt: string
  updatedAt: string
}

interface Feature {
  id: number
  epicId: number
  title: string
  description: string | null
  status: string
  priority: number
  createdAt: string
  updatedAt: string
}

interface DevTask {
  id: number
  featureId: number
  title: string
  description: string | null
  type: 'task' | 'bug'
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: number
  createdAt: string
  updatedAt: string
}

interface EpicProgress {
  epicId: number
  epicTitle: string
  totalTasks: number
  completedTasks: number
  percentage: number
}

interface TaskDistribution {
  todo: number
  in_progress: number
  review: number
  done: number
}

interface DashboardData {
  epics: Epic[]
  features: Feature[]
  tasks: DevTask[]
  epicProgress: EpicProgress[]
  taskStatusDistribution: TaskDistribution
  totalTasks: number
}

export default function ProductDashboard() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set())
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set())
  const { token } = useAuthStore()

  useEffect(() => {
    fetchDashboard()
  }, [id])

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/products/${id}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (err) {
      console.error('Failed to fetch dashboard', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleEpic = (epicId: number) => {
    const newSet = new Set(expandedEpics)
    if (newSet.has(epicId)) {
      newSet.delete(epicId)
    } else {
      newSet.add(epicId)
    }
    setExpandedEpics(newSet)
  }

  const toggleFeature = (featureId: number) => {
    const newSet = new Set(expandedFeatures)
    if (newSet.has(featureId)) {
      newSet.delete(featureId)
    } else {
      newSet.add(featureId)
    }
    setExpandedFeatures(newSet)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-slate-100 text-slate-700'
      case 'planned': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-indigo-100 text-indigo-700'
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'todo': return 'bg-slate-100 text-slate-700'
      case 'review': return 'bg-amber-100 text-amber-700'
      case 'done': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden bg-background-light">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-screen flex overflow-hidden bg-background-light">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p>Failed to load dashboard data</p>
          </div>
        </main>
      </div>
    )
  }

  const maxTasks = Math.max(...data.epicProgress.map(e => e.totalTasks), 1)

  return (
    <div className="h-screen flex overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Product Dashboard</h2>
              <p className="text-xs text-slate-500">Development progress and metrics</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-[20px]">library_books</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{data.epics.length}</p>
                  <p className="text-xs text-slate-500">Epics</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">extension</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{data.features.length}</p>
                  <p className="text-xs text-slate-500">Features</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{data.totalTasks}</p>
                  <p className="text-xs text-slate-500">Total Tasks</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{data.taskStatusDistribution.done}</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Epic Progress Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">trending_up</span>
                Epic Progress
              </h3>
              <div className="space-y-4">
                {data.epicProgress.map((epic) => (
                  <div key={epic.epicId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 truncate flex-1">{epic.epicTitle}</span>
                      <span className="text-xs text-slate-500 ml-2">{epic.completedTasks}/{epic.totalTasks}</span>
                      <span className="text-xs font-bold text-emerald-600 ml-2">{epic.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                        style={{ width: `${epic.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                {data.epicProgress.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No epics yet</p>
                )}
              </div>
            </div>

            {/* Task Status Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">donut_small</span>
                Task Status Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-slate-400"></div>
                    <span className="text-sm text-slate-700">To Do</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{data.taskStatusDistribution.todo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">In Progress</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{data.taskStatusDistribution.in_progress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-slate-700">Review</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{data.taskStatusDistribution.review}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-700">Done</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{data.taskStatusDistribution.done}</span>
                </div>

                {/* Visual bar */}
                {data.totalTasks > 0 && (
                  <div className="mt-6">
                    <div className="flex w-full h-8 rounded-lg overflow-hidden">
                      <div
                        className="bg-slate-400 flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${(data.taskStatusDistribution.todo / data.totalTasks) * 100}%` }}
                      >
                        {data.taskStatusDistribution.todo > 0 && data.taskStatusDistribution.todo}
                      </div>
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${(data.taskStatusDistribution.in_progress / data.totalTasks) * 100}%` }}
                      >
                        {data.taskStatusDistribution.in_progress > 0 && data.taskStatusDistribution.in_progress}
                      </div>
                      <div
                        className="bg-amber-500 flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${(data.taskStatusDistribution.review / data.totalTasks) * 100}%` }}
                      >
                        {data.taskStatusDistribution.review > 0 && data.taskStatusDistribution.review}
                      </div>
                      <div
                        className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${(data.taskStatusDistribution.done / data.totalTasks) * 100}%` }}
                      >
                        {data.taskStatusDistribution.done > 0 && data.taskStatusDistribution.done}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Epic → Feature → Task Drilldown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">account_tree</span>
              Epic → Feature → Task Breakdown
            </h3>

            <div className="space-y-2">
              {data.epics.map((epic) => {
                const isExpanded = expandedEpics.has(epic.id)
                const epicFeatures = data.features.filter(f => f.epicId === epic.id)

                return (
                  <div key={epic.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Epic Row */}
                    <div
                      onClick={() => toggleEpic(epic.id)}
                      className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-600">
                        {isExpanded ? 'expand_more' : 'chevron_right'}
                      </span>
                      <span className="material-symbols-outlined text-purple-600">library_books</span>
                      <span className="font-semibold text-slate-900 flex-1">{epic.title}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(epic.status)}`}>
                        {epic.status}
                      </span>
                      <span className="text-xs text-slate-500">{epicFeatures.length} features</span>
                    </div>

                    {/* Features */}
                    {isExpanded && (
                      <div className="bg-white">
                        {epicFeatures.map((feature) => {
                          const isFeatureExpanded = expandedFeatures.has(feature.id)
                          const featureTasks = data.tasks.filter(t => t.featureId === feature.id)

                          return (
                            <div key={feature.id} className="border-t border-slate-200">
                              {/* Feature Row */}
                              <div
                                onClick={() => toggleFeature(feature.id)}
                                className="flex items-center gap-3 p-4 pl-12 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                              >
                                <span className="material-symbols-outlined text-slate-600">
                                  {isFeatureExpanded ? 'expand_more' : 'chevron_right'}
                                </span>
                                <span className="material-symbols-outlined text-blue-600">extension</span>
                                <span className="font-medium text-slate-900 flex-1">{feature.title}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feature.status)}`}>
                                  {feature.status}
                                </span>
                                <span className="text-xs text-slate-500">{featureTasks.length} tasks</span>
                              </div>

                              {/* Tasks */}
                              {isFeatureExpanded && (
                                <div className="bg-slate-50">
                                  {featureTasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 pl-20 border-t border-slate-200">
                                      {task.type === 'bug' ? (
                                        <span className="material-symbols-outlined text-red-500 text-[18px]">bug_report</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">task</span>
                                      )}
                                      <span className="text-sm text-slate-700 flex-1">{task.title}</span>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {task.status}
                                      </span>
                                    </div>
                                  ))}
                                  {featureTasks.length === 0 && (
                                    <div className="p-4 pl-20 text-sm text-slate-400">No tasks yet</div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {epicFeatures.length === 0 && (
                          <div className="p-4 pl-12 text-sm text-slate-400 border-t border-slate-200">No features yet</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {data.epics.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl">account_tree</span>
                  <p className="mt-2 text-sm">No epics created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
