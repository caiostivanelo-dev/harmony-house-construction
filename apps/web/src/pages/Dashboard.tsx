import { PageHeader } from '@/components/ui/page-header'
import { SummaryCard } from '@/components/ui/summary-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Receipt, FileCheck, DollarSign } from 'lucide-react'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useProjects } from '@/hooks/useProjects'
import { useCustomers } from '@/hooks/useCustomers'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: projects = [] } = useProjects()
  const { data: customers = [] } = useCustomers()
  const { canViewFinancials, user } = useAuth()
  
  // WORKER should not see dashboard financial summaries
  if (user?.role === 'WORKER') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Your assigned tasks and time tracking"
        />
        <div className="text-center py-12 text-gray-500">
          Access limited. Please use Task List and Time Tracking.
        </div>
      </div>
    )
  }

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your construction business"
        />
        <div className="text-center py-12 text-gray-500">Loading dashboard data...</div>
      </div>
    )
  }

  const estimates = summary?.estimates || { total: 0, totalAmount: 0, byStatus: {} }
  const changeOrders = summary?.changeOrders || { total: 0, totalAmount: 0, byStatus: {} }
  const invoicesSummary = summary?.invoices || { total: 0, totalAmount: 0, byStatus: {} }

  const acceptedEstimates = estimates.byStatus?.ACCEPTED || { count: 0, amount: 0 }
  const pendingEstimates = estimates.byStatus?.PENDING || { count: 0, amount: 0 }
  const draftEstimates = estimates.byStatus?.DRAFT || { count: 0, amount: 0 }
  
  const approvedChangeOrders = changeOrders.byStatus?.ACCEPTED || { count: 0, amount: 0 }
  const pendingChangeOrders = changeOrders.byStatus?.PENDING || { count: 0, amount: 0 }
  
  const paidInvoices = invoicesSummary.byStatus?.PAID || { count: 0, amount: 0 }
  const pendingInvoices = invoicesSummary.byStatus?.PENDING || { count: 0, amount: 0 }
  const overdueInvoices = invoicesSummary.byStatus?.OVERDUE || { count: 0, amount: 0 }

  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const activeCustomers = customers.filter((c) => (c as any).status === 'ACTIVE').length
  const pendingInvoicesCount = pendingInvoices.count || 0
  const overdueInvoicesCount = overdueInvoices.count || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your construction business"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Estimates"
          value={`$${estimates.totalAmount.toLocaleString()}`}
          subtitle={`${estimates.total} estimates`}
          icon={<FileText className="h-5 w-5" />}
        >
          <div className="mt-4 space-y-2 pt-4 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Accepted:</span>
              <span className="font-medium">
                ${acceptedEstimates.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium">
                ${pendingEstimates.amount.toLocaleString()}
              </span>
            </div>
            {draftEstimates.count > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Draft:</span>
                <span className="font-medium">
                  ${draftEstimates.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </SummaryCard>

        <SummaryCard
          title="Change Orders"
          value={`$${changeOrders.totalAmount.toLocaleString()}`}
          subtitle={`${changeOrders.total} change orders`}
          icon={<FileCheck className="h-5 w-5" />}
        >
          <div className="mt-4 space-y-2 pt-4 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Approved:</span>
              <span className="font-medium">
                ${approvedChangeOrders.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium">
                ${pendingChangeOrders.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Invoices"
          value={`$${invoicesSummary.totalAmount.toLocaleString()}`}
          subtitle={`${invoicesSummary.total} invoices`}
          icon={<Receipt className="h-5 w-5" />}
        >
          <div className="mt-4 space-y-2 pt-4 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Paid:</span>
              <span className="font-medium">
                ${paidInvoices.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium">
                ${pendingInvoices.amount.toLocaleString()}
              </span>
            </div>
            {overdueInvoices.count > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Overdue:</span>
                <span className="font-medium text-red-600">
                  ${overdueInvoices.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </SummaryCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-gray-500 mt-1">{activeProjects} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeCustomers} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoicesCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {overdueInvoicesCount} overdue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              <span>{paidInvoices.amount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Executive View Metrics */}
      {canViewFinancials() && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {summary.outstandingBalance !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${summary.outstandingBalance.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">All invoices</p>
              </CardContent>
            </Card>
          )}

          {summary.paidThisPeriod !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Paid This Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${summary.paidThisPeriod.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </CardContent>
            </Card>
          )}

          {summary.revenueByStatus && Object.keys(summary.revenueByStatus).length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Revenue by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(summary.revenueByStatus).map(([status, amount]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
