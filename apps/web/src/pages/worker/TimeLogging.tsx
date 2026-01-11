import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select-full'
import { Play, Square, Clock, Plus } from 'lucide-react'
// Simple date formatting helper
const format = (date: Date, formatStr: string) => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  if (formatStr === 'h:mm a') {
    return `${displayHours}:${displayMinutes} ${ampm}`
  }
  return date.toLocaleString()
}

export default function TimeLogging() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [showManualEntry, setShowManualEntry] = useState(false)

  // Get assigned tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'worker'],
    queryFn: () => api.getTasks(),
    enabled: !!user,
  })

  // Get today's time logs
  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timelogs', 'worker', 'today'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0]
      return api.getTimeLogs({ userId: user?.id, date: today })
    },
    enabled: !!user,
  })

  const createTimeLogMutation = useMutation({
    mutationFn: (data: {
      taskId: string
      userId: string
      hours: number
      type: 'REGULAR' | 'OVERTIME'
      date: string
    }) => api.createTimeLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelogs'] })
      setShowManualEntry(false)
      setSelectedTask('')
    },
  })

  // Timer logic
  useEffect(() => {
    if (!timerActive) return

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive])

  const startTimer = () => {
    if (!selectedTask) {
      alert('Please select a task first')
      return
    }
    setTimerActive(true)
  }

  const stopTimer = () => {
    if (!timerActive || !selectedTask) return

    const hours = timerSeconds / 3600
    if (hours < 0.01) {
      alert('Time logged must be at least 1 minute')
      setTimerActive(false)
      setTimerSeconds(0)
      return
    }

    if (!user?.id) return

    createTimeLogMutation.mutate({
      taskId: selectedTask,
      userId: user.id,
      hours: Math.round(hours * 100) / 100,
      type: 'REGULAR',
      date: new Date().toISOString().split('T')[0],
    })

    setTimerActive(false)
    setTimerSeconds(0)
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const todayTotalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0)
  const regularHours = timeLogs.filter((l) => l.type === 'REGULAR').reduce((sum, l) => sum + l.hours, 0)
  const overtimeHours = timeLogs.filter((l) => l.type === 'OVERTIME').reduce((sum, l) => sum + l.hours, 0)

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Time Logging</h1>
        <p className="text-sm text-gray-600">Track your work hours</p>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{todayTotalHours.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{regularHours.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Regular</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{overtimeHours.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Overtime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="task-select">Select Task</Label>
            <Select id="task-select" value={selectedTask} onValueChange={setSelectedTask} disabled={timerActive} className="mt-1">
              <option value="">Choose a task...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.project?.name ? `- ${task.project.name}` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="text-center py-6">
            <div className="text-4xl font-mono font-bold text-gray-900 mb-4">
              {formatTime(timerSeconds)}
            </div>
            <div className="flex items-center justify-center gap-3">
              {!timerActive ? (
                <Button onClick={startTimer} disabled={!selectedTask} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start Timer
                </Button>
              ) : (
                <Button onClick={stopTimer} variant="destructive" size="lg" className="gap-2">
                  <Square className="h-5 w-5" />
                  Stop & Log
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Manual Entry</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualEntry(!showManualEntry)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {showManualEntry ? 'Hide' : 'Add'}
            </Button>
          </div>
        </CardHeader>
        {showManualEntry && (
          <CardContent>
            <ManualTimeEntry
              tasks={tasks}
              onSubmit={(data) => {
                if (!user?.id) return
                createTimeLogMutation.mutate({ ...data, userId: user.id })
              }}
              isLoading={createTimeLogMutation.isPending}
            />
          </CardContent>
        )}
      </Card>

      {/* Recent Time Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Time Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {timeLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No time logs today</p>
          ) : (
            <div className="space-y-3">
              {timeLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {log.task?.title || 'Unknown Task'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(log.date), 'h:mm a')} • {log.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{log.hours.toFixed(2)}h</p>
                    {log.approved ? (
                      <p className="text-xs text-green-600">Approved</p>
                    ) : (
                      <p className="text-xs text-yellow-600">Pending</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ManualTimeEntryProps {
  tasks: Array<{ id: string; title: string; project?: { name: string } }>
  onSubmit: (data: {
    taskId: string
    hours: number
    type: 'REGULAR' | 'OVERTIME'
    date: string
  }) => void
  isLoading: boolean
}

function ManualTimeEntry({ tasks, onSubmit, isLoading }: ManualTimeEntryProps) {
  const [taskId, setTaskId] = useState('')
  const [hours, setHours] = useState('')
  const [type, setType] = useState<'REGULAR' | 'OVERTIME'>('REGULAR')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId || !hours) {
      alert('Please fill in all fields')
      return
    }

    const hoursNum = parseFloat(hours)
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('Please enter a valid number of hours')
      return
    }

    onSubmit({
      taskId,
      hours: hoursNum,
      type,
      date,
    })

    // Reset form
    setTaskId('')
    setHours('')
    setType('REGULAR')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="manual-task">Task</Label>
        <Select id="manual-task" value={taskId} onValueChange={setTaskId} required className="mt-1">
          <option value="">Select task...</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title} {task.project?.name ? `- ${task.project.name}` : ''}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="hours">Hours</Label>
        <Input
          id="hours"
          type="number"
          step="0.25"
          min="0.25"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="2.5"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select id="type" value={type} onValueChange={(v) => setType(v as 'REGULAR' | 'OVERTIME')} className="mt-1">
          <option value="REGULAR">Regular</option>
          <option value="OVERTIME">Overtime</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        <Clock className="h-4 w-4 mr-2" />
        Log Time
      </Button>
    </form>
  )
}
