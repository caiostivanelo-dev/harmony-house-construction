import { PageHeader } from '@/components/ui/page-header'
import { SummaryCard } from '@/components/ui/summary-card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Clock, Plus } from 'lucide-react'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useMemo } from 'react'

export default function TimeTracking() {
  const { data: timeLogs = [], isLoading, error } = useTimeLogs()

  const summary = useMemo(() => {
    const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0)
    const regularHours = timeLogs
      .filter((log) => log.type === 'REGULAR')
      .reduce((sum, log) => sum + log.hours, 0)
    const overtimeHours = timeLogs
      .filter((log) => log.type === 'OVERTIME')
      .reduce((sum, log) => sum + log.hours, 0)
    const totalPaid = 12450 // Placeholder - would need approved hours calculation

    return {
      totalHours,
      regularHours,
      overtimeHours,
      totalPaid,
    }
  }, [timeLogs])

  // Group logs by user
  const workers = useMemo(() => {
    const logsByUser = timeLogs.reduce((acc, log) => {
      const userId = log.user?.id || log.userId
      const userName = log.user?.name || 'Unknown User'

      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName,
          logs: [],
        }
      }
      acc[userId].logs.push(log)
      return acc
    }, {} as Record<string, { userId: string; userName: string; logs: typeof timeLogs }>)

    return Object.values(logsByUser).map((userData) => {
      const approvedLogs = userData.logs.filter((log) => log.approved)
      const unapprovedLogs = userData.logs.filter((log) => !log.approved)
      const approvedHours = approvedLogs.reduce((sum, log) => sum + log.hours, 0)
      const unapprovedHours = unapprovedLogs.reduce((sum, log) => sum + log.hours, 0)

      return {
        ...userData,
        approvedHours,
        unapprovedHours,
        approvedLogs,
        unapprovedLogs,
      }
    })
  }, [timeLogs])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Time Tracking"
          description="Track and manage work hours"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          }
        />
        <div className="text-center py-12 text-gray-500">Loading time logs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Time Tracking"
          description="Track and manage work hours"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          }
        />
        <div className="text-center py-12 text-red-500">
          Error loading time logs: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Track and manage work hours"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Regular Hours"
          value={summary.regularHours}
          subtitle="Standard work hours"
          icon={<Clock className="h-5 w-5" />}
        />
        <SummaryCard
          title="Overtime Hours"
          value={summary.overtimeHours}
          subtitle="Overtime work hours"
          icon={<Clock className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Hours"
          value={summary.totalHours}
          subtitle="All hours logged"
          icon={<Clock className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Paid"
          value={`$${summary.totalPaid.toLocaleString()}`}
          subtitle="Approved hours"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Worker Sections */}
      {workers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No time logs found</div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
          
          {workers.map((worker) => (
            <Card key={worker.userId}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar
                    alt={worker.userName}
                    fallback={worker.userName.split(' ').map((n) => n[0]).join('')}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {worker.userName}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Approved Hours</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {worker.approvedHours}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Unapproved Hours</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {worker.unapprovedHours}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {worker.approvedHours + worker.unapprovedHours}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {worker.unapprovedLogs.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Logs */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Time Logs</h4>
                  
                  {/* Approved Logs */}
                  {worker.approvedLogs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                        Approved ({worker.approvedLogs.length})
                      </p>
                      <div className="space-y-2">
                        {worker.approvedLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {log.task?.title || 'Unknown Task'}
                                </p>
                                {log.type === 'OVERTIME' && (
                                  <StatusBadge status="PENDING" className="text-xs" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {log.task?.project?.name || 'Unknown Project'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(log.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {log.hours} hrs
                              </p>
                              <StatusBadge status="PAID" className="text-xs mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unapproved Logs */}
                  {worker.unapprovedLogs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                        Pending Approval ({worker.unapprovedLogs.length})
                      </p>
                      <div className="space-y-2">
                        {worker.unapprovedLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {log.task?.title || 'Unknown Task'}
                                </p>
                                {log.type === 'OVERTIME' && (
                                  <StatusBadge status="PENDING" className="text-xs" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {log.task?.project?.name || 'Unknown Project'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(log.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {log.hours} hrs
                              </p>
                              <StatusBadge status="PENDING" className="text-xs mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
