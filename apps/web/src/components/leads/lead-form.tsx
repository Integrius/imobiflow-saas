'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lead, CreateLeadDTO } from '@/services/leads.service'

const leadSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
  origem: z.string().min(1, 'Origem é obrigatória'),
  temperatura: z.enum(['QUENTE', 'MORNO', 'FRIO']).optional(),
  interesse: z.object({
    tipo: z.string().optional(),
    categoria: z.string().optional(),
    faixaPreco: z.string().optional(),
  }),
  observacoes: z.string().optional().or(z.literal('')),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  lead?: Lead
  onSubmit: (data: CreateLeadDTO) => void
  onCancel: () => void
}

export function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead ? {
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email || '',
      cpf: lead.cpf || '',
      origem: lead.origem,
      temperatura: lead.temperatura,
      interesse: lead.interesse as { tipo?: string; categoria?: string; faixaPreco?: string },
      observacoes: lead.observacoes || '',
    } : {
      interesse: {},
      temperatura: 'MORNO',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register('nome')} />
          {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
        </div>

        <div>
          <Label htmlFor="telefone">Telefone *</Label>
          <Input id="telefone" {...register('telefone')} placeholder="11999999999" />
          {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
          {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
        </div>

        <div>
          <Label htmlFor="origem">Origem *</Label>
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
              <SelectItem value="REDES_SOCIAIS">Redes Sociais</SelectItem>
              <SelectItem value="EVENTO">Evento</SelectItem>
            </SelectContent>
          </Select>
          {errors.origem && <p className="text-sm text-red-600">{errors.origem.message}</p>}
        </div>

        <div>
          <Label htmlFor="temperatura">Temperatura</Label>
          <Select onValueChange={(value) => setValue('temperatura', value as 'QUENTE' | 'MORNO' | 'FRIO')} defaultValue={lead?.temperatura || 'MORNO'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QUENTE">Quente</SelectItem>
              <SelectItem value="MORNO">Morno</SelectItem>
              <SelectItem value="FRIO">Frio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="interesse-tipo">Tipo de Imóvel de Interesse</Label>
          <Input id="interesse-tipo" {...register('interesse.tipo')} placeholder="Apartamento, Casa, etc." />
        </div>

        <div>
          <Label htmlFor="interesse-categoria">Categoria</Label>
          <Select onValueChange={(value) => setValue('interesse.categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VENDA">Venda</SelectItem>
              <SelectItem value="LOCACAO">Locação</SelectItem>
              <SelectItem value="TEMPORADA">Temporada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="interesse-faixaPreco">Faixa de Preço</Label>
          <Input id="interesse-faixaPreco" {...register('interesse.faixaPreco')} placeholder="Ex: R$ 300.000 - R$ 500.000" />
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" {...register('observacoes')} rows={3} />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
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
