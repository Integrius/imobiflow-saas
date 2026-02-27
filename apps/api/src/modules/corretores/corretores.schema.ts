import { z } from 'zod'

export const createCorretorSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(10),
  creci: z.string().min(5).max(20),
  especializacoes: z.array(z.string()).optional(),
  comissao: z.number().min(0).max(100).optional(),
  tipo: z.enum(['ADMIN', 'GESTOR', 'CORRETOR']).optional().default('CORRETOR'),
})

export const updateCorretorSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  telefone: z.string().min(10).optional(),
  creci: z.string().min(5).max(20).optional(),
  especializacoes: z.array(z.string()).optional(),
  comissao: z.number().min(0).max(100).optional(),
  tipo: z.enum(['ADMIN', 'GESTOR', 'CORRETOR']).optional(),
})

export const listCorretoresSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
})

export const bulkUpdateStatusSchema = z.object({
  corretor_ids: z.array(z.string().uuid()),
  status: z.enum(['ATIVO', 'SUSPENSO', 'CANCELADO']),
  ativo: z.boolean(),
})

export const bulkResendCredentialsSchema = z.object({
  corretor_ids: z.array(z.string().uuid()),
})

export type CreateCorretorDTO = z.infer<typeof createCorretorSchema>
export type UpdateCorretorDTO = z.infer<typeof updateCorretorSchema>
export type ListCorretoresQuery = z.infer<typeof listCorretoresSchema>
export type BulkUpdateStatusDTO = z.infer<typeof bulkUpdateStatusSchema>
export type BulkResendCredentialsDTO = z.infer<typeof bulkResendCredentialsSchema>
