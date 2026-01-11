import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCreateDocument, useUpdateDocument } from '@/hooks/useDocumentMutations'
import { Document, Project } from '@/lib/api'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface DocumentFormData {
  type: 'ESTIMATE' | 'INVOICE' | 'CHANGE_ORDER'
  customerId: string
  projectId?: string
  totalValue: number
  balanceDue: number
  status: 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'PAID' | 'OVERDUE'
  sentDate?: string
  dueDate?: string
}

interface DocumentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: Document | null
  customerId: string
  projects?: Project[]
}

export function DocumentForm({
  open,
  onOpenChange,
  document,
  customerId,
  projects = [],
}: DocumentFormProps) {
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const { user, canCreateInvoice } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormData>({
    defaultValues: {
      type: 'ESTIMATE',
      customerId,
      status: 'DRAFT',
      totalValue: 0,
      balanceDue: 0,
    },
  })

  useEffect(() => {
    if (document) {
      reset({
        type: document.type,
        customerId: document.customerId,
        projectId: document.projectId || undefined,
        totalValue: document.totalValue,
        balanceDue: document.balanceDue,
        status: document.status as any,
        sentDate: document.sentDate ? document.sentDate.split('T')[0] : undefined,
        dueDate: document.dueDate ? document.dueDate.split('T')[0] : undefined,
      })
    } else {
      reset({
        type: 'ESTIMATE',
        customerId,
        status: 'DRAFT',
        totalValue: 0,
        balanceDue: 0,
        projectId: undefined,
        sentDate: undefined,
        dueDate: undefined,
      })
    }
  }, [document, customerId, reset])

  const onSubmit = async (data: DocumentFormData) => {
    try {
      if (document) {
        await updateMutation.mutateAsync({
          id: document.id,
          data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Error saving document:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{document ? 'Edit Document' : 'New Document'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select 
              id="type" 
              {...register('type', { required: true })}
              disabled={!!document}
            >
              <option value="ESTIMATE">Estimate</option>
              {canCreateInvoice() && (
                <>
                  <option value="INVOICE">Invoice</option>
                  <option value="CHANGE_ORDER">Change Order</option>
                </>
              )}
            </Select>
            {!canCreateInvoice() && user?.role === 'SALES' && (
              <p className="text-xs text-gray-500 mt-1">
                Note: SALES role can only create estimates
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('status', { required: true })}>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </Select>
          </div>

          {projects.length > 0 && (
            <div>
              <Label htmlFor="projectId">Project (Optional)</Label>
              <Select id="projectId" {...register('projectId')}>
                <option value="">None</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="totalValue">Total Value</Label>
            <Input
              id="totalValue"
              type="number"
              step="0.01"
              {...register('totalValue', { required: true, valueAsNumber: true })}
            />
            {errors.totalValue && (
              <p className="text-sm text-red-500 mt-1">Total value is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="balanceDue">Balance Due</Label>
            <Input
              id="balanceDue"
              type="number"
              step="0.01"
              {...register('balanceDue', { 
                required: true, 
                valueAsNumber: true,
                validate: (value) => {
                  const totalValueEl = window.document.getElementById('totalValue') as HTMLInputElement
                  const totalValue = parseFloat(totalValueEl?.value || '0')
                  if (value > totalValue) {
                    return 'Balance due cannot exceed total value'
                  }
                  if (value < 0) {
                    return 'Balance due cannot be negative'
                  }
                  return true
                }
              })}
            />
            {errors.balanceDue && (
              <p className="text-sm text-red-500 mt-1">
                {errors.balanceDue.message || 'Balance due is required'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Note: Balance will be auto-calculated based on status (PAID = 0, PENDING/ACCEPTED = Total)
            </p>
          </div>

          <div>
            <Label htmlFor="sentDate">Sent Date (Optional)</Label>
            <Input
              id="sentDate"
              type="date"
              {...register('sentDate')}
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : document ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
