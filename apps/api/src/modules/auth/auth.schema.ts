import { z } from 'zod'

export const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  creci: z.string().min(5, 'CRECI inválido'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  tipo: z.enum(['ADMIN', 'CORRETOR']).optional(),
  especializacoes: z.array(z.string()).optional(),
  comissao_padrao: z.number().min(0).max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
