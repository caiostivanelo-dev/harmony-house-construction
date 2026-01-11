import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { CheckCircle2, Clock, Play, Circle, FileText } from 'lucide-react'
import { isPast, isToday, isFuture, format } from 'date-fns'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'worker'],
    queryFn: () => api.getTasks(),
    enabled: !!user,
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; notes?: string }) =>
      api.updateTask(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTaskStatus = (taskId: string, status: string) => {
    const validStatus = status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    updateTaskMutation.mutate({ id: taskId, status: validStatus })
  }

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING')
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')

  const getDueDateBadge = (date: string) => {
    const taskDate = new Date(date)
    if (isPast(taskDate) && !isToday(taskDate)) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>
    }
    if (isToday(taskDate)) {
      return <Badge variant="default" className="bg-yellow-600 text-xs">Due Today</Badge>
    }
    if (isFuture(taskDate)) {
      return <Badge variant="outline" className="text-xs">Upcoming</Badge>
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-gray-500">Loading your tasks...</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-600">
          {tasks.length} total • {pendingTasks.length} pending • {inProgressTasks.length} in progress • {completedTasks.length} completed
        </p>
      </div>

      {/* Task Lists */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No tasks assigned to you</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* In Progress Tasks (Priority) */}
          {inProgressTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                In Progress ({inProgressTasks.length})
              </h2>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{
                      ...task,
                      notes: task.notes || undefined,
                      status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
                    }}
                    onStatusChange={updateTaskStatus}
                    getDueDateBadge={getDueDateBadge}
                    isUpdating={updateTaskMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Pending ({pendingTasks.length})
              </h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{
                      ...task,
                      notes: task.notes || undefined,
                      status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
                    }}
                    onStatusChange={updateTaskStatus}
                    getDueDateBadge={getDueDateBadge}
                    isUpdating={updateTaskMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks (Collapsible) */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{
                      ...task,
                      notes: task.notes || undefined,
                      status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
                    }}
                    onStatusChange={updateTaskStatus}
                    getDueDateBadge={getDueDateBadge}
                    isUpdating={updateTaskMutation.isPending}
                  />
                ))}
                {completedTasks.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{completedTasks.length - 5} more completed tasks
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface TaskCardProps {
  task: {
    id: string
    title: string
    project?: { name: string }
    date: string
    duration?: number
    status: string
    notes?: string
  }
  onStatusChange: (taskId: string, status: string) => void
  getDueDateBadge: (date: string) => React.ReactNode
  isUpdating: boolean
}

function TaskCard({ task, onStatusChange, getDueDateBadge, isUpdating }: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false)

  const nextStatus =
    task.status === 'PENDING'
      ? 'IN_PROGRESS'
      : task.status === 'IN_PROGRESS'
      ? 'COMPLETED'
      : null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base mb-1">{task.title}</h3>
              {task.project && (
                <p className="text-sm text-gray-600 truncate">{task.project.name}</p>
              )}
            </div>
            <StatusBadge status={task.status as any} />
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(task.date), 'MMM d, yyyy')}</span>
            </div>
            {getDueDateBadge(task.date)}
          </div>

          {/* Duration */}
          {task.duration && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Estimated:</span> {task.duration}h
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="text-xs text-gray-600 p-0 h-auto"
              >
                <FileText className="h-3 w-3 mr-1" />
                {showNotes ? 'Hide' : 'Show'} Notes
              </Button>
              {showNotes && (
                <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  {task.notes}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {nextStatus && (
            <div className="pt-2 border-t border-gray-100">
              <Button
                onClick={() => onStatusChange(task.id, nextStatus)}
                disabled={isUpdating}
                className="w-full"
                size="sm"
              >
                {task.status === 'PENDING' ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Task
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
