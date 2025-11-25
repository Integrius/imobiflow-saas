import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { imoveisService, CreateImovelData, FilterImoveis } from '@/lib/api/imoveis'
import { toast } from 'sonner'

export function useImoveis(filters?: FilterImoveis) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['imoveis', filters],
    queryFn: () => imoveisService.list(filters),
  })

  const createImovel = useMutation({
    mutationFn: (imovel: CreateImovelData) => imoveisService.create(imovel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] })
      toast.success('Imóvel cadastrado com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao cadastrar imóvel')
    },
  })

  const updateImovel = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateImovelData> }) =>
      imoveisService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] })
      toast.success('Imóvel atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao atualizar imóvel')
    },
  })

  const deleteImovel = useMutation({
    mutationFn: (id: string) => imoveisService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] })
      toast.success('Imóvel removido com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao remover imóvel')
    },
  })

  return {
    imoveis: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    isLoading,
    error,
    createImovel,
    updateImovel,
    deleteImovel,
  }
}

export function useImovel(id: string) {
  return useQuery({
    queryKey: ['imovel', id],
    queryFn: () => imoveisService.getById(id),
    enabled: !!id,
  })
}
