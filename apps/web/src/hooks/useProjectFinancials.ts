import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useProjectFinancials(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'financials'],
    queryFn: () => api.getProjectFinancials(projectId),
    enabled: !!projectId,
  })
}
