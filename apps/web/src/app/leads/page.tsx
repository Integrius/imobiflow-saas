'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService, type Lead, type CreateLeadDTO } from '@/services/leads.service'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadForm } from '@/components/leads/lead-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function LeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>()
  const queryClient = useQueryClient()

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateLeadDTO) => leadsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead criado com sucesso!')
      setDialogOpen(false)
    },
    onError: () => {
      toast.error('Erro ao criar lead')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadDTO> }) =>
      leadsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead atualizado com sucesso!')
      setDialogOpen(false)
    },
    onError: () => {
      toast.error('Erro ao atualizar lead')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir lead')
    },
  })

  const handleCreate = () => {
    setSelectedLead(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: CreateLeadDTO) => {
    if (selectedLead) {
      updateMutation.mutate({ id: selectedLead.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Carregando leads...</p>
        </div>
      </div>
    )
  }

  const leads = leadsData?.data || []

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsTable 
            leads={leads} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLead ? 'Editar Lead' : 'Novo Lead'}
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={selectedLead}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
