import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  negociacoesService,
  CreateNegociacaoData,
  UpdateNegociacaoData,
  FilterNegociacoes,
  AddTimelineEventData,
  AddComissaoData
} from '@/lib/api/negociacoes'
import { toast } from 'sonner'

export function useNegociacoes(filters?: FilterNegociacoes) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['negociacoes', filters],
    queryFn: () => negociacoesService.list(filters),
  })

  const createNegociacao = useMutation({
    mutationFn: (negociacao: CreateNegociacaoData) => negociacoesService.create(negociacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] })
      queryClient.invalidateQueries({ queryKey: ['negociacoes-board'] })
      toast.success('Negociação criada com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao criar negociação')
    },
  })

  const updateNegociacao = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNegociacaoData }) =>
      negociacoesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] })
      queryClient.invalidateQueries({ queryKey: ['negociacoes-board'] })
      toast.success('Negociação atualizada com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao atualizar negociação')
    },
  })

  const deleteNegociacao = useMutation({
    mutationFn: (id: string) => negociacoesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] })
      queryClient.invalidateQueries({ queryKey: ['negociacoes-board'] })
      toast.success('Negociação removida com sucesso!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao remover negociação')
    },
  })

  const addTimelineEvent = useMutation({
    mutationFn: ({ id, event }: { id: string; event: AddTimelineEventData }) =>
      negociacoesService.addTimelineEvent(id, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] })
      queryClient.invalidateQueries({ queryKey: ['negociacao'] })
      toast.success('Evento adicionado à timeline!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao adicionar evento')
    },
  })

  const addComissao = useMutation({
    mutationFn: ({ id, comissao }: { id: string; comissao: AddComissaoData }) =>
      negociacoesService.addComissao(id, comissao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] })
      queryClient.invalidateQueries({ queryKey: ['negociacao'] })
      toast.success('Comissão adicionada!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao adicionar comissão')
    },
  })

  return {
    negociacoes: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    isLoading,
    error,
    createNegociacao,
    updateNegociacao,
    deleteNegociacao,
    addTimelineEvent,
    addComissao,
  }
}

export function useNegociacao(id: string) {
  return useQuery({
    queryKey: ['negociacao', id],
    queryFn: () => negociacoesService.getById(id),
    enabled: !!id,
  })
}

export function useNegociacoesBoard() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<Record<import('@/lib/api/negociacoes').StatusNegociacao, import('@/lib/api/negociacoes').Negociacao[]>>({
    queryKey: ['negociacoes-board'],
    queryFn: () => negociacoesService.getByStatus(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  const updateNegociacao = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNegociacaoData }) =>
      negociacoesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negociacoes-board'] })
      toast.success('Negociação atualizada!')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Erro ao atualizar negociação')
    },
  })

  return {
    board: data,
    isLoading,
    error,
    updateNegociacao,
  }
}
