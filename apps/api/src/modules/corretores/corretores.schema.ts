import { z } from 'zod'

export const createCorretorSchema = z.object({
  user_id: z.string().uuid(),
  creci: z.string().min(5).max(20),
  telefone: z.string().regex(/^\d{10,11}$/),
  foto_url: z.string().url().optional().nullable(),
  especializacoes: z.array(z.string()).optional(),
  meta_mensal: z.number().positive().optional().nullable(),
  meta_anual: z.number().positive().optional().nullable(),
  comissao_padrao: z.number().min(0).max(100),
  disponibilidade: z.record(z.string(), z.any()).optional(),
})

export const updateCorretorSchema = z.object({
  creci: z.string().min(5).max(20).optional(),
  telefone: z.string().regex(/^\d{10,11}$/).optional(),
  foto_url: z.string().url().optional().nullable(),
  especializacoes: z.array(z.string()).optional(),
  meta_mensal: z.number().positive().optional().nullable(),
  meta_anual: z.number().positive().optional().nullable(),
  comissao_padrao: z.number().min(0).max(100).optional(),
  performance_score: z.number().min(0).max(100).optional(),
  disponibilidade: z.record(z.string(), z.any()).optional(),
})

export const listCorretoresSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  especializacao: z.string().optional(),
  search: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
})

export type CreateCorretorDTO = z.infer<typeof createCorretorSchema>
export type UpdateCorretorDTO = z.infer<typeof updateCorretorSchema>
export type ListCorretoresQuery = z.infer<typeof listCorretoresSchema>
