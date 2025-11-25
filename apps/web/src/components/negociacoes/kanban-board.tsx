'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Negociacao, StatusNegociacao } from '@/lib/api/negociacoes'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'

interface KanbanBoardProps {
  board: Record<StatusNegociacao, Negociacao[]>
  onCardClick: (negociacao: Negociacao) => void
  onStatusChange: (id: string, newStatus: StatusNegociacao) => void
}

const STATUS_CONFIG: Record<StatusNegociacao, { label: string; color: string }> = {
  CONTATO: { label: 'Contato Inicial', color: 'bg-gray-100' },
  VISITA_AGENDADA: { label: 'Visita Agendada', color: 'bg-blue-100' },
  VISITA_REALIZADA: { label: 'Visita Realizada', color: 'bg-cyan-100' },
  PROPOSTA: { label: 'Proposta', color: 'bg-yellow-100' },
  ANALISE_CREDITO: { label: 'Análise de Crédito', color: 'bg-orange-100' },
  CONTRATO: { label: 'Contrato', color: 'bg-purple-100' },
  FECHADO: { label: 'Fechado', color: 'bg-green-100' },
  PERDIDO: { label: 'Perdido', color: 'bg-red-100' },
  CANCELADO: { label: 'Cancelado', color: 'bg-gray-100' },
}

const COLUMN_ORDER: StatusNegociacao[] = [
  'CONTATO',
  'VISITA_AGENDADA',
  'VISITA_REALIZADA',
  'PROPOSTA',
  'ANALISE_CREDITO',
  'CONTRATO',
  'FECHADO',
  'PERDIDO',
  'CANCELADO',
]

export function KanbanBoard({ board, onCardClick, onStatusChange }: KanbanBoardProps) {
  const [activeNegociacao, setActiveNegociacao] = useState<Negociacao | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const negociacaoId = active.id as string

    // Encontra a negociação ativa em todas as colunas
    for (const status of COLUMN_ORDER) {
      const negociacao = board[status]?.find((n) => n.id === negociacaoId)
      if (negociacao) {
        setActiveNegociacao(negociacao)
        break
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveNegociacao(null)
      return
    }

    const negociacaoId = active.id as string
    const newStatus = over.id as StatusNegociacao

    // Verifica se o status mudou
    let currentStatus: StatusNegociacao | null = null
    for (const status of COLUMN_ORDER) {
      if (board[status]?.find((n) => n.id === negociacaoId)) {
        currentStatus = status
        break
      }
    }

    if (currentStatus && currentStatus !== newStatus) {
      onStatusChange(negociacaoId, newStatus)
    }

    setActiveNegociacao(null)
  }

  const handleDragCancel = () => {
    setActiveNegociacao(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            title={STATUS_CONFIG[status].label}
            color={STATUS_CONFIG[status].color}
            negociacoes={board[status] || []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeNegociacao ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard negociacao={activeNegociacao} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
