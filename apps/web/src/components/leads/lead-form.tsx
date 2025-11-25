'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lead } from '@/lib/api/leads'

const leadSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  origem: z.string().min(1, 'Origem é obrigatória'),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  lead?: Lead
  onSubmit: (data: LeadFormData) => void
  onCancel: () => void
}

export function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead ? {
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email || '',
      origem: lead.origem,
    } : undefined,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" {...register('nome')} />
        {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
      </div>

      <div>
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" {...register('telefone')} placeholder="11999999999" />
        {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email (opcional)</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="origem">Origem</Label>
        <Select onValueChange={(value) => setValue('origem', value)} defaultValue={lead?.origem}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SITE">Site</SelectItem>
            <SelectItem value="PORTAL">Portal</SelectItem>
            <SelectItem value="INDICACAO">Indicação</SelectItem>
            <SelectItem value="TELEFONE">Telefone</SelectItem>
            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        {errors.origem && <p className="text-sm text-red-600">{errors.origem.message}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {lead ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}
