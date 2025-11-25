'use client'

import { useState } from 'react'
import { useLeads } from '@/hooks/use-leads'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadForm } from '@/components/leads/lead-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Lead } from '@/lib/api/leads'

export default function LeadsPage() {
  const { leads, isLoading, createLead, updateLead, deleteLead } = useLeads()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>()

  const handleCreate = () => {
    setSelectedLead(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: unknown) => {
    if (selectedLead) {
      await updateLead.mutateAsync({ id: selectedLead.id, data: data as Partial<Lead> })
    } else {
      await createLead.mutateAsync(data as Lead)
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      await deleteLead.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="p-8">Carregando...</div>
  }

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
