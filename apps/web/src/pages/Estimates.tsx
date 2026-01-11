import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { SummaryCard } from '@/components/ui/summary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Download, MoreVertical, CheckCircle2, Clock, ThumbsUp, PlusCircle, Trash2 } from 'lucide-react'
import { useEstimates } from '@/hooks/useEstimates'
import { useDocuments } from '@/hooks/useDocuments'
import { useDeleteDocument, useCreateDocument } from '@/hooks/useDocumentMutations'
import { useCustomers } from '@/hooks/useCustomers'
import { Document } from '@/lib/api'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function Estimates() {
  const navigate = useNavigate()
  const { data: estimates = [], isLoading, error } = useEstimates()
  const { data: invoices = [] } = useDocuments({ type: 'INVOICE' })
  const { data: customers = [] } = useCustomers()
  const deleteMutation = useDeleteDocument()
  const createMutation = useCreateDocument()
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(null)
    }
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const all = estimates.length
    const draft = estimates.filter(e => e.status === 'DRAFT').length
    const pending = estimates.filter(e => e.status === 'PENDING').length
    const paid = estimates.filter(e => e.status === 'PAID').length
    
    const allValue = estimates.reduce((sum, e) => sum + (e.totalValue || 0), 0)
    const draftValue = estimates.filter(e => e.status === 'DRAFT').reduce((sum, e) => sum + (e.totalValue || 0), 0)
    const pendingValue = estimates.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + (e.totalValue || 0), 0)
    const paidValue = estimates.filter(e => e.status === 'PAID').reduce((sum, e) => sum + (e.totalValue || 0), 0)

    return { all, draft, pending, paid, allValue, draftValue, pendingValue, paidValue }
  }, [estimates])

  // Filter estimates by search
  const filteredEstimates = useMemo(() => {
    if (!searchQuery) return estimates
    
    const query = searchQuery.toLowerCase()
    return estimates.filter(estimate => {
      const customerName = typeof estimate.customer === 'object' 
        ? estimate.customer?.name?.toLowerCase() || ''
        : ''
      const projectName = estimate.project 
        ? (typeof estimate.project === 'object' ? estimate.project?.name?.toLowerCase() : '')
        : ''
      const number = estimate.number?.toLowerCase() || ''
      
      return customerName.includes(query) || projectName.includes(query) || number.includes(query)
    })
  }, [estimates, searchQuery])

  // Get invoices related to an estimate (same project or customer)
  const getEstimateInvoices = (estimate: Document) => {
    return invoices.filter(invoice => {
      if (invoice.projectId && estimate.projectId) {
        return invoice.projectId === estimate.projectId
      }
      return invoice.customerId === estimate.customerId
    })
  }

  // Calculate invoicing progress for an estimate
  const getInvoicingProgress = (estimate: Document) => {
    const relatedInvoices = getEstimateInvoices(estimate)
    const totalInvoiced = relatedInvoices.reduce((sum, inv) => sum + (inv.totalValue || 0), 0)
    const totalPaid = relatedInvoices
      .filter(inv => inv.status === 'PAID' || inv.balanceDue === 0)
      .reduce((sum, inv) => sum + (inv.totalValue || 0), 0)
    const totalDue = relatedInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0)
    const toBeInvoiced = Math.max(0, (estimate.totalValue || 0) - totalInvoiced)
    const progress = estimate.totalValue > 0 ? (totalInvoiced / estimate.totalValue) * 100 : 0

    return {
      totalInvoiced,
      totalPaid,
      totalDue,
      toBeInvoiced,
      progress: Math.min(100, Math.max(0, progress)),
    }
  }

  const handleDownloadPDF = async (estimate: Document) => {
    setDownloadingPDF(estimate.id)
    try {
      const blob = await api.downloadEstimatePDF(estimate.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `estimate-${estimate.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    } finally {
      setDownloadingPDF(null)
    }
  }

  const handleCreateNewEstimate = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer')
      return
    }

    try {
      const newEstimate = await createMutation.mutateAsync({
        type: 'ESTIMATE',
        customerId: selectedCustomerId,
        totalValue: 0,
        balanceDue: 0,
        status: 'DRAFT',
        estimateDate: new Date().toISOString().split('T')[0],
        sections: [],
      })

      setCustomerSelectOpen(false)
      setSelectedCustomerId('')
      navigate(`/estimates/${newEstimate.id}`)
    } catch (error) {
      console.error('Error creating estimate:', error)
      alert('Failed to create estimate')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
      case 'PAID':
        return 'border-l-green-500'
      case 'PENDING':
        return 'border-l-blue-500'
      case 'DRAFT':
        return 'border-l-gray-400'
      case 'OVERDUE':
        return 'border-l-red-500'
      default:
        return 'border-l-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
      case 'PAID':
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'DRAFT':
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Estimates"
          description="Manage your estimates"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          }
        />
        <div className="text-center py-12 text-gray-500">Loading estimates...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Estimates"
          description="Manage your estimates"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          }
        />
        <div className="text-center py-12 text-red-500">
          Error loading estimates: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search Estimate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            May 1 - May 21, 2024
          </Button>
          <Button variant="outline" size="sm">
            Filter Estimates
          </Button>
          <Button
            onClick={() => {
              setCustomerSelectOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </div>

      {/* Customer Selection Dialog for New Estimate */}
      <Dialog open={customerSelectOpen} onOpenChange={setCustomerSelectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="customer-select">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Select
                id="customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerSelectOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewEstimate}
              disabled={!selectedCustomerId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Estimate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title={`ALL (${summary.all})`}
          value={`$${(summary.allValue / 1000).toFixed(2)}k`}
        />
        <SummaryCard
          title={`DRAFT (${summary.draft})`}
          value={`$${(summary.draftValue / 1000).toFixed(2)}k`}
        />
        <SummaryCard
          title={`PENDING (${summary.pending})`}
          value={`$${(summary.pendingValue / 1000).toFixed(2)}k`}
        />
        <SummaryCard
          title={`PAID (${summary.paid})`}
          value={`$${(summary.paidValue / 1000).toFixed(2)}k`}
        />
      </div>

      {/* Estimates Grid */}
      {filteredEstimates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No estimates found matching your search.' : 'No estimates found. Create your first estimate to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredEstimates.map((estimate) => {
            const customerName = typeof estimate.customer === 'object' 
              ? estimate.customer?.name || 'Unknown'
              : 'Unknown'
            
            const projectName = estimate.project 
              ? (typeof estimate.project === 'object' ? estimate.project?.name : 'Unknown')
              : null

            const estimateDate = estimate.estimateDate 
              ? new Date(estimate.estimateDate)
              : estimate.createdAt 
              ? new Date(estimate.createdAt)
              : new Date()

            const items = estimate.items && Array.isArray(estimate.items) ? estimate.items : []
            const isAccepted = estimate.status === 'ACCEPTED'
            const invoicingProgress = isAccepted ? getInvoicingProgress(estimate) : null

            return (
              <Card 
                key={estimate.id} 
                className={`${getStatusColor(estimate.status)} border-l-4 relative cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => navigate(`/estimates/${estimate.id}`)}
              >
                <CardContent className="p-5">
                  {/* Header with status and menu */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={estimate.status as any} />
                      {getStatusIcon(estimate.status)}
                    </div>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpen(menuOpen === estimate.id ? null : estimate.id)
                        }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {menuOpen === estimate.id && (
                        <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Tem certeza que deseja excluir o estimate ${estimate.number}?`)) {
                                deleteMutation.mutate(estimate.id, {
                                  onSuccess: () => {
                                    setMenuOpen(null)
                                  },
                                })
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client and Project */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      {customerName}
                      {projectName && ` - ${projectName}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(estimateDate, 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Estimate Total */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ${estimate.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Invoicing Progress (for ACCEPTED) */}
                  {isAccepted && invoicingProgress && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Invoicing Status</span>
                        <span className="text-xs font-bold text-gray-900">
                          {Math.round(invoicingProgress.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${invoicingProgress.progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Total Invoiced:</span>
                          <span className="font-medium ml-1">${invoicingProgress.totalInvoiced.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">To Be Invoiced:</span>
                          <span className="font-medium ml-1">${invoicingProgress.toBeInvoiced.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Paid:</span>
                          <span className="font-medium ml-1">${invoicingProgress.totalPaid.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <span className="font-medium ml-1">${invoicingProgress.totalDue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Estimate Items */}
                  {items.length > 0 && items.length <= 3 && (
                    <div className="mb-4 space-y-2">
                      {items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-gray-700">{item.category}</span>
                            {estimate.status === 'ACCEPTED' && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            {estimate.status === 'PENDING' && (
                              <Clock className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            ${(item.cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                      {items.length === 0 && estimate.status === 'ACCEPTED' && (
                        <p className="text-sm text-gray-600 italic">Ready for invoice!</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    {estimate.status === 'ACCEPTED' && (
                      <Button variant="outline" size="sm" className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {invoicingProgress && invoicingProgress.toBeInvoiced > 0
                          ? 'Add another invoice for this estimate'
                          : 'Add invoice for this estimate'}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/estimates/${estimate.id}`)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownloadPDF(estimate)}
                        disabled={downloadingPDF === estimate.id}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
