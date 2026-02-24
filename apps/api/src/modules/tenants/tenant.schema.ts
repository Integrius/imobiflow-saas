import { z } from 'zod'

export const createTenantSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  slug: z.string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  logo_url: z.string().url().optional(),
  plano: z.enum(['BASICO', 'PRO', 'ENTERPRISE', 'CUSTOM']).default('BASICO'),
  // Dados do usuário admin
  adminNome: z.string().min(3, 'Nome do admin deve ter no mínimo 3 caracteres').optional(),
  adminEmail: z.string().email('Email do admin inválido').optional(),
  adminSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional()
})

export const updateTenantSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  logo_url: z.string().url().optional(),
  cores_tema: z.record(z.string(), z.string()).optional(),
  configuracoes: z.record(z.string(), z.any()).optional(),
  plano: z.enum(['BASICO', 'PRO', 'ENTERPRISE', 'CUSTOM']).optional(),
  status: z.enum(['TRIAL', 'ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO']).optional(),
  data_expiracao: z.string().datetime().optional()
})

export type CreateTenantDTO = z.infer<typeof createTenantSchema>
export type UpdateTenantDTO = z.infer<typeof updateTenantSchema>
