import { useQuery } from '@tanstack/react-query'
import { api, Document } from '@/lib/api'

export function useDocuments(params?: { customerId?: string; projectId?: string; type?: string }) {
  return useQuery<Document[], Error>({
    queryKey: ['documents', params],
    queryFn: () => api.getDocuments(params),
  })
}
