import { z } from 'zod'

// Enum de Status do Pipeline (conforme Prisma)
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

export type StatusNegociacao = z.infer<typeof statusNegociacaoSchema>

export const createNegociacaoSchema = z.object({
  lead_id: z.string().uuid('ID do lead inválido'),
  imovel_id: z.string().uuid('ID do imóvel inválido'),
  corretor_id: z.string().uuid('ID do corretor inválido'),
  valor_proposta: z.number().positive('Valor deve ser positivo').optional().nullable(),
  observacoes: z.string().max(1000, 'Observações muito longas').optional().nullable(),
})

export type CreateNegociacaoDTO = z.infer<typeof createNegociacaoSchema>

export const updateNegociacaoSchema = z.object({
  status: statusNegociacaoSchema.optional(),
  valor_proposta: z.number().positive('Valor deve ser positivo').optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
  motivo_perda: z.string().max(500).optional().nullable(),
})

export type UpdateNegociacaoDTO = z.infer<typeof updateNegociacaoSchema>

export const changeStatusSchema = z.object({
  status: statusNegociacaoSchema,
  motivo_perda: z.string().min(10, 'Descreva o motivo da perda').optional(),
  valor_fechamento: z.number().positive().optional(),
})

export type ChangeStatusDTO = z.infer<typeof changeStatusSchema>

export const addComissaoSchema = z.object({
  corretor_id: z.string().uuid(),
  percentual: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
  valor: z.number().positive('Valor deve ser positivo'),
  tipo: z.enum(['CAPTACAO', 'VENDA', 'SPLIT']),
  observacoes: z.string().max(500).optional().nullable(),
})

export type AddComissaoDTO = z.infer<typeof addComissaoSchema>

export const addDocumentoSchema = z.object({
  tipo: z.enum(['PROPOSTA', 'CONTRATO', 'COMPROVANTE', 'OUTROS']),
  nome: z.string().min(1).max(255),
  url: z.string().url('URL inválida'),
  tamanho: z.number().positive().optional(),
  observacoes: z.string().max(500).optional().nullable(),
})

export type AddDocumentoDTO = z.infer<typeof addDocumentoSchema>

export const listNegociacoesSchema = z.object({
  status: statusNegociacaoSchema.optional(),
  corretor_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  imovel_id: z.string().uuid().optional(),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'valor_proposta']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type ListNegociacoesDTO = z.infer<typeof listNegociacoesSchema>

export const negociacaoResponseSchema = z.object({
  id: z.string().uuid(),
  lead_id: z.string().uuid(),
  imovel_id: z.string().uuid(),
  corretor_id: z.string().uuid(),
  status: statusNegociacaoSchema,
  valor_proposta: z.number().nullable(),
  observacoes: z.string().nullable(),
  motivo_perda: z.string().nullable(),
  comissoes: z.array(z.any()),
  documentos: z.array(z.any()),
  timeline: z.array(z.any()),
  created_at: z.date(),
  updated_at: z.date(),
  lead: z.object({
    id: z.string(),
    nome: z.string(),
    email: z.string().nullable(),
    telefone: z.string(),
  }).optional(),
  imovel: z.object({
    id: z.string(),
    codigo: z.string(),
    tipo: z.string(),
    endereco: z.any(),
  }).optional(),
  corretor: z.object({
    id: z.string(),
    creci: z.string(),
  }).optional(),
})

export type NegociacaoResponse = z.infer<typeof negociacaoResponseSchema>
