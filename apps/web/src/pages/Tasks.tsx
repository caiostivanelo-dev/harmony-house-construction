import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { TaskForm } from '@/components/forms/TaskForm'
import { TaskAssignment } from '@/components/forms/TaskAssignment'
import { Calendar, Clock, ChevronDown, ChevronUp, Plus, UserPlus } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/lib/api'

interface TaskCardProps {
  task: {
    id: string
    title: string
    date: string
    duration: number
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    notes?: string | null
    project?: {
      id: string
      name: string
    } | null
    assignedUsers?: Array<{
      id: string
      name: string
      email: string
    }>
  }
  isExpanded: boolean
  onToggle: () => void
  onAssign?: () => void
  canAssign?: boolean
}

function TaskCard({ task, isExpanded, onToggle, onAssign, canAssign }: TaskCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {task.title}
              </h3>
              <StatusBadge status={task.status} />
            </div>
            
            {/* Assigned Users */}
            {task.assignedUsers && task.assignedUsers.length > 0 && (
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Assigned to:</span>
                {task.assignedUsers.map((user) => (
                  <span key={user.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {user.name}
                  </span>
                ))}
              </div>
            )}
            
            <div className="ml-8 space-y-2">
              {task.project && (
                <p className="text-sm text-gray-600">{task.project.name}</p>
              )}
              {task.notes && (
                <p className="text-sm text-gray-700">{task.notes}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(task.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{task.duration} hours</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {task.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{task.notes}</p>
                    </div>
                  )}
                  {canAssign && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onAssign}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {task.assignedUsers && task.assignedUsers.length > 0 ? 'Edit Assignment' : 'Assign Workers'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Tasks() {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: projects = [] } = useProjects()
  const { data: users = [] } = useUsers()
  const { canManageTasks } = useAuth()

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Task List"
          description="Manage your construction tasks"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          }
        />
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Task List"
          description="Manage your construction tasks"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          }
        />
        <div className="text-center py-12 text-red-500">
          Error loading tasks: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task List"
        description="Manage your construction tasks"
        action={
          <Button
            onClick={() => {
              setSelectedTask(null)
              setTaskFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        }
      />

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tasks found</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isExpanded={expandedTasks.has(task.id)}
              canAssign={canManageTasks()}
              onToggle={() => toggleTask(task.id)}
              onAssign={() => {
                setSelectedTask(task)
                setIsAssignmentOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={selectedTask}
        projects={projects}
      />
      {selectedTask && (
        <TaskAssignment
          open={isAssignmentOpen}
          onOpenChange={setIsAssignmentOpen}
          task={selectedTask}
          availableUsers={users}
        />
      )}
    </div>
  )
}
