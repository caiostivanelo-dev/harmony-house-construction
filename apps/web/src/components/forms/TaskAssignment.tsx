import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select-full'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface User {
  id: string
  name: string
  email: string
  role: string
  companyId?: string
  createdAt?: string
  updatedAt?: string
}

interface TaskAssignmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: {
    id: string
    title: string
    assignedUsers?: Array<{ id: string; name: string; email: string }>
  }
  availableUsers: User[]
}

export function TaskAssignment({ open, onOpenChange, task, availableUsers }: TaskAssignmentProps) {
  const queryClient = useQueryClient()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  useEffect(() => {
    if (task?.assignedUsers) {
      setSelectedUserIds(task.assignedUsers.map((u) => u.id))
    } else {
      setSelectedUserIds([])
    }
  }, [task])

  const assignMutation = useMutation({
    mutationFn: (userIds: string[]) => api.assignTaskUsers(task.id, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onOpenChange(false)
    },
  })

  const handleSubmit = () => {
    assignMutation.mutate(selectedUserIds)
  }

  const handleSelectUser = (userId: string) => {
    if (userId && !selectedUserIds.includes(userId)) {
      setSelectedUserIds([...selectedUserIds, userId])
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
  }

  const availableToSelect = availableUsers.filter((u) => !selectedUserIds.includes(u.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Workers to Task</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">{task.title}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Assigned Users */}
          {selectedUserIds.length > 0 && (
            <div>
              <Label className="mb-2 block">Assigned Workers</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUserIds.map((userId) => {
                  const user = availableUsers.find((u) => u.id === userId)
                  if (!user) return null
                  return (
                    <Badge key={userId} variant="default" className="flex items-center gap-1 px-2 py-1">
                      {user.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(userId)}
                        className="ml-1 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add User Selector */}
          {availableToSelect.length > 0 && (
            <div>
              <Label htmlFor="user-select">Add Worker</Label>
              <Select id="user-select" className="mt-1" onValueChange={handleSelectUser} defaultValue="">
                <option value="">Select a worker...</option>
                {availableToSelect
                  .filter((u) => u.role === 'WORKER')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </Select>
            </div>
          )}

          {availableToSelect.filter((u) => u.role === 'WORKER').length === 0 && (
            <p className="text-sm text-gray-500">All workers are already assigned to this task.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={assignMutation.isPending}>
            {assignMutation.isPending ? 'Saving...' : 'Save Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
