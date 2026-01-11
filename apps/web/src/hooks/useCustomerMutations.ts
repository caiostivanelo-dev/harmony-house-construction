import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface CreateCustomerData {
  name: string
  emails: { work: string; personal?: string }
  phones: { work: string; personal?: string }
  addresses: Array<{
    street: string
    city: string
    state: string
    zip: string
    country: string
  }>
  leadSource?: string
  notes?: string
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCustomerData) => api.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerData> }) =>
      api.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
    },
  })
}
