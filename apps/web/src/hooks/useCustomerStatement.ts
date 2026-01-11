import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useCustomerStatement(customerId: string) {
  return useQuery({
    queryKey: ['customers', customerId, 'statement'],
    queryFn: () => api.getCustomerStatement(customerId),
    enabled: !!customerId,
  })
}
