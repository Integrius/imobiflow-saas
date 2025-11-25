import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi, Lead } from '@/lib/api/leads'
import { toast } from 'sonner'

export function useLeads() {
  const queryClient = useQueryClient()

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await leadsApi.getAll()
      return response.data
    },
  })

  const createLead = useMutation({
    mutationFn: (data: Partial<Lead>) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar lead')
    },
  })

  const updateLead = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead atualizado!')
    },
    onError: () => {
      toast.error('Erro ao atualizar lead')
    },
  })

  const deleteLead = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead excluído!')
    },
    onError: () => {
      toast.error('Erro ao excluir lead')
    },
  })

  return {
    leads: leads || [],
    isLoading,
    createLead,
    updateLead,
    deleteLead,
  }
}
