'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateNegociacaoData } from '@/lib/api/negociacoes'
import { useLeads } from '@/hooks/use-leads'
import { useImoveis } from '@/hooks/use-imoveis'
import { useState } from 'react'

const negociacaoFormSchema = z.object({
  lead_id: z.string().uuid('Selecione um lead'),
  imovel_id: z.string().uuid('Selecione um imóvel'),
  corretor_id: z.string().uuid('Selecione um corretor'),
  valor_proposta: z.number().min(0).optional(),
  observacoes: z.string().max(1000).optional(),
})

type NegociacaoFormData = z.infer<typeof negociacaoFormSchema>

interface NegociacaoFormProps {
  onSubmit: (data: CreateNegociacaoData) => Promise<void>
  onCancel: () => void
}

export function NegociacaoForm({ onSubmit, onCancel }: NegociacaoFormProps) {
  const { leads } = useLeads()
  const { imoveis } = useImoveis({ limit: 100, status: 'DISPONIVEL' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock de corretores - você pode criar um hook useCorretores depois
  const corretores = [
    { id: '1', nome: 'Corretor 1' },
    { id: '2', nome: 'Corretor 2' },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NegociacaoFormData>({
    resolver: zodResolver(negociacaoFormSchema),
  })

  const handleFormSubmit = async (data: NegociacaoFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lead_id">Lead *</Label>
          <Select
            value={watch('lead_id')}
            onValueChange={(value) => setValue('lead_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.nome} - {lead.telefone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.lead_id && <p className="text-sm text-red-600">{errors.lead_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imovel_id">Imóvel *</Label>
          <Select
            value={watch('imovel_id')}
            onValueChange={(value) => setValue('imovel_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o imóvel" />
            </SelectTrigger>
            <SelectContent>
              {imoveis.map((imovel) => (
                <SelectItem key={imovel.id} value={imovel.id}>
                  {imovel.codigo} - {imovel.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.imovel_id && <p className="text-sm text-red-600">{errors.imovel_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="corretor_id">Corretor *</Label>
          <Select
            value={watch('corretor_id')}
            onValueChange={(value) => setValue('corretor_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o corretor" />
            </SelectTrigger>
            <SelectContent>
              {corretores.map((corretor) => (
                <SelectItem key={corretor.id} value={corretor.id}>
                  {corretor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.corretor_id && <p className="text-sm text-red-600">{errors.corretor_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_proposta">Valor da Proposta</Label>
          <Input
            id="valor_proposta"
            type="number"
            step="0.01"
            placeholder="R$ 0,00"
            {...register('valor_proposta', { valueAsNumber: true })}
          />
          {errors.valor_proposta && <p className="text-sm text-red-600">{errors.valor_proposta.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <textarea
            id="observacoes"
            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
            placeholder="Adicione observações sobre a negociação..."
            {...register('observacoes')}
          />
          {errors.observacoes && <p className="text-sm text-red-600">{errors.observacoes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Negociação'}
        </Button>
      </div>
    </form>
  )
}
