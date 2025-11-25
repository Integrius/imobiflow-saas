import { useQuery } from '@tanstack/react-query'
import { proprietariosService } from '@/lib/api/proprietarios'

export function useProprietarios(filters?: { page?: number; limit?: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proprietarios', filters],
    queryFn: () => proprietariosService.list(filters),
  })

  return {
    proprietarios: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
  }
}
