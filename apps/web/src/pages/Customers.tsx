import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Search, Plus } from 'lucide-react'
import { useCustomers } from '@/hooks/useCustomers'
import { useMemo, useState } from 'react'
import { CustomerForm } from '@/components/forms/CustomerForm'

export default function Customers() {
  const { data: customers = [], isLoading, error } = useCustomers()
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Transform backend data to match UI expectations
  const transformedCustomers = useMemo(() => {
    return customers.map((customer) => {
      const emails = typeof customer.emails === 'string' 
        ? { work: customer.emails, personal: '' }
        : customer.emails || { work: '', personal: '' }
      
      const phones = typeof customer.phones === 'string'
        ? { work: customer.phones, personal: '' }
        : customer.phones || { work: '', personal: '' }

      // Use backend-calculated aggregates
      return {
        id: customer.id,
        name: customer.name,
        email: emails.work || emails.personal || '',
        phone: phones.work || phones.personal || '',
        status: 'ACTIVE' as const, // Default status
        projectsCount: customer.projectsCount || 0,
        totalValue: customer.totalInvoicesValue || customer.totalEstimatesValue || 0,
      }
    })
  }, [customers])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Customers"
          description="Manage your customer relationships"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          }
        />
        <div className="text-center py-12 text-gray-500">Loading customers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Customers"
          description="Manage your customer relationships"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          }
        />
        <div className="text-center py-12 text-red-500">
          Error loading customers: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer relationships"
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
        />
      </div>

      {transformedCustomers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No customers found</div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transformedCustomers.map((customer) => (
                <Link key={customer.id} to={`/customers/${customer.id}`}>
                  <tr className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.projectsCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${customer.totalValue.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
