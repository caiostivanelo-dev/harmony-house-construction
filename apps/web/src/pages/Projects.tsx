import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { SummaryCard } from '@/components/ui/summary-card'
import { Plus, Download, Mail } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useProjectFinancials } from '@/hooks/useProjectFinancials'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Projects() {
  const { data: projects = [], isLoading, error } = useProjects()
  const { canViewFinancials } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const { data: projectFinancials } = useProjectFinancials(selectedProjectId || '')

  // Use backend-calculated aggregates
  const projectsWithValues = projects.map((project) => {
    // Use totalInvoicedValue if available, otherwise use totalEstimatedValue
    const value = project.totalInvoicedValue || project.totalEstimatedValue || 0
    
    // Calculate progress (placeholder - would need tasks)
    const progress = 0

    return {
      ...project,
      value,
      progress,
      customer: project.customer?.name || 'Unknown',
      status: project.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD',
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Manage your construction projects"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          }
        />
        <div className="text-center py-12 text-gray-500">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Manage your construction projects"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          }
        />
        <div className="text-center py-12 text-red-500">
          Error loading projects: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your construction projects"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        }
      />

      {projectsWithValues.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No projects found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsWithValues.map((project) => (
              <Card 
                key={project.id}
                className={selectedProjectId === project.id ? 'ring-2 ring-gray-900' : ''}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{project.customer}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="text-gray-900 font-semibold">
                        ${project.value.toLocaleString()}
                      </span>
                    </div>
                    {project.progress > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => setSelectedProjectId(
                        selectedProjectId === project.id ? null : project.id
                      )}
                    >
                      {selectedProjectId === project.id ? 'Hide' : 'View'} Financial Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Financial Summary Section */}
          {selectedProjectId && projectFinancials && canViewFinancials() && (
            <div className="mt-6 p-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Financial Summary: {projectFinancials.project.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!selectedProjectId) return
                      if (!window.confirm('Send financial summary to customer email?')) return

                      setIsSendingEmail(true)
                      try {
                        const token = localStorage.getItem('token')
                        const response = await fetch(
                          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/projects/${selectedProjectId}/financials/email`,
                          {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                          }
                        )

                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.message || 'Failed to send email')
                        }

                        alert('Financial summary email sent successfully!')
                      } catch (error) {
                        console.error('Error sending email:', error)
                        alert(error instanceof Error ? error.message : 'Failed to send email. Please try again.')
                      } finally {
                        setIsSendingEmail(false)
                      }
                    }}
                    disabled={isSendingEmail}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSendingEmail ? 'Sending...' : 'Email Summary'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!selectedProjectId) return
                      try {
                        const token = localStorage.getItem('token')
                        const response = await fetch(
                          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/projects/${selectedProjectId}/financials/pdf`,
                          {
                            headers: {
                              'Authorization': `Bearer ${token}`,
                            },
                          }
                        )

                        if (!response.ok) {
                          throw new Error('Failed to generate PDF')
                        }

                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `project-financials-${selectedProjectId}.pdf`
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)
                      } catch (error) {
                        console.error('Error downloading PDF:', error)
                        alert('Failed to download PDF. Please try again.')
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                  title="Estimated Value"
                  value={`$${projectFinancials.financials.totalEstimatedValue.toLocaleString()}`}
                />
                <SummaryCard
                  title="Invoiced Value"
                  value={`$${projectFinancials.financials.totalInvoicedValue.toLocaleString()}`}
                />
                {projectFinancials.financials.totalPaid !== undefined && (
                  <SummaryCard
                    title="Total Paid"
                    value={`$${projectFinancials.financials.totalPaid.toLocaleString()}`}
                  />
                )}
                {projectFinancials.financials.totalOutstanding !== undefined && (
                  <SummaryCard
                    title="Outstanding"
                    value={`$${projectFinancials.financials.totalOutstanding.toLocaleString()}`}
                  />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Documents ({projectFinancials.documents.length})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        {canViewFinancials() && (
                          <>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Balance</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                      {projectFinancials.documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{doc.number}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{doc.type}</td>
                          <td className="px-4 py-2">
                            <StatusBadge status={doc.status as any} />
                          </td>
                          {canViewFinancials() && (
                            <>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {doc.totalValue !== undefined
                                  ? `$${doc.totalValue.toLocaleString()}`
                                  : 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {doc.balanceDue !== undefined
                                  ? `$${doc.balanceDue.toLocaleString()}`
                                  : 'N/A'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
