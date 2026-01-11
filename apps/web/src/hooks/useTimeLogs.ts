import { useQuery } from '@tanstack/react-query'
import { api, TimeLog } from '@/lib/api'

export function useTimeLogs(params?: { userId?: string }) {
  return useQuery<TimeLog[], Error>({
    queryKey: ['timelogs', params],
    queryFn: () => api.getTimeLogs(params),
  })
}
