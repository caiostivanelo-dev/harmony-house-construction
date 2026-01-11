import { useQuery } from '@tanstack/react-query'
import { api, Project } from '@/lib/api'

export function useProjects(params?: { customerId?: string }) {
  return useQuery<Project[], Error>({
    queryKey: ['projects', params],
    queryFn: () => api.getProjects(params),
  })
}
