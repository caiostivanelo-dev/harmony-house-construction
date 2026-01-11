import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  companyId: string
  createdAt: string
  updatedAt: string
}

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  })
}
