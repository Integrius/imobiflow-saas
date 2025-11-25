'use client'

import { useDroppable } from '@dnd-kit/core'
import { Negociacao, StatusNegociacao } from '@/lib/api/negociacoes'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  status: StatusNegociacao
  title: string
  color: string
  negociacoes: Negociacao[]
  onCardClick: (negociacao: Negociacao) => void
}

export function KanbanColumn({ status, title, color, negociacoes, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const totalValue = negociacoes.reduce((sum, n) => sum + (n.valor_proposta || n.imovel?.preco || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px]">
      <div className={`${color} rounded-t-lg p-3 border-b-2 border-gray-300`}>
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{negociacoes.length} negociações</span>
          {totalValue > 0 && (
            <span className="text-xs font-medium text-gray-700">{formatCurrency(totalValue)}</span>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 bg-gray-50 rounded-b-lg transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
        }`}
        style={{ minHeight: '500px' }}
      >
        {negociacoes.map((negociacao) => (
          <KanbanCard
            key={negociacao.id}
            negociacao={negociacao}
            onClick={() => onCardClick(negociacao)}
          />
        ))}
        {negociacoes.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            Nenhuma negociação
          </div>
        )}
      </div>
    </div>
  )
}
