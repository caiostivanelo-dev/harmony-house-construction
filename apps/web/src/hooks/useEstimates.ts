import { useQuery } from '@tanstack/react-query'
import { api, Document } from '@/lib/api'

export function useEstimates(params?: { customerId?: string; projectId?: string }) {
  return useQuery<Document[], Error>({
    queryKey: ['estimates', params],
    queryFn: () => api.getDocuments({ ...params, type: 'ESTIMATE' }),
  })
}
