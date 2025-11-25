'use client'

import { TimelineEvent } from '@/lib/api/negociacoes'
import { Card } from '@/components/ui/card'
import { Clock, MessageSquare, Phone, Home, FileText, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NegociacaoTimelineProps {
  timeline: TimelineEvent[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CONTATO: Phone,
  VISITA: Home,
  PROPOSTA: FileText,
  NEGOCIACAO: MessageSquare,
  FECHAMENTO: CheckCircle,
  OBSERVACAO: MessageSquare,
}

const COLOR_MAP: Record<string, string> = {
  CONTATO: 'bg-blue-100 text-blue-600',
  VISITA: 'bg-purple-100 text-purple-600',
  PROPOSTA: 'bg-yellow-100 text-yellow-600',
  NEGOCIACAO: 'bg-orange-100 text-orange-600',
  FECHAMENTO: 'bg-green-100 text-green-600',
  OBSERVACAO: 'bg-gray-100 text-gray-600',
}

export function NegociacaoTimeline({ timeline }: NegociacaoTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum evento registrado ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {timeline.map((event, index) => {
        const Icon = ICON_MAP[event.tipo] || Clock
        const colorClass = COLOR_MAP[event.tipo] || 'bg-gray-100 text-gray-600'

        return (
          <div key={index} className="flex gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
              <Icon className="h-5 w-5" />
            </div>
            <Card className="flex-1 p-3">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="font-medium text-sm">{event.descricao}</p>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {format(new Date(event.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              {event.usuario && (
                <p className="text-xs text-gray-600">Por: {event.usuario}</p>
              )}
              {event.dados && Object.keys(event.dados).length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {Object.entries(event.dados).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )
      })}
    </div>
  )
}
