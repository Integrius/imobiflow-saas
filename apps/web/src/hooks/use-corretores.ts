import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  corretoresService,
  CreateCorretorData,
  UpdateCorretorData,
  FilterCorretores,
} from '@/lib/api/corretores'
import { toast } from 'sonner'

export function useCorretores(filters?: FilterCorretores) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['corretores', filters],
    queryFn: () => corretoresService.list(filters),
  })

  const createCorretor = useMutation({
    mutationFn: (corretor: CreateCorretorData) => corretoresService.create(corretor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corretores'] })
      toast.success('Corretor cadastrado com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao cadastrar corretor')
    },
  })

  const updateCorretor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCorretorData }) =>
      corretoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corretores'] })
      toast.success('Corretor atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao atualizar corretor')
    },
  })

  const deleteCorretor = useMutation({
    mutationFn: (id: string) => corretoresService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corretores'] })
      toast.success('Corretor removido com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao remover corretor')
    },
  })

  return {
    corretores: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    isLoading,
    error,
    createCorretor,
    updateCorretor,
    deleteCorretor,
  }
}

export function useCorretor(id: string) {
  return useQuery({
    queryKey: ['corretor', id],
    queryFn: () => corretoresService.getById(id),
    enabled: !!id,
  })
}

export function useCorretorStats(id: string) {
  return useQuery({
    queryKey: ['corretor-stats', id],
    queryFn: () => corretoresService.getStats(id),
    enabled: !!id,
  })
}
