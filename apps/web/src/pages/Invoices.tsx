import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'

const mockInvoices = [
  {
    id: '1',
    number: 'INV-2024-001',
    customer: 'John Smith',
    project: 'Kitchen Remodel',
    totalValue: 45000,
    balanceDue: 0,
    status: 'PAID' as const,
    sentDate: '2024-01-15',
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    number: 'INV-2024-005',
    customer: 'Sarah Johnson',
    project: 'Bathroom Renovation',
    totalValue: 30000,
    balanceDue: 15000,
    status: 'PENDING' as const,
    sentDate: '2024-02-01',
    dueDate: '2024-03-01',
  },
  {
    id: '3',
    number: 'INV-2024-012',
    customer: 'Mike Davis',
    project: 'Deck Installation',
    totalValue: 25000,
    balanceDue: 25000,
    status: 'OVERDUE' as const,
    sentDate: '2024-02-15',
    dueDate: '2024-03-15',
  },
]

export default function Invoices() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage your invoices"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {mockInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.number}
                    </h3>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{invoice.customer}</p>
                  <p className="text-sm text-gray-600">{invoice.project}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${invoice.totalValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Balance: ${invoice.balanceDue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                <div>
                  <span>Sent: </span>
                  <span>{new Date(invoice.sentDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span>Due: </span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
