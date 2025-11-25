'use client'

import { useState } from 'react'
import { Negociacao, StatusNegociacao, AddTimelineEventData } from '@/lib/api/negociacoes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NegociacaoTimeline } from './negociacao-timeline'
import { User, Home, DollarSign, Calendar, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NegociacaoDetailsProps {
  negociacao: Negociacao
  onClose: () => void
  onStatusChange: (newStatus: StatusNegociacao) => void
  onAddEvent: (event: AddTimelineEventData) => void
}

const STATUS_OPTIONS: { value: StatusNegociacao; label: string }[] = [
  { value: 'CONTATO', label: 'Contato Inicial' },
  { value: 'VISITA_AGENDADA', label: 'Visita Agendada' },
  { value: 'VISITA_REALIZADA', label: 'Visita Realizada' },
  { value: 'PROPOSTA', label: 'Proposta' },
  { value: 'ANALISE_CREDITO', label: 'Análise de Crédito' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'FECHADO', label: 'Fechado' },
  { value: 'PERDIDO', label: 'Perdido' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export function NegociacaoDetails({ negociacao, onClose, onStatusChange, onAddEvent }: NegociacaoDetailsProps) {
  const [newEventText, setNewEventText] = useState('')
  const [isAddingEvent, setIsAddingEvent] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleAddEvent = async () => {
    if (!newEventText.trim()) return

    setIsAddingEvent(true)
    try {
      await onAddEvent({
        tipo: 'OBSERVACAO',
        descricao: newEventText,
      })
      setNewEventText('')
    } finally {
      setIsAddingEvent(false)
    }
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start sticky top-0 bg-white z-10 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">{negociacao.codigo}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Criado em {format(new Date(negociacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={negociacao.status}
              onValueChange={(value) => onStatusChange(value as StatusNegociacao)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {negociacao.valor_proposta && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Proposta:</span>
                <span className="font-semibold">{formatCurrency(negociacao.valor_proposta)}</span>
              </div>
            )}
            {negociacao.valor_aprovado && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Aprovado:</span>
                <span className="font-semibold text-green-600">{formatCurrency(negociacao.valor_aprovado)}</span>
              </div>
            )}
            {negociacao.imovel?.preco && !negociacao.valor_proposta && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Valor do Imóvel:</span>
                <span className="font-semibold">{formatCurrency(negociacao.imovel.preco)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {negociacao.lead && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{negociacao.lead.nome}</p>
              <p className="text-sm text-gray-600">{negociacao.lead.telefone}</p>
              {negociacao.lead.email && (
                <p className="text-sm text-gray-600">{negociacao.lead.email}</p>
              )}
            </CardContent>
          </Card>
        )}

        {negociacao.imovel && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Home className="h-4 w-4" />
                Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{negociacao.imovel.codigo}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{negociacao.imovel.titulo}</p>
            </CardContent>
          </Card>
        )}

        {negociacao.corretor && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Corretor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{negociacao.corretor.nome}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {negociacao.comissoes && negociacao.comissoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {negociacao.comissoes.map((comissao, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{comissao.corretor?.nome || 'Corretor'}</span>
                  <div className="text-right">
                    <span className="font-medium">{comissao.percentual}%</span>
                    {comissao.valor && (
                      <span className="text-sm text-gray-600 ml-2">{formatCurrency(comissao.valor)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar observação..."
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddEvent()
                  }
                }}
              />
              <Button onClick={handleAddEvent} disabled={isAddingEvent || !newEventText.trim()}>
                {isAddingEvent ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </div>

            <NegociacaoTimeline timeline={negociacao.timeline} />
          </div>
        </CardContent>
      </Card>

      {negociacao.data_fechamento && (
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <Calendar className="h-4 w-4" />
              Negócio Fechado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Fechado em {format(new Date(negociacao.data_fechamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      )}

      {negociacao.motivo_perda && (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm text-red-700">Motivo da Perda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{negociacao.motivo_perda}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
