'use client'

import { useDraggable } from '@dnd-kit/core'
import { Negociacao } from '@/lib/api/negociacoes'
import { Card } from '@/components/ui/card'
import { User, Home, DollarSign, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface KanbanCardProps {
  negociacao: Negociacao
  onClick: () => void
}

export function KanbanCard({ negociacao, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: negociacao.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-white"
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{negociacao.codigo}</p>
          </div>
          {negociacao.valor_proposta && (
            <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
              {formatCurrency(negociacao.valor_proposta)}
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-gray-600">
          {negociacao.lead && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{negociacao.lead.nome}</span>
            </div>
          )}

          {negociacao.imovel && (
            <div className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{negociacao.imovel.titulo}</span>
            </div>
          )}

          {negociacao.imovel?.preco && !negociacao.valor_proposta && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatCurrency(negociacao.imovel.preco)}</span>
            </div>
          )}

          {negociacao.corretor && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate text-xs">{negociacao.corretor.nome}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1 border-t">
          <Calendar className="h-3 w-3" />
          <span>{getTimeAgo(negociacao.updated_at)}</span>
        </div>
      </div>
    </Card>
  )
}
