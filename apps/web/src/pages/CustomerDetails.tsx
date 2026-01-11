import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/page-header'
import { SummaryCard } from '@/components/ui/summary-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { DocumentsTable } from '@/components/documents/DocumentsTable'
import { DocumentForm } from '@/components/forms/DocumentForm'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Mail, Phone, MapPin, Building, Plus, Search, LayoutGrid, List, FileText, Pencil } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useCustomer } from '@/hooks/useCustomers'
import { useProjects } from '@/hooks/useProjects'
import { useDocuments } from '@/hooks/useDocuments'
import { Document } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { CustomerStatement } from '@/components/customer/CustomerStatement'

export default function CustomerDetails() {
  const { id } = useParams()
  const [documentView, setDocumentView] = useState<'grid' | 'list'>('grid')
  const [documentSearch, setDocumentSearch] = useState('')
  const [documentFormOpen, setDocumentFormOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [statementOpen, setStatementOpen] = useState(false)
  const [customerFormOpen, setCustomerFormOpen] = useState(false)
  const { canCreateEstimate, canViewFinancials, canViewCustomers } = useAuth()

  const { data: customer, isLoading: customerLoading, error: customerError } = useCustomer(id)
  const { data: projects = [], isLoading: projectsLoading } = useProjects(id ? { customerId: id } : undefined)
  const { data: documents = [], isLoading: documentsLoading } = useDocuments(id ? { customerId: id } : undefined)

  // Transform customer data
  const customerData = useMemo(() => {
    if (!customer) return null

    const emails = typeof customer.emails === 'string'
      ? { work: customer.emails, personal: '' }
      : customer.emails || { work: '', personal: '' }

    const phones = typeof customer.phones === 'string'
      ? { work: customer.phones, personal: '' }
      : customer.phones || { work: '', personal: '' }

    const addresses = Array.isArray(customer.addresses)
      ? customer.addresses
      : []

    // Use backend-calculated aggregates
    const totalProjects = customer.projectsCount || projects.length
    const totalValue = customer.totalInvoicesValue || customer.totalEstimatesValue || 0
    const balanceDue = customer.totalOutstanding || 0

    return {
      ...customer,
      emails,
      phones,
      addresses,
      totalProjects,
      totalValue,
      balanceDue,
      status: 'ACTIVE' as const, // Default status
      company: '', // Not in schema, using empty
      leadSource: customer.leadSource || '',
      notes: customer.notes || '',
    }
  }, [customer, projects, documents])

  // Transform documents
  const transformedDocuments: Document[] = useMemo(() => {
    return documents.map((doc) => ({
      ...doc,
      projectId: doc.projectId || undefined,
    }))
  }, [documents])

  // Transform projects
  const transformedProjects = useMemo(() => {
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD',
      value: 0, // Will need to calculate from documents
    }))
  }, [projects])

  // Project names mapping
  const projectNames: Record<string, string> = useMemo(() => {
    return projects.reduce((acc, project) => {
      acc[project.id] = project.name
      return acc
    }, {} as Record<string, string>)
  }, [projects])

  const filteredDocuments = transformedDocuments.filter((doc) =>
    doc.number.toLowerCase().includes(documentSearch.toLowerCase()) ||
    doc.type.toLowerCase().includes(documentSearch.toLowerCase())
  )

  if (customerLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." description="Customer Details" />
        <div className="text-center py-12 text-gray-500">Loading customer data...</div>
      </div>
    )
  }

  if (customerError || !customerData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Error" description="Customer Details" />
        <div className="text-center py-12 text-red-500">
          {customerError?.message || 'Customer not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={customerData.name} 
        description="Customer details and information"
        action={
          <div className="flex gap-2">
            {canViewCustomers() && (
              <Button
                variant="outline"
                onClick={() => setCustomerFormOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
            )}
            {canViewCustomers() && (
              <Button
                variant="outline"
                onClick={() => setStatementOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Statement
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar
                  alt={customerData.name}
                  fallback={customerData.name.split(' ').map((n) => n[0]).join('')}
                  size="xl"
                  className="mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-900">{customerData.name}</h2>
                <StatusBadge status={customerData.status} className="mt-2" />
              </div>

              <div className="space-y-4">
                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Work Email</p>
                        <p className="text-sm text-gray-900">{customerData.emails.work || '-'}</p>
                        {customerData.emails.personal && (
                          <>
                            <p className="text-xs text-gray-500 mt-1">Personal Email</p>
                            <p className="text-sm text-gray-900">{customerData.emails.personal}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Work Phone</p>
                        <p className="text-sm text-gray-900">{customerData.phones.work || '-'}</p>
                        {customerData.phones.personal && (
                          <>
                            <p className="text-xs text-gray-500 mt-1">Personal Phone</p>
                            <p className="text-sm text-gray-900">{customerData.phones.personal}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {customerData.addresses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Addresses</h3>
                    <div className="space-y-2">
                      {customerData.addresses.map((addr, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-900">{addr.street}</p>
                            <p className="text-sm text-gray-900">
                              {addr.city}, {addr.state} {addr.zip}
                            </p>
                            <p className="text-sm text-gray-500">{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company */}
                {customerData.company && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-900">{customerData.company}</p>
                    </div>
                  </div>
                )}

                {/* Lead Source */}
                {customerData.leadSource && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Lead Source</h3>
                    <p className="text-sm text-gray-600">{customerData.leadSource}</p>
                  </div>
                )}

                {/* Notes */}
                {customerData.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{customerData.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Projects"
              value={customerData.totalProjects}
            />
            {canViewFinancials() && (
              <>
                <SummaryCard
                  title="Total Value"
                  value={`$${customerData.totalValue.toLocaleString()}`}
                />
                <SummaryCard
                  title="Balance Due"
                  value={`$${customerData.balanceDue.toLocaleString()}`}
                />
              </>
            )}
            {!canViewFinancials() && (
              <SummaryCard
                title="Total Value"
                value={`$${customerData.totalValue.toLocaleString()}`}
              />
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={documentSearch}
                      onChange={(e) => setDocumentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setDocumentView('grid')}
                      className={documentView === 'grid' 
                        ? 'px-3 py-1.5 bg-gray-100 text-gray-900 rounded-l-lg'
                        : 'px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-l-lg'
                      }
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDocumentView('list')}
                      className={documentView === 'list' 
                        ? 'px-3 py-1.5 bg-gray-100 text-gray-900 rounded-r-lg'
                        : 'px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-r-lg'
                      }
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                  {canCreateEstimate() && (
                    <Button
                      onClick={() => {
                        setSelectedDocument(null)
                        setDocumentFormOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Document
                    </Button>
                  )}
                </div>
              </div>

              {documentsLoading ? (
                <div className="text-center py-12 text-gray-500">Loading documents...</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No documents found</div>
              ) : documentView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc as any}
                      projectName={projectNames[doc.projectId || '']}
                      onClick={() => {
                        setSelectedDocument(doc)
                        setDocumentFormOpen(true)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <DocumentsTable
                  documents={filteredDocuments as any}
                  projectNames={projectNames}
                />
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              {projectsLoading ? (
                <div className="text-center py-12 text-gray-500">Loading projects...</div>
              ) : transformedProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No projects found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transformedProjects.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {project.name}
                          </h3>
                          <StatusBadge status={project.status} />
                        </div>
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Value:</span>
                            <span className="text-gray-900 font-semibold">
                              ${project.value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="photos">
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                No photos available
              </div>
            </TabsContent>

            <TabsContent value="files">
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                No files available
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DocumentForm
        open={documentFormOpen}
        onOpenChange={setDocumentFormOpen}
        document={selectedDocument}
        customerId={id || ''}
        projects={projects}
      />

      <CustomerStatement
        customerId={id}
        open={statementOpen}
        onOpenChange={setStatementOpen}
      />
      
      <CustomerForm
        open={customerFormOpen}
        onOpenChange={setCustomerFormOpen}
        customer={customer}
      />
    </div>
  )
}
