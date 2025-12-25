import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'

interface DevTask {
  id: number
  title: string
  description: string | null
  type: 'task' | 'bug'
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: number
  storyPoints: number | null
  featureId: number
  sprintId: number | null
}

interface Sprint {
  id: number
  name: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
}

const priorityConfig: Record<number, { label: string; className: string; bg: string }> = {
  1: { label: 'P1 - Critical', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', bg: 'border-l-red-500' },
  2: { label: 'P2 - High', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', bg: 'border-l-amber-500' },
  3: { label: 'P3 - Medium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', bg: 'border-l-blue-500' },
  4: { label: 'P4 - Low', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', bg: 'border-l-slate-400' },
}

const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13] as const

export default function Backlog() {
  const [tasks, setTasks] = useState<DevTask[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPoints, setEditingPoints] = useState<number | null>(null)
  const [addingToSprint, setAddingToSprint] = useState<number | null>(null)
  const { token } = useAuthStore()

  const surfaceStyles = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }
  const textPrimary = { color: 'var(--text-primary)' }
  const textSecondary = { color: 'var(--text-secondary)' }
  const textMuted = { color: 'var(--text-muted)' }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [backlogRes, sprintsRes] = await Promise.all([
        fetch('/api/sprints/backlog/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/sprints?status=planning', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const backlogData = await backlogRes.json()
      const sprintsData = await sprintsRes.json()

      setTasks(backlogData.tasks || [])

      // Get planning + active sprints for assignment
      const allSprintsRes = await fetch('/api/sprints', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allSprintsData = await allSprintsRes.json()
      const availableSprints = (allSprintsData.sprints || []).filter(
        (s: Sprint) => s.status === 'planning' || s.status === 'active'
      )
      setSprints(availableSprints)
    } catch (err) {
      console.error('Failed to fetch backlog', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStoryPoints = async (taskId: number, points: number | null) => {
    try {
      await fetch(`/api/tasks/${taskId}/points`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storyPoints: points }),
      })
      setEditingPoints(null)
      fetchData()
    } catch (err) {
      console.error('Failed to update points', err)
    }
  }

  const addToSprint = async (taskId: number, sprintId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}/sprint`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sprintId }),
      })
      setAddingToSprint(null)
      fetchData()
    } catch (err) {
      console.error('Failed to add to sprint', err)
    }
  }

  // Group tasks by priority
  const groupedTasks = tasks.reduce((acc, task) => {
    const priority = task.priority || 3
    if (!acc[priority]) acc[priority] = []
    acc[priority].push(task)
    return acc
  }, {} as Record<number, DevTask[]>)

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const unestimatedCount = tasks.filter(t => !t.storyPoints).length

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4" style={textSecondary}>Loading backlog...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 border-b flex items-center justify-between shrink-0" style={surfaceStyles}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold" style={textPrimary}>Product Backlog</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {tasks.length} items
              </span>
              <span className="text-sm px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
                {totalPoints} pts
              </span>
              {unestimatedCount > 0 && (
                <span className="text-sm px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                  {unestimatedCount} unestimated
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Backlog List */}
        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12" style={textMuted}>
              Backlog is empty. All tasks are assigned to sprints.
            </div>
          ) : (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((priority) => {
                const priorityTasks = groupedTasks[priority] || []
                if (priorityTasks.length === 0) return null

                const pConfig = priorityConfig[priority]
                const priorityPoints = priorityTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)

                return (
                  <div key={priority}>
                    {/* Priority Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${pConfig.className}`}>
                        {pConfig.label}
                      </span>
                      <span className="text-sm" style={textSecondary}>
                        {priorityTasks.length} tasks · {priorityPoints} pts
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      {priorityTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-lg border-l-4 ${pConfig.bg} p-4 hover:shadow-md transition-shadow group`}
                          style={surfaceStyles}
                        >
                          <div className="flex items-start justify-between">
                            {/* Task Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {task.type === 'bug' && (
                                  <span className="material-symbols-outlined text-red-500 text-[18px]">bug_report</span>
                                )}
                                <h3 className="font-semibold text-sm truncate" style={textPrimary}>
                                  {task.title}
                                </h3>
                              </div>
                              {task.description && (
                                <p className="text-xs line-clamp-1" style={textSecondary}>
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-4 shrink-0">
                              {/* Story Points */}
                              {editingPoints === task.id ? (
                                <div className="flex gap-1">
                                  {FIBONACCI_POINTS.map(p => (
                                    <button
                                      key={p}
                                      onClick={() => updateStoryPoints(task.id, p)}
                                      className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                                        task.storyPoints === p
                                          ? 'bg-primary text-white'
                                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-primary/20'
                                      }`}
                                      style={task.storyPoints !== p ? textSecondary : {}}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => setEditingPoints(null)}
                                    className="w-7 h-7 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900/30"
                                    style={textSecondary}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingPoints(task.id)}
                                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                    task.storyPoints
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  } hover:opacity-80`}
                                >
                                  {task.storyPoints ? `${task.storyPoints} pts` : '? pts'}
                                </button>
                              )}

                              {/* Add to Sprint */}
                              {addingToSprint === task.id ? (
                                <div className="flex items-center gap-1">
                                  {sprints.length === 0 ? (
                                    <span className="text-xs" style={textMuted}>No sprints available</span>
                                  ) : (
                                    sprints.map(sprint => (
                                      <button
                                        key={sprint.id}
                                        onClick={() => addToSprint(task.id, sprint.id)}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                          sprint.status === 'active'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200'
                                        }`}
                                      >
                                        {sprint.name}
                                      </button>
                                    ))
                                  )}
                                  <button
                                    onClick={() => setAddingToSprint(null)}
                                    className="w-6 h-6 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900/30"
                                    style={textSecondary}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAddingToSprint(task.id)}
                                  className="px-3 py-1 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  + Sprint
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
