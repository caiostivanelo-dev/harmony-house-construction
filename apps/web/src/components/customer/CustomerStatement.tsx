import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SummaryCard } from '@/components/ui/summary-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { useCustomerStatement } from '@/hooks/useCustomerStatement'
import { useAuth } from '@/contexts/AuthContext'
import { FileText, Download, Mail } from 'lucide-react'
import { useState } from 'react'

interface CustomerStatementProps {
  customerId: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerStatement({ customerId, open, onOpenChange }: CustomerStatementProps) {
  const { data: statement, isLoading } = useCustomerStatement(customerId || '')
  const { canViewFinancials } = useAuth()
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleDownloadPDF = async () => {
    if (!customerId) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/customers/${customerId}/statement/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customer-statement-${customerId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleSendEmail = async () => {
    if (!customerId) return
    if (!window.confirm('Send statement to customer email?')) return

    setIsSendingEmail(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/customers/${customerId}/statement/email`,
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

      alert('Statement email sent successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
      alert(error instanceof Error ? error.message : 'Failed to send email. Please try again.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (!customerId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Customer Statement</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                disabled={isLoading || !statement || isSendingEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isLoading || !statement}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading statement...</div>
        ) : !statement ? (
          <div className="text-center py-12 text-gray-500">No statement data available</div>
        ) : (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{statement.customer.name}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p>
                    {typeof statement.customer.emails === 'string'
                      ? statement.customer.emails
                      : statement.customer.emails?.work || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p>
                    {typeof statement.customer.phones === 'string'
                      ? statement.customer.phones
                      : statement.customer.phones?.work || 'N/A'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Generated: {new Date(statement.generatedAt).toLocaleString()}
              </p>
            </div>

            {/* Summary Cards */}
            {canViewFinancials() && statement.totals && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statement.totals.totalInvoiced !== undefined && (
                  <SummaryCard
                    title="Total Invoiced"
                    value={`$${statement.totals.totalInvoiced?.toLocaleString() || '0'}`}
                    icon={<FileText className="h-5 w-5" />}
                  />
                )}
                {statement.totals.totalPaid !== undefined && (
                  <SummaryCard
                    title="Total Paid"
                    value={`$${statement.totals.totalPaid?.toLocaleString() || '0'}`}
                    icon={<FileText className="h-5 w-5" />}
                  />
                )}
                {statement.totals.totalOutstanding !== undefined && (
                  <SummaryCard
                    title="Total Outstanding"
                    value={`$${statement.totals.totalOutstanding?.toLocaleString() || '0'}`}
                    icon={<FileText className="h-5 w-5" />}
                  />
                )}
              </div>
            )}

            {/* Documents Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Project
                      </th>
                      {canViewFinancials() && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Balance
                          </th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statement.documents.length === 0 ? (
                      <tr>
                        <td colSpan={canViewFinancials() ? 7 : 5} className="px-4 py-8 text-center text-gray-500">
                          No documents found
                        </td>
                      </tr>
                    ) : (
                      statement.documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{doc.number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{doc.type}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={doc.status as any} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {doc.project?.name || 'N/A'}
                          </td>
                          {canViewFinancials() && (
                            <>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {doc.totalValue !== undefined
                                  ? `$${doc.totalValue.toLocaleString()}`
                                  : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {doc.balanceDue !== undefined
                                  ? `$${doc.balanceDue.toLocaleString()}`
                                  : 'N/A'}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
