import { useForm, useFieldArray } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateDocument, useUpdateDocument } from '@/hooks/useDocumentMutations'
import { Document, EstimateItem } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useCustomers } from '@/hooks/useCustomers'
import { useProjects } from '@/hooks/useProjects'
import { Plus, Trash2, Download } from 'lucide-react'
import { api } from '@/lib/api'

interface EstimateFormData {
  customerId: string
  projectId?: string
  projectName?: string // For creating new project
  estimateDate: string
  projectDates: string
  preparedBy: string
  validityDays: number
  notes?: string
  items: EstimateItem[]
}

interface EstimateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  estimate?: Document | null
}

export function EstimateForm({ open, onOpenChange, estimate }: EstimateFormProps) {
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const { data: customers = [] } = useCustomers()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const { data: projects = [], refetch: refetchProjects } = useProjects(
    selectedCustomerId ? { customerId: selectedCustomerId } : undefined
  )
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  const [useDetailedFormat, setUseDetailedFormat] = useState(false)
  const [projectInputValue, setProjectInputValue] = useState('')
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EstimateFormData>({
    defaultValues: {
      customerId: '',
      projectId: '',
      estimateDate: new Date().toISOString().split('T')[0],
      projectDates: 'TBT',
      preparedBy: '',
      validityDays: 30,
      notes: '',
      items: [{ category: '', description: '', cost: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const totalCost = watchedItems.reduce((sum, item) => {
    if (useDetailedFormat && (item.labor || item.materials)) {
      // Calculate from labor + materials
      const labor = item.labor || 0
      const materials = item.materials || 0
      return sum + labor + materials
    }
    // Use direct cost
    return sum + (item.cost || 0)
  }, 0)

  // Auto-calculate cost when labor or materials change in detailed format
  useEffect(() => {
    if (useDetailedFormat) {
      watchedItems.forEach((item, index) => {
        const labor = item.labor || 0
        const materials = item.materials || 0
        const calculatedCost = labor + materials
        if (calculatedCost > 0 && item.cost !== calculatedCost) {
          setValue(`items.${index}.cost`, calculatedCost)
        }
      })
    }
  }, [watchedItems, useDetailedFormat, setValue])

  useEffect(() => {
    if (estimate && open) {
      const items = estimate.items && Array.isArray(estimate.items) ? estimate.items : []
      if (items.length === 0) {
        items.push({ category: '', description: '', cost: 0 })
      }

      const projectId = estimate.projectId || ''
      const project = estimate.project
      const projectNameValue = project && typeof project === 'object' ? project.name : ''

      reset({
        customerId: estimate.customerId,
        projectId: projectId,
        projectName: '',
        estimateDate: estimate.estimateDate
          ? new Date(estimate.estimateDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        projectDates: estimate.projectDates || 'TBT',
        preparedBy: estimate.preparedBy || '',
        validityDays: estimate.validityDays || 30,
        notes: estimate.notes || '',
        items: items.map((item: any) => ({
          ...item,
          labor: item.labor || 0,
          materials: item.materials || 0,
        })),
      })
      setSelectedCustomerId(estimate.customerId)
      setProjectInputValue(projectNameValue)
      setIsCreatingNewProject(false)
    } else if (!estimate && open) {
      reset({
        customerId: '',
        projectId: '',
        projectName: '',
        estimateDate: new Date().toISOString().split('T')[0],
        projectDates: 'TBT',
        preparedBy: '',
        validityDays: 30,
        notes: '',
        items: [{ category: '', description: '', cost: 0 }],
      })
      setSelectedCustomerId('')
      setProjectInputValue('')
      setIsCreatingNewProject(false)
      setProjectInputValue('')
      setIsCreatingNewProject(false)
    }
  }, [estimate, open, reset])

  const onSubmit = async (data: EstimateFormData) => {
    try {
      // Calculate costs for items if using detailed format
      const processedItems = data.items
        .filter((item) => item.category.trim() !== '')
        .map((item) => {
          if (useDetailedFormat && (item.labor || item.materials)) {
            const labor = item.labor || 0
            const materials = item.materials || 0
            return {
              ...item,
              cost: labor + materials,
            }
          }
          return item
        })

      const payload = {
        type: 'ESTIMATE' as const,
        customerId: data.customerId,
        projectId: data.projectId || undefined,
        totalValue: totalCost,
        balanceDue: totalCost,
        status: 'DRAFT' as const,
        estimateDate: data.estimateDate,
        projectDates: data.projectDates,
        preparedBy: data.preparedBy,
        validityDays: data.validityDays,
        notes: data.notes || undefined,
        items: processedItems,
      }

      if (estimate) {
        await updateMutation.mutateAsync({ id: estimate.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      // Wait a bit to ensure backend processed the request
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving estimate:', error)
      alert('Erro ao salvar estimate: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    }
  }

  const handleDownloadPDF = async () => {
    if (!estimate?.id) return

    setIsDownloadingPDF(true)
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
      setIsDownloadingPDF(false)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle>{estimate ? 'Edit Estimate' : 'New Estimate'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerId">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Select
                id="customerId"
                {...register('customerId', { required: 'Customer is required' })}
                value={watch('customerId')}
                onChange={(e) => {
                  setValue('customerId', e.target.value)
                  setSelectedCustomerId(e.target.value)
                  setValue('projectId', '')
                  setProjectInputValue('')
                  setIsCreatingNewProject(false)
                }}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="projectInput">Project</Label>
              <div className="relative">
                <Input
                  id="projectInput"
                  list="projects-list"
                  value={projectInputValue}
                  onChange={(e) => {
                    const value = e.target.value
                    setProjectInputValue(value)
                    
                    // Check if it's an existing project
                    const existingProject = projects.find(p => p.name === value)
                    if (existingProject) {
                      setValue('projectId', existingProject.id)
                      setIsCreatingNewProject(false)
                    } else if (value.trim() && selectedCustomerId) {
                      // New project name
                      setIsCreatingNewProject(true)
                      setValue('projectId', '')
                      setValue('projectName', value.trim())
                    } else {
                      setIsCreatingNewProject(false)
                      setValue('projectId', '')
                      setValue('projectName', '')
                    }
                  }}
                  onBlur={async () => {
                    // If creating new project and has name and customer
                    if (isCreatingNewProject && projectInputValue.trim() && selectedCustomerId) {
                      setIsCreatingProject(true)
                      try {
                        const newProject = await api.createProject({
                          name: projectInputValue.trim(),
                          customerId: selectedCustomerId,
                        })
                        setValue('projectId', newProject.id)
                        setProjectInputValue(newProject.name)
                        setIsCreatingNewProject(false)
                        await refetchProjects()
                      } catch (error) {
                        console.error('Error creating project:', error)
                        alert('Failed to create project')
                      } finally {
                        setIsCreatingProject(false)
                      }
                    }
                  }}
                  disabled={!selectedCustomerId}
                  placeholder="Select or type to create new project"
                  className="pr-8"
                />
                {isCreatingProject && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
                <datalist id="projects-list">
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.name} />
                  ))}
                </datalist>
              </div>
              {isCreatingNewProject && projectInputValue.trim() && (
                <p className="text-xs text-blue-600 mt-1">
                  Press Tab or click outside to create project "{projectInputValue}"
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimateDate">
                Date of Estimate <span className="text-red-500">*</span>
              </Label>
              <Input
                id="estimateDate"
                type="date"
                {...register('estimateDate', { required: 'Date is required' })}
              />
              {errors.estimateDate && (
                <p className="text-sm text-red-500 mt-1">{errors.estimateDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="projectDates">Dates of Project</Label>
              <Input id="projectDates" {...register('projectDates')} placeholder="TBT" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preparedBy">Prepared By</Label>
              <Input id="preparedBy" {...register('preparedBy')} />
            </div>

            <div>
              <Label htmlFor="validityDays">Validity (days)</Label>
              <Input
                id="validityDays"
                type="number"
                {...register('validityDays', { valueAsNumber: true, min: 1 })}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>
                Items <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useDetailedFormat}
                    onChange={(e) => setUseDetailedFormat(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Detailed (Labor + Materials)</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (useDetailedFormat) {
                      append({ category: '', description: '', labor: 0, materials: 0, cost: 0 })
                    } else {
                      append({ category: '', description: '', cost: 0 })
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="space-y-3 border rounded-lg p-4">
              {useDetailedFormat ? (
                // Detailed format with Labor and Materials
                <>
                  <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-600 pb-2 border-b">
                    <div className="col-span-3">SCOOP OF WORK</div>
                    <div className="col-span-3">NOTES</div>
                    <div className="col-span-2">LABOR</div>
                    <div className="col-span-2">MATERIALS</div>
                    <div className="col-span-1">TOTAL COST</div>
                    <div className="col-span-1"></div>
                  </div>
                  {fields.map((field, index) => {
                    const labor = watch(`items.${index}.labor`) || 0
                    const materials = watch(`items.${index}.materials`) || 0
                    const calculatedCost = labor + materials
                    
                    return (
                      <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-3">
                          <Input
                            placeholder="Category"
                            {...register(`items.${index}.category` as const, {
                              required: 'Category is required',
                            })}
                          />
                          {errors.items?.[index]?.category && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.items[index]?.category?.message}
                            </p>
                          )}
                        </div>
                        <div className="col-span-3">
                          <Textarea
                            placeholder="Notes"
                            rows={2}
                            {...register(`items.${index}.description` as const)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register(`items.${index}.labor` as const, {
                              valueAsNumber: true,
                              min: 0,
                            })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register(`items.${index}.materials` as const, {
                              valueAsNumber: true,
                              min: 0,
                            })}
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={calculatedCost.toFixed(2)}
                            readOnly
                            className="bg-gray-50"
                          />
                          <input
                            type="hidden"
                            {...register(`items.${index}.cost` as const, {
                              valueAsNumber: true,
                            })}
                            value={calculatedCost}
                          />
                        </div>
                        <div className="col-span-1">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                // Simple format (Category, Notes, Total Cost)
                <>
                  <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-600 pb-2 border-b">
                    <div className="col-span-4">SCOOP OF WORK PER PLAN</div>
                    <div className="col-span-6">NOTES</div>
                    <div className="col-span-1">TOTAL COST</div>
                    <div className="col-span-1"></div>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <Input
                          placeholder="Category (e.g., Demolition Per Plans)"
                          {...register(`items.${index}.category` as const, {
                            required: 'Category is required',
                          })}
                        />
                        {errors.items?.[index]?.category && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.items[index]?.category?.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-6">
                        <Textarea
                          placeholder="Description/Notes"
                          rows={2}
                          {...register(`items.${index}.description` as const, {
                            required: 'Description is required',
                          })}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...register(`items.${index}.cost` as const, {
                            required: 'Cost is required',
                            valueAsNumber: true,
                            min: 0,
                          })}
                        />
                        {errors.items?.[index]?.cost && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.items[index]?.cost?.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              {...register('notes')}
              placeholder="Additional notes or terms..."
            />
          </div>

          <DialogFooter>
            {estimate && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloadingPDF ? 'Downloading...' : 'Download PDF'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : estimate ? 'Update Estimate' : 'Create Estimate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
