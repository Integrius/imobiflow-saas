import { z } from 'zod'

// Enum de Status da Negociação
export const statusNegociacaoSchema = z.enum([
  'CONTATO',
  'VISITA_AGENDADA',
  'VISITA_REALIZADA',
  'PROPOSTA',
  'ANALISE_CREDITO',
  'CONTRATO',
  'FECHADO',
  'PERDIDO',
  'CANCELADO'
])

// Schema para criar Negociação
export const createNegociacaoSchema = z.object({
  lead_id: z.string().uuid('Lead ID inválido'),
  imovel_id: z.string().uuid('Imóvel ID inválido'),
  corretor_id: z.string().uuid('Corretor ID inválido'),
  valor_proposta: z.number().positive('Valor da proposta deve ser positivo').optional().nullable()
})

// Schema para atualizar Negociação
export const updateNegociacaoSchema = z.object({
  status: statusNegociacaoSchema.optional(),
  valor_proposta: z.number().positive('Valor da proposta deve ser positivo').optional().nullable()
})

// Schema para adicionar evento à timeline
export const addTimelineEventSchema = z.object({
  tipo: z.enum(['CONTATO', 'VISITA', 'PROPOSTA', 'NEGOCIACAO', 'FECHAMENTO', 'OBSERVACAO']),
  descricao: z.string().min(1).max(500),
  dados: z.record(z.string(), z.any()).optional()
})

// Schema para adicionar comissão
export const addComissaoSchema = z.object({
  corretor_id: z.string().uuid('Corretor ID inválido'),
  percentual: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
  valor: z.number().positive('Valor deve ser positivo').optional().nullable()
})

// Schema para query params
export const queryNegociacoesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: statusNegociacaoSchema.optional(),
  corretor_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  imovel_id: z.string().uuid().optional()
})

// Types exportados
export type CreateNegociacaoDTO = z.infer<typeof createNegociacaoSchema>
export type UpdateNegociacaoDTO = z.infer<typeof updateNegociacaoSchema>
export type AddTimelineEventDTO = z.infer<typeof addTimelineEventSchema>
export type AddComissaoDTO = z.infer<typeof addComissaoSchema>
export type QueryNegociacoesDTO = z.infer<typeof queryNegociacoesSchema>
export type StatusNegociacao = z.infer<typeof statusNegociacaoSchema>
