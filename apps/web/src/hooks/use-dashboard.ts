import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/api/dashboard'

export function useDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  })

  return {
    stats: data,
    isLoading,
    error,
  }
}
