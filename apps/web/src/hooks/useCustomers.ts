import { useQuery } from '@tanstack/react-query'
import { api, Customer } from '@/lib/api'

export function useCustomers() {
  return useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery<Customer, Error>({
    queryKey: ['customers', id],
    queryFn: () => api.getCustomerById(id!),
    enabled: !!id,
  })
}
