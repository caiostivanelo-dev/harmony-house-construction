import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCreateTask, useUpdateTask } from '@/hooks/useTaskMutations'
import { Task, Project } from '@/lib/api'
import { useEffect } from 'react'

interface TaskFormData {
  title: string
  projectId: string
  date: string
  duration: number
  notes?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  projectId?: string
  projects?: Project[]
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  projectId,
  projects = [],
}: TaskFormProps) {
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      projectId: projectId || '',
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      status: 'PENDING',
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        projectId: task.projectId,
        date: task.date.split('T')[0],
        duration: task.duration,
        notes: task.notes || '',
        status: task.status,
      })
    } else {
      reset({
        title: '',
        projectId: projectId || (projects.length > 0 ? projects[0].id : ''),
        date: new Date().toISOString().split('T')[0],
        duration: 0,
        status: 'PENDING',
      })
    }
  }, [task, projectId, projects, reset])

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        await updateMutation.mutateAsync({
          id: task.id,
          data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {projects.length > 0 && (
            <div>
              <Label htmlFor="projectId">Project</Label>
              <Select id="projectId" {...register('projectId', { required: true })}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
              {errors.projectId && (
                <p className="text-sm text-red-500 mt-1">Project is required</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: true })}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">Date is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              step="0.5"
              {...register('duration', { required: true, valueAsNumber: true, min: 0 })}
            />
            {errors.duration && (
              <p className="text-sm text-red-500 mt-1">Duration is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('status', { required: true })}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
