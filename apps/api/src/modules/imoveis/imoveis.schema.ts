import { z } from 'zod'

// Enums
export const tipoImovelSchema = z.enum([
  'APARTAMENTO',
  'CASA',
  'TERRENO',
  'COMERCIAL',
  'RURAL'
])

export const categoriaImovelSchema = z.enum([
  'VENDA',
  'LOCACAO',
  'TEMPORADA'
])

export const statusImovelSchema = z.enum([
  'DISPONIVEL',
  'RESERVADO',
  'VENDIDO',
  'ALUGADO',
  'INATIVO'
])

// Schema de características
export const caracteristicasSchema = z.object({
  quartos: z.number().int().min(0).optional(),
  suites: z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),
  area_total: z.number().positive().optional(),
  area_construida: z.number().positive().optional(),
  andar: z.number().int().optional(),
  mobiliado: z.boolean().optional(),
  aceita_pets: z.boolean().optional(),
  possui_elevador: z.boolean().optional(),
  possui_piscina: z.boolean().optional(),
  possui_churrasqueira: z.boolean().optional(),
  possui_academia: z.boolean().optional(),
  possui_salao_festas: z.boolean().optional(),
})

// Schema de endereço
export const enderecoSchema = z.object({
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  logradouro: z.string().min(3).optional(),
  numero: z.string(),
  complemento: z.string().optional(),
  bairro: z.string().min(2).optional(),
  cidade: z.string().min(2).optional(),
  estado: z.string().length(2, 'Estado deve ter 2 letras').optional(),
  pais: z.string().default('BR').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// Schema para criar Imóvel
export const createImovelSchema = z.object({
  codigo: z.string().min(3).max(50).optional(),
  tipo: tipoImovelSchema,
  categoria: categoriaImovelSchema,
  titulo: z.string().min(10).max(200),
  descricao: z.string().min(50).max(5000),
  endereco: enderecoSchema,
  caracteristicas: caracteristicasSchema,
  preco: z.number().positive(),
  condominio: z.number().nonnegative().optional().nullable(),
  iptu: z.number().nonnegative().optional().nullable(),
  proprietario_id: z.string().uuid(),
  fotos: z.array(z.string()).optional().default([]),
  documentos: z.array(z.string()).optional().default([]),
  status: statusImovelSchema.optional().default('DISPONIVEL'),
  destaque: z.boolean().optional().default(false),
  aceita_permuta: z.boolean().optional().default(false),
  exclusividade: z.boolean().optional().default(false),
})

// Schema para atualizar Imóvel
export const updateImovelSchema = createImovelSchema.partial()

// Schema para filtros de busca (aceita strings de query)
export const filterImoveisSchema = z.object({
  tipo: tipoImovelSchema.optional(),
  categoria: categoriaImovelSchema.optional(),
  status: statusImovelSchema.optional(),
  preco_min: z.coerce.number().positive().optional(),
  preco_max: z.coerce.number().positive().optional(),
  quartos_min: z.coerce.number().int().min(0).optional(),
  vagas_min: z.coerce.number().int().min(0).optional(),
  area_min: z.coerce.number().positive().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  destaque: z.coerce.boolean().optional(),
  proprietario_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  orderBy: z.enum(['preco_asc', 'preco_desc', 'data_asc', 'data_desc']).optional().default('data_desc'),
})

// Schema para busca por proximidade
export const proximidadeSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  raio_km: z.coerce.number().positive().max(50).default(5),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

// Types
export type CreateImovelDTO = z.infer<typeof createImovelSchema>
export type UpdateImovelDTO = z.infer<typeof updateImovelSchema>
export type FilterImoveisDTO = z.infer<typeof filterImoveisSchema>
export type ProximidadeDTO = z.infer<typeof proximidadeSchema>
export type TipoImovel = z.infer<typeof tipoImovelSchema>
export type CategoriaImovel = z.infer<typeof categoriaImovelSchema>
export type StatusImovel = z.infer<typeof statusImovelSchema>
