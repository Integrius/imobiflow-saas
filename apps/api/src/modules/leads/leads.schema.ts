import { z } from 'zod'

// Enums
export const temperaturaSchema = z.enum(['QUENTE', 'MORNO', 'FRIO'])
export const origemSchema = z.enum(['SITE', 'PORTAL', 'INDICACAO', 'TELEFONE', 'WHATSAPP', 'REDES_SOCIAIS'])

// Schema para criar Lead
export const createLeadSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  email: z.string().email('Email inválido').optional().nullable(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional().nullable(),
  origem: origemSchema,
  interesse: z.object({
    tipo_imovel: z.array(z.string()).optional(),
    faixa_preco: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    localizacao: z.array(z.string()).optional(),
    observacoes: z.string().optional(),
  }).optional(),
  corretor_id: z.string().uuid().optional().nullable(),
})

// Schema para atualizar Lead
export const updateLeadSchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().regex(/^\d{10,11}$/).optional(),
  cpf: z.string().regex(/^\d{11}$/).optional().nullable(),
  origem: origemSchema.optional(),
  score: z.number().min(0).max(100).optional(),
  temperatura: temperaturaSchema.optional(),
  interesse: z.object({
    tipo_imovel: z.array(z.string()).optional(),
    faixa_preco: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    localizacao: z.array(z.string()).optional(),
    observacoes: z.string().optional(),
  }).optional(),
  corretor_id: z.string().uuid().optional().nullable(),
})

// Schema para filtros de listagem
export const listLeadsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  temperatura: temperaturaSchema.optional(),
  origem: origemSchema.optional(),
  corretor_id: z.string().uuid().optional(),
  search: z.string().optional(),
  score_min: z.coerce.number().min(0).max(100).optional(),
  score_max: z.coerce.number().min(0).max(100).optional(),
})

// Schema para adicionar evento na timeline
export const addTimelineEventSchema = z.object({
  tipo: z.enum(['CONTATO', 'EMAIL', 'WHATSAPP', 'LIGACAO', 'VISITA', 'PROPOSTA', 'OBSERVACAO']),
  descricao: z.string().min(1),
  detalhes: z.record(z.any()).optional(),
})

// Types exportados
export type CreateLeadDTO = z.infer<typeof createLeadSchema>
export type UpdateLeadDTO = z.infer<typeof updateLeadSchema>
export type ListLeadsQuery = z.infer<typeof listLeadsSchema>
export type TimelineEvent = z.infer<typeof addTimelineEventSchema>
