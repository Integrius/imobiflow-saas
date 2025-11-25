'use client'

import { useState } from 'react'
import { useNegociacoesBoard, useNegociacao } from '@/hooks/use-negociacoes'
import { KanbanBoard } from '@/components/negociacoes/kanban-board'
import { NegociacaoDetails } from '@/components/negociacoes/negociacao-details'
import { NegociacaoForm } from '@/components/negociacoes/negociacao-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, RefreshCw } from 'lucide-react'
import { Negociacao, StatusNegociacao } from '@/lib/api/negociacoes'
import { useNegociacoes } from '@/hooks/use-negociacoes'

const EMPTY_BOARD: Record<StatusNegociacao, Negociacao[]> = {
  CONTATO: [],
  VISITA_AGENDADA: [],
  VISITA_REALIZADA: [],
  PROPOSTA: [],
  ANALISE_CREDITO: [],
  CONTRATO: [],
  FECHADO: [],
  PERDIDO: [],
  CANCELADO: [],
}

export default function NegociacoesPage() {
  const { board, isLoading, updateNegociacao } = useNegociacoesBoard()
  const { createNegociacao, addTimelineEvent } = useNegociacoes()
  const [selectedNegociacaoId, setSelectedNegociacaoId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const { data: selectedNegociacao } = useNegociacao(selectedNegociacaoId || '')

  const handleCardClick = (negociacao: Negociacao) => {
    setSelectedNegociacaoId(negociacao.id)
    setDetailsDialogOpen(true)
  }

  const handleStatusChange = async (id: string, newStatus: StatusNegociacao) => {
    await updateNegociacao.mutateAsync({ id, data: { status: newStatus } })
  }

  const handleCreateNegociacao = async (data: unknown) => {
    await createNegociacao.mutateAsync(data as Negociacao)
    setCreateDialogOpen(false)
  }

  const handleAddEvent = async (event: unknown) => {
    if (selectedNegociacaoId) {
      await addTimelineEvent.mutateAsync({
        id: selectedNegociacaoId,
        event: event as { tipo: 'CONTATO' | 'VISITA' | 'PROPOSTA' | 'NEGOCIACAO' | 'FECHAMENTO' | 'OBSERVACAO'; descricao: string },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg">Carregando negociações...</p>
        </div>
      </div>
    )
  }

  const totalNegociacoes = Object.values(board || EMPTY_BOARD).reduce((sum: number, neg) => sum + (Array.isArray(neg) ? neg.length : 0), 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Negociações</h1>
          <p className="text-gray-600 mt-1">{totalNegociacoes} negociações ativas</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Negociação
        </Button>
      </div>

      <KanbanBoard
        board={board || EMPTY_BOARD}
        onCardClick={handleCardClick}
        onStatusChange={handleStatusChange}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Negociação</DialogTitle>
          </DialogHeader>
          <NegociacaoForm
            onSubmit={handleCreateNegociacao}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedNegociacao && (
            <NegociacaoDetails
              negociacao={selectedNegociacao}
              onClose={() => setDetailsDialogOpen(false)}
              onStatusChange={(newStatus) => {
                if (selectedNegociacaoId) {
                  handleStatusChange(selectedNegociacaoId, newStatus)
                }
              }}
              onAddEvent={handleAddEvent}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
