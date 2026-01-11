import { useQuery } from '@tanstack/react-query'
import { api, Task } from '@/lib/api'

export function useTasks(params?: { projectId?: string }) {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', params],
    queryFn: () => api.getTasks(params),
  })
}
