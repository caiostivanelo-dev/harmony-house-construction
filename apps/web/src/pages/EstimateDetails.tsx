import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, Document, EstimateSection, EstimateLineItem } from '@/lib/api'
import { useUpdateDocument } from '@/hooks/useDocumentMutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  GripVertical,
  User,
  Box,
  DollarSign,
  Download,
  Save,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

export default function EstimateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateMutation = useUpdateDocument()
  
  const [localSections, setLocalSections] = useState<EstimateSection[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [addingItem, setAddingItem] = useState<{ sectionName: string; type: 'LABOR' | 'MATERIAL' | 'OTHER_COST' } | null>(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)
  const [taxRate, setTaxRate] = useState(0)
  const [introduction, setIntroduction] = useState('')

  const { data: estimate, isLoading } = useQuery<Document>({
    queryKey: ['estimate', id],
    queryFn: async () => {
      const docs = await api.getDocuments({ type: 'ESTIMATE' })
      const found = docs.find(d => d.id === id)
      if (!found) throw new Error('Estimate not found')
      return found
    },
    enabled: !!id,
  })

  const { data: financials, refetch: refetchFinancials } = useQuery({
    queryKey: ['estimate-financials', id],
    queryFn: () => api.getEstimateFinancials(id!),
    enabled: !!id && !!estimate && localSections.length > 0,
  })

  // Initialize local state from estimate
  useEffect(() => {
    if (estimate) {
      // Check if estimate has sections (new format) or items (legacy format)
      let sections: EstimateSection[] = []
      
      if (estimate.sections && estimate.sections.length > 0) {
        // New format with sections
        sections = estimate.sections
      } else if (estimate.items && Array.isArray(estimate.items) && estimate.items.length > 0) {
        // Legacy format - convert items to a default section
        sections = [{
          name: 'Work Items',
          items: estimate.items.map((item: any) => ({
            type: 'OTHER_COST' as const,
            name: item.category || item.description || 'Unnamed Item',
            companyCost: item.cost || item.labor || item.materials || 0,
            customerPrice: item.cost || (item.labor || 0) + (item.materials || 0) || 0,
            tax: 0,
            visible: 1,
            hours: item.type === 'LABOR' ? item.hours : undefined,
            quantity: item.type === 'MATERIAL' ? item.quantity : undefined,
          }))
        }]
      }
      
      // Ensure all items have required fields
      sections = sections.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          companyCost: item.companyCost || 0,
          customerPrice: item.customerPrice || 0,
          visible: item.visible !== undefined ? item.visible : 1,
        }))
      }))
      
      setLocalSections(sections)
      if (sections.length > 0) {
        setExpandedSections(new Set(sections.map(s => s.name)))
      }
      setTaxRate(estimate.taxRate || 0)
      setIntroduction(estimate.introduction || '')
    }
  }, [estimate])

  const handleSave = async () => {
    if (!id) return

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          sections: localSections,
          taxRate,
          introduction: introduction || undefined,
        },
      })
      
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
      queryClient.invalidateQueries({ queryKey: ['estimate-financials', id] })
      refetchFinancials()
      alert('Estimate saved successfully!')
    } catch (error) {
      console.error('Error saving estimate:', error)
      alert('Error saving estimate')
    }
  }

  const addSection = () => {
    if (!newSectionName.trim()) return
    setLocalSections([...localSections, { name: newSectionName.trim(), items: [] }])
    setNewSectionName('')
    setShowAddSection(false)
    setExpandedSections(new Set([...expandedSections, newSectionName.trim()]))
  }

  const addItem = (sectionName: string, item: EstimateLineItem) => {
    const sectionIndex = localSections.findIndex(s => s.name === sectionName)
    if (sectionIndex === -1) return

    const newSections = [...localSections]
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: [...newSections[sectionIndex].items, item],
    }
    setLocalSections(newSections)
    setAddingItem(null)
  }

  const updateItem = (sectionIndex: number, itemIndex: number, updates: Partial<EstimateLineItem>) => {
    const newSections = [...localSections]
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: newSections[sectionIndex].items.map((item, idx) => 
        idx === itemIndex ? { ...item, ...updates } : item
      ),
    }
    setLocalSections(newSections)
  }

  const deleteItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...localSections]
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: newSections[sectionIndex].items.filter((_, idx) => idx !== itemIndex),
    }
    setLocalSections(newSections)
  }

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  const getSectionTotal = (section: EstimateSection) => {
    return section.items
      .filter(item => item.visible !== 0)
      .reduce((sum, item) => sum + (item.customerPrice || 0), 0)
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'LABOR':
        return <User className="h-4 w-4" />
      case 'MATERIAL':
        return <Box className="h-4 w-4" />
      case 'OTHER_COST':
        return <DollarSign className="h-4 w-4" />
      default:
        return null
    }
  }

  const getItemTypeCount = (section: EstimateSection, type: string) => {
    return section.items.filter(item => item.type === type).length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading estimate...</div>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Estimate not found</p>
          <Button onClick={() => navigate('/estimates')}>Back to Estimates</Button>
        </div>
      </div>
    )
  }

  const customerName = typeof estimate.customer === 'object' 
    ? estimate.customer?.name || 'Unknown' 
    : 'Unknown'
  const projectName = estimate.project 
    ? (typeof estimate.project === 'object' ? estimate.project?.name : '') 
    : null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Estimate Details */}
      <div className="w-1/2 overflow-y-auto bg-white border-r border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/estimates')} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Estimate for {customerName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={async () => {
                const blob = await api.downloadEstimatePDF(estimate.id)
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `estimate-${estimate.number}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
              }}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Estimate Number */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estimates {estimate.number}</h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={estimate.status as any} />
            </div>
          </div>

          {/* Client/Project */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{customerName}</p>
                {projectName && <p className="text-sm text-gray-500">{projectName}</p>}
              </div>
            </div>
          </div>

          {/* Introduction */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Introduction</Label>
            <Textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Hello [Client Name], Thank you for inviting us to provide you an estimate for your project."
              rows={4}
            />
          </div>

          {/* Estimate Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ESTIMATE NUMBER:</span>
              <span className="font-medium text-gray-900">{estimate.number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ESTIMATE STATUS:</span>
              <StatusBadge status={estimate.status as any} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ESTIMATE DATE:</span>
              <span className="font-medium text-gray-900">
                {estimate.estimateDate ? format(new Date(estimate.estimateDate), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
            {estimate.validityDays && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ESTIMATE EXPIRES:</span>
                <span className="font-medium text-gray-900">
                  {estimate.estimateDate 
                    ? format(new Date(new Date(estimate.estimateDate).getTime() + estimate.validityDays * 24 * 60 * 60 * 1000), 'MMM d, yyyy')
                    : 'N/A'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <Label className="text-gray-600">TAX RATE (%):</Label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-24 h-8"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Description & Pricing Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Description & Pricing</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddSection(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
            
            {localSections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.name)
              const sectionTotal = getSectionTotal(section)
              const laborCount = getItemTypeCount(section, 'LABOR')
              const materialCount = getItemTypeCount(section, 'MATERIAL')
              const otherCount = getItemTypeCount(section, 'OTHER_COST')

              return (
                <Card key={section.name} className="border border-gray-200">
                  <CardContent className="p-0">
                    {/* Section Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection(section.name)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <Input
                          value={section.name}
                          onChange={(e) => {
                            const newSections = [...localSections]
                            newSections[sectionIndex] = { ...newSections[sectionIndex], name: e.target.value }
                            setLocalSections(newSections)
                          }}
                          className="font-medium border-none p-0 h-auto w-auto"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm text-gray-600">
                          ${sectionTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {laborCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="h-3 w-3" />
                            <span>{laborCount}</span>
                          </div>
                        )}
                        {materialCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Box className="h-3 w-3" />
                            <span>{materialCount}</span>
                          </div>
                        )}
                        {otherCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            <span>{otherCount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <Card key={itemIndex} className="border border-gray-200">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getItemTypeIcon(item.type)}
                                  <Input
                                    value={item.name}
                                    onChange={(e) => updateItem(sectionIndex, itemIndex, { name: e.target.value })}
                                    className="font-medium border-none p-0 h-auto"
                                  />
                                </div>
                                <button
                                  onClick={() => deleteItem(sectionIndex, itemIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  {item.type === 'LABOR' && (
                                    <div>
                                      <Label className="text-xs text-gray-600">Hours</Label>
                                      <Input
                                        type="number"
                                        value={item.hours || ''}
                                        onChange={(e) => updateItem(sectionIndex, itemIndex, { hours: parseFloat(e.target.value) || 0 })}
                                        step="0.5"
                                      />
                                    </div>
                                  )}
                                  {item.type === 'MATERIAL' && (
                                    <div>
                                      <Label className="text-xs text-gray-600">Quantity</Label>
                                      <Input
                                        type="number"
                                        value={item.quantity || ''}
                                        onChange={(e) => updateItem(sectionIndex, itemIndex, { quantity: parseFloat(e.target.value) || 0 })}
                                        step="1"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-xs text-gray-600">Tax (%)</Label>
                                    <Input
                                      type="number"
                                      value={item.tax || taxRate || ''}
                                      onChange={(e) => updateItem(sectionIndex, itemIndex, { tax: parseFloat(e.target.value) || taxRate })}
                                      step="0.1"
                                      placeholder={taxRate.toString()}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-600">Visible to Customer</Label>
                                    <Select
                                      value={item.visible === 0 ? '0' : '1'}
                                      onChange={(e) => updateItem(sectionIndex, itemIndex, { visible: parseInt(e.target.value) })}
                                    >
                                      <option value="1">Yes</option>
                                      <option value="0">No</option>
                                    </Select>
                                  </div>
                                </div>

                                {/* Cost and Price Section - Highlighted */}
                                <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-900">Pricing & Profit</h4>
                                    {item.companyCost > 0 && item.customerPrice > 0 && (
                                      <div className="flex items-center gap-3 text-xs">
                                        <span className="text-green-600 font-medium">
                                          Markup: {(((item.customerPrice - item.companyCost) / item.companyCost) * 100).toFixed(0)}%
                                        </span>
                                        <span className="text-blue-600 font-medium">
                                          Margin: {((item.customerPrice - item.companyCost) / item.customerPrice * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs font-semibold text-gray-700">Company Cost (Hidden from PDF)</Label>
                                      <Input
                                        type="number"
                                        value={item.companyCost || ''}
                                        onChange={(e) => {
                                          const cost = parseFloat(e.target.value) || 0
                                          updateItem(sectionIndex, itemIndex, { companyCost: cost })
                                        }}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="bg-white"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">Your internal cost</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-semibold text-gray-700">Customer Price (Visible in PDF)</Label>
                                      <Input
                                        type="number"
                                        value={item.customerPrice || ''}
                                        onChange={(e) => {
                                          const price = parseFloat(e.target.value) || 0
                                          updateItem(sectionIndex, itemIndex, { customerPrice: price })
                                        }}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="bg-white"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">Price shown to client</p>
                                    </div>
                                  </div>
                                  {item.companyCost > 0 && item.customerPrice > 0 && (
                                    <div className="bg-white rounded p-2 border border-blue-200">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Profit:</span>
                                        <span className="font-semibold text-green-600">
                                          ${(item.customerPrice - item.companyCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Add Item Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setAddingItem({ sectionName: section.name, type: 'LABOR' })
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Add Items & Financial Summary */}
      <div className="w-1/2 overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Add to Estimate Section */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">ADD TO ESTIMATE SECTION</Label>
            {localSections.length === 0 ? (
              <p className="text-sm text-gray-500">Create a section first to add items</p>
            ) : (
              <div className="space-y-4">
                {localSections.map((section) => (
                  <div key={section.name} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">{section.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          setAddingItem({ sectionName: section.name, type: 'LABOR' })
                        }}
                      >
                        <User className="h-5 w-5" />
                        <span className="text-xs">LABOR</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          setAddingItem({ sectionName: section.name, type: 'MATERIAL' })
                        }}
                      >
                        <Box className="h-5 w-5" />
                        <span className="text-xs">MATERIAL</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          setAddingItem({ sectionName: section.name, type: 'OTHER_COST' })
                        }}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="text-xs">OTHER</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Summary */}
          {financials && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Company Costs Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COMPANY LABOR COSTS:</span>
                  <span className="font-medium text-gray-900">
                    ${financials.companyCosts.labor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COMPANY MATERIAL COSTS:</span>
                  <span className="font-medium text-gray-900">
                    ${financials.companyCosts.material.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">OTHER COMPANY COSTS:</span>
                  <span className="font-medium text-gray-900">
                    ${financials.companyCosts.other.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">TOTAL COMPANY COSTS:</span>
                  <span className="text-gray-900">
                    ${financials.companyCosts.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Profit Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Estimated Gross Profit:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${financials.profit.gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MARKUP:</span>
                      <span className="font-medium text-gray-900">{financials.profit.markup.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MARGIN:</span>
                      <span className="font-medium text-gray-900">{financials.profit.margin.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxable subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ${financials.customerCosts.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax {financials.taxRate}%:</span>
                  <span className="font-medium text-gray-900">
                    ${financials.customerCosts.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Estimated Total:</span>
                  <span className="text-blue-600">
                    ${financials.customerCosts.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Section Dialog */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Name</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g., Demolition & Disposal"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSection()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSection(false)}>Cancel</Button>
            <Button onClick={addSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      {addingItem && (
        <AddItemDialog
          open={!!addingItem}
          onOpenChange={() => setAddingItem(null)}
          onAdd={(item) => addItem(addingItem.sectionName, item)}
          type={addingItem.type}
          taxRate={taxRate}
        />
      )}
    </div>
  )
}

function AddItemDialog({
  open,
  onOpenChange,
  onAdd,
  type,
  taxRate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (item: EstimateLineItem) => void
  type: 'LABOR' | 'MATERIAL' | 'OTHER_COST'
  taxRate: number
}) {
  const [name, setName] = useState('')
  const [hours, setHours] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [companyCost, setCompanyCost] = useState<number | ''>('')
  const [customerPrice, setCustomerPrice] = useState<number | ''>('')
  const [tax, setTax] = useState<number | ''>(taxRate)
  const [visible, setVisible] = useState(1)

  const handleSubmit = () => {
    if (!name.trim() || companyCost === '' || customerPrice === '') {
      alert('Please fill in all required fields')
      return
    }

    onAdd({
      type,
      name: name.trim(),
      hours: type === 'LABOR' ? (hours || 0) : undefined,
      quantity: type === 'MATERIAL' ? (quantity || 0) : undefined,
      companyCost: companyCost || 0,
      customerPrice: customerPrice || 0,
      tax: tax || taxRate,
      visible,
    })

    // Reset form
    setName('')
    setHours('')
    setQuantity('')
    setCompanyCost('')
    setCustomerPrice('')
    setTax(taxRate)
    setVisible(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {type === 'LABOR' ? 'Labor' : type === 'MATERIAL' ? 'Material' : 'Other Cost'} Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Item Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Master Bathroom Demo"
            />
          </div>
          {type === 'LABOR' && (
            <div>
              <Label>Hours</Label>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value ? parseFloat(e.target.value) : '')}
                step="0.5"
                placeholder="20.00"
              />
            </div>
          )}
          {type === 'MATERIAL' && (
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? parseFloat(e.target.value) : '')}
                step="1"
                placeholder="1"
              />
            </div>
          )}
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Pricing & Profit</h4>
              {companyCost !== '' && customerPrice !== '' && Number(companyCost) > 0 && Number(customerPrice) > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600 font-medium">
                    Markup: {(((Number(customerPrice) - Number(companyCost)) / Number(companyCost)) * 100).toFixed(0)}%
                  </span>
                  <span className="text-blue-600 font-medium">
                    Margin: {((Number(customerPrice) - Number(companyCost)) / Number(customerPrice) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-gray-700">Company Cost (Hidden from PDF) *</Label>
                <Input
                  type="number"
                  value={companyCost}
                  onChange={(e) => setCompanyCost(e.target.value ? parseFloat(e.target.value) : '')}
                  step="0.01"
                  placeholder="0.00"
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Your internal cost</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-700">Customer Price (Visible in PDF) *</Label>
                <Input
                  type="number"
                  value={customerPrice}
                  onChange={(e) => setCustomerPrice(e.target.value ? parseFloat(e.target.value) : '')}
                  step="0.01"
                  placeholder="0.00"
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Price shown to client</p>
              </div>
            </div>
            {companyCost !== '' && customerPrice !== '' && Number(companyCost) > 0 && Number(customerPrice) > 0 && (
              <div className="bg-white rounded p-2 border border-blue-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Profit:</span>
                  <span className="font-semibold text-green-600">
                    ${(Number(customerPrice) - Number(companyCost)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div>
            <Label>Tax (%)</Label>
            <Input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value ? parseFloat(e.target.value) : taxRate)}
              step="0.1"
              placeholder={taxRate.toString()}
            />
          </div>
          <div>
            <Label>Visible to Customer</Label>
            <Select
              value={visible.toString()}
              onChange={(e) => setVisible(parseInt(e.target.value))}
            >
              <option value="1">Yes</option>
              <option value="0">No</option>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
