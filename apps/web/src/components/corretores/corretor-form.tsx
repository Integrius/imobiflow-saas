'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Corretor, CreateCorretorData } from '@/lib/api/corretores'
import { useState } from 'react'

const corretorFormSchema = z.object({
  user_id: z.string().uuid('Selecione um usuário válido'),
  creci: z.string().min(5, 'CRECI deve ter pelo menos 5 caracteres').max(20, 'CRECI deve ter no máximo 20 caracteres'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
  foto_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  especializacoes: z.string().optional(),
  meta_mensal: z.number().positive('Meta mensal deve ser positiva').optional().nullable(),
  meta_anual: z.number().positive('Meta anual deve ser positiva').optional().nullable(),
  comissao_padrao: z.number().min(0, 'Comissão deve ser no mínimo 0%').max(100, 'Comissão deve ser no máximo 100%'),
})

type CorretorFormData = z.infer<typeof corretorFormSchema>

interface CorretorFormProps {
  corretor?: Corretor
  onSubmit: (data: CreateCorretorData) => Promise<void>
  onCancel: () => void
}

const ESPECIALIZACOES_OPTIONS = [
  'Apartamentos',
  'Casas',
  'Comercial',
  'Rural',
  'Alto Padrão',
  'Locação',
  'Temporada',
  'Investimentos',
]

export function CorretorForm({ corretor, onSubmit, onCancel }: CorretorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEspecializacoes, setSelectedEspecializacoes] = useState<string[]>(
    corretor?.especializacoes || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CorretorFormData>({
    resolver: zodResolver(corretorFormSchema),
    defaultValues: corretor
      ? {
          user_id: corretor.user_id,
          creci: corretor.creci,
          telefone: corretor.telefone,
          foto_url: corretor.foto_url || '',
          especializacoes: corretor.especializacoes?.join(', ') || '',
          meta_mensal: corretor.meta_mensal,
          meta_anual: corretor.meta_anual,
          comissao_padrao: corretor.comissao_padrao,
        }
      : {
          comissao_padrao: 3,
        },
  })

  const toggleEspecializacao = (espec: string) => {
    const newEspecializacoes = selectedEspecializacoes.includes(espec)
      ? selectedEspecializacoes.filter((e) => e !== espec)
      : [...selectedEspecializacoes, espec]

    setSelectedEspecializacoes(newEspecializacoes)
    setValue('especializacoes', newEspecializacoes.join(', '))
  }

  const handleFormSubmit = async (data: CorretorFormData) => {
    setIsSubmitting(true)
    try {
      const payload: CreateCorretorData = {
        user_id: data.user_id,
        creci: data.creci,
        telefone: data.telefone,
        foto_url: data.foto_url || undefined,
        especializacoes: selectedEspecializacoes,
        meta_mensal: data.meta_mensal || undefined,
        meta_anual: data.meta_anual || undefined,
        comissao_padrao: data.comissao_padrao,
      }
      await onSubmit(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Básicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Usuário *</Label>
            <Input
              id="user_id"
              placeholder="ID do usuário (UUID)"
              {...register('user_id')}
              disabled={!!corretor}
            />
            {errors.user_id && <p className="text-sm text-red-600">{errors.user_id.message}</p>}
            <p className="text-xs text-gray-500">
              Este campo vincula o corretor a um usuário do sistema
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creci">CRECI *</Label>
            <Input
              id="creci"
              placeholder="Ex: CRECI/SP 123456"
              {...register('creci')}
            />
            {errors.creci && <p className="text-sm text-red-600">{errors.creci.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              placeholder="11999999999"
              maxLength={11}
              {...register('telefone')}
            />
            {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            <p className="text-xs text-gray-500">Apenas números (10 ou 11 dígitos)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto_url">Foto (URL)</Label>
            <Input
              id="foto_url"
              placeholder="https://exemplo.com/foto.jpg"
              {...register('foto_url')}
            />
            {errors.foto_url && <p className="text-sm text-red-600">{errors.foto_url.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Especializações</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ESPECIALIZACOES_OPTIONS.map((espec) => (
            <button
              key={espec}
              type="button"
              onClick={() => toggleEspecializacao(espec)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                selectedEspecializacoes.includes(espec)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {espec}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Metas e Comissão</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="meta_mensal">Meta Mensal (R$)</Label>
            <Input
              id="meta_mensal"
              type="number"
              step="0.01"
              min="0"
              placeholder="R$ 0,00"
              {...register('meta_mensal', {
                valueAsNumber: true,
                setValueAs: (v) => v === '' || isNaN(v) ? null : Number(v)
              })}
            />
            {errors.meta_mensal && <p className="text-sm text-red-600">{errors.meta_mensal.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_anual">Meta Anual (R$)</Label>
            <Input
              id="meta_anual"
              type="number"
              step="0.01"
              min="0"
              placeholder="R$ 0,00"
              {...register('meta_anual', {
                valueAsNumber: true,
                setValueAs: (v) => v === '' || isNaN(v) ? null : Number(v)
              })}
            />
            {errors.meta_anual && <p className="text-sm text-red-600">{errors.meta_anual.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comissao_padrao">Comissão Padrão (%) *</Label>
            <Input
              id="comissao_padrao"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="3.0"
              {...register('comissao_padrao', { valueAsNumber: true })}
            />
            {errors.comissao_padrao && <p className="text-sm text-red-600">{errors.comissao_padrao.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : corretor ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  )
}
