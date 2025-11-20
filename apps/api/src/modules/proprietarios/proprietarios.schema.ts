import { z } from 'zod'

// Schema de contato
export const contatoSchema = z.object({
  telefone_principal: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
  telefone_secundario: z.string().regex(/^\d{10,11}$/).optional().nullable(),
  email: z.string().email().optional().nullable(),
  whatsapp: z.string().regex(/^\d{10,11}$/).optional().nullable(),
})

// Schema de dados bancários
export const dadosBancariosSchema = z.object({
  banco: z.string().optional().nullable(),
  agencia: z.string().optional().nullable(),
  conta: z.string().optional().nullable(),
  tipo_conta: z.enum(['CORRENTE', 'POUPANCA']).optional().nullable(),
  pix: z.string().optional().nullable(),
}).optional()

// Schema para criar Proprietário
export const createProprietarioSchema = z.object({
  nome: z.string().min(3).max(200),
  cpf_cnpj: z.string().regex(/^\d{11}$|^\d{14}$/, 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos'),
  tipo_pessoa: z.enum(['FISICA', 'JURIDICA']).default('FISICA'),
  contato: contatoSchema,
  endereco: z.object({
    cep: z.string().regex(/^\d{8}$/).optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().length(2).optional(),
  }).optional(),
  dados_bancarios: dadosBancariosSchema,
  forma_pagamento: z.enum(['PIX', 'TED', 'BOLETO', 'DINHEIRO']).default('PIX'),
  percentual_comissao: z.number().min(0).max(100),
  observacoes: z.string().max(1000).optional().nullable(),
})

// Schema para atualizar Proprietário
export const updateProprietarioSchema = createProprietarioSchema.partial()

// Schema para filtros
export const filterProprietariosSchema = z.object({
  nome: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  tipo_pessoa: z.enum(['FISICA', 'JURIDICA']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
})

// Types
export type CreateProprietarioDTO = z.infer<typeof createProprietarioSchema>
export type UpdateProprietarioDTO = z.infer<typeof updateProprietarioSchema>
export type FilterProprietariosDTO = z.infer<typeof filterProprietariosSchema>
