import { z } from 'zod'

// ============================================
// ENUMS — Tipo de Imóvel
// ============================================

export const tipoImovelSchema = z.enum([
  // Residencial
  'APARTAMENTO',
  'CASA',
  'SOBRADO',
  'COBERTURA',
  'LOFT',
  'KITNET',
  'STUDIO',
  'FLAT',
  'CASA_DE_VILA',
  'EDICULA',

  // Comercial
  'COMERCIAL',
  'SALA_COMERCIAL',
  'LAJE_CORPORATIVA',
  'LOJA_RUA',
  'LOJA_SHOPPING',
  'CASA_COMERCIAL',
  'QUIOSQUE',
  'GALPAO',
  'DEPOSITO',

  // Rural
  'RURAL',
  'CHACARA',
  'FAZENDA',
  'SITIO',
  'HARAS',
  'GLEBA',

  // Terrenos
  'TERRENO',
  'LOTE_CONDOMINIO',
  'LOTE_RUA',
  'TERRENO_INDUSTRIAL',
  'AREA_INCORPORACAO',
])

export const categoriaImovelSchema = z.enum([
  'VENDA',
  'LOCACAO',
  'TEMPORADA',
])

export const statusImovelSchema = z.enum([
  'DISPONIVEL',
  'RESERVADO',
  'VENDIDO',
  'ALUGADO',
  'INATIVO',
  'MANUTENCAO',
])

export const macroCategoriaSchema = z.enum([
  'RESIDENCIAL',
  'COMERCIAL',
  'RURAL',
  'TERRENO',
])

export const statusMobiliaSchema = z.enum([
  'VAZIO',
  'SEMIMOBILIADO',
  'MOBILIADO',
  'PORTEIRA_FECHADA',
])

export const posicaoSolarSchema = z.enum([
  'NASCENTE',
  'POENTE',
  'NASCENTE_POENTE',
])

// ============================================
// SCHEMA DE CARACTERÍSTICAS (JSON)
// ============================================

export const caracteristicasSchema = z.object({
  // Dormitórios
  quartos:  z.number().int().min(0).optional(),
  suites:   z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),

  // Garagem
  vagas:         z.number().int().min(0).optional(),
  vagas_garagem: z.number().int().min(0).optional(), // alias usado no seed e no frontend

  // Áreas
  area_total:     z.number().positive().optional(),
  area_construida: z.number().positive().optional(),

  // Posicionamento
  andar: z.number().int().optional(),

  // Comodidades booleanas
  mobiliado:            z.boolean().optional(),
  aceita_pets:          z.boolean().optional(),
  possui_elevador:      z.boolean().optional(),
  possui_piscina:       z.boolean().optional(),
  possui_churrasqueira: z.boolean().optional(),
  possui_academia:      z.boolean().optional(),
  possui_salao_festas:  z.boolean().optional(),
  possui_playground:    z.boolean().optional(),
  possui_quadra:        z.boolean().optional(),
  possui_sauna:         z.boolean().optional(),
  possui_portaria_24h:  z.boolean().optional(),
  possui_gerador:       z.boolean().optional(),

  // Comercial / Corporativo
  ar_condicionado_central: z.boolean().optional(),
  piso_elevado:            z.boolean().optional(),
  forro_acustico:          z.boolean().optional(),
  acessibilidade_pne:      z.boolean().optional(), // Banheiros PNE, rampas
  vagas_clientes:          z.number().int().min(0).optional(),
  classificacao_escritorio: z.enum(['A_PLUS', 'A', 'B', 'C']).optional(),

  // Rural
  recursos_hidricos: z.array(z.string()).optional(), // ["nascente", "poco_artesiano", "rio"]
  benfeitorias:      z.array(z.string()).optional(), // ["casa_sede", "curral", "estabulo"]
  aptidao:           z.enum(['AGRICOLA', 'PECUARIA', 'LAZER', 'MISTO']).optional(),
}).passthrough() // Permite campos extras sem falhar na validação

// ============================================
// SCHEMA DE ENDEREÇO
// ============================================

export const enderecoSchema = z.object({
  cep:         z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos numéricos (sem hífen)'),
  logradouro:  z.string().min(3, 'Logradouro deve ter pelo menos 3 caracteres').optional(),
  numero:      z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro:      z.string().min(2, 'Bairro deve ter pelo menos 2 caracteres').optional().nullable(),
  cidade:      z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres').optional().nullable(),
  estado:      z.string().length(2, 'Estado deve ter 2 letras').optional().nullable(),
  pais:        z.string().default('BR').optional(),
  latitude:    z.number().optional().nullable(),
  longitude:   z.number().optional().nullable(),
})

// ============================================
// SCHEMA CRIAR IMÓVEL
// ============================================

export const createImovelSchema = z.object({
  codigo:   z.string().min(3).max(50).optional(),
  tipo:     tipoImovelSchema,
  macro_categoria: macroCategoriaSchema.optional(),
  categoria: categoriaImovelSchema,

  // Descrição
  titulo:             z.string().min(3).max(200),
  descricao:          z.string().max(5000).optional().nullable(),
  descricao_amigavel: z.string().max(2000).optional().nullable(),
  diferenciais:       z.array(z.string()).optional().default([]),

  // Endereço
  endereco: enderecoSchema,

  // Características (JSON genérico expandido)
  caracteristicas: caracteristicasSchema,

  // Características físicas (colunas reais — novos campos)
  area_util:     z.number().positive().optional().nullable(),
  posicao_solar: posicaoSolarSchema.optional().nullable(),
  status_mobilia: statusMobiliaSchema.optional().nullable(),
  pe_direito:    z.number().positive().optional().nullable(),

  // Documentação registral
  matricula:             z.string().optional().nullable(),
  inscricao_imobiliaria: z.string().optional().nullable(),

  // Localização georreferenciada
  coordenadas_gps: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional().nullable(),

  // Campos de nicho (CAR, CCIR, testada de terreno, etc.)
  atributos_extras: z.record(z.string(), z.unknown()).optional().nullable(),

  // Valores financeiros
  preco:      z.number().positive(),
  condominio: z.number().nonnegative().optional().nullable(),
  iptu:       z.number().nonnegative().optional().nullable(),

  // Proprietário
  proprietario_id: z.string().uuid(),

  // Mídia
  fotos:           z.array(z.string()).optional().default([]),
  video_url:       z.string().url().optional().nullable(),
  tour_360_url:    z.string().url().optional().nullable(),
  planta_baixa_url: z.string().url().optional().nullable(),
  documentos:      z.array(z.string()).optional().default([]),

  // Flags
  status:         statusImovelSchema.optional().default('DISPONIVEL'),
  destaque:       z.boolean().optional().default(false),
  aceita_permuta: z.boolean().optional().default(false),
  exclusividade:  z.boolean().optional().default(false),
})

// ============================================
// SCHEMA ATUALIZAR IMÓVEL
// ============================================

export const updateImovelSchema = createImovelSchema.partial().omit({ fotos: true })

// ============================================
// SCHEMA FILTROS DE BUSCA
// ============================================

export const filterImoveisSchema = z.object({
  tipo:            tipoImovelSchema.optional(),
  macro_categoria: macroCategoriaSchema.optional(),
  categoria:       categoriaImovelSchema.optional(),
  status:          statusImovelSchema.optional(),
  preco_min:       z.coerce.number().positive().optional(),
  preco_max:       z.coerce.number().positive().optional(),
  quartos_min:     z.coerce.number().int().min(0).optional(),
  vagas_min:       z.coerce.number().int().min(0).optional(),
  area_min:        z.coerce.number().positive().optional(),
  cidade:          z.string().optional(),
  bairro:          z.string().optional(),
  destaque:        z.coerce.boolean().optional(),
  proprietario_id: z.string().uuid().optional(),
  corretor_id:     z.string().uuid().optional(),
  page:  z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  orderBy: z.enum(['preco_asc', 'preco_desc', 'data_asc', 'data_desc']).optional().default('data_desc'),
})

// ============================================
// SCHEMA BUSCA POR PROXIMIDADE
// ============================================

export const proximidadeSchema = z.object({
  latitude:  z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  raio_km:   z.coerce.number().positive().max(50).default(5),
  limit:     z.coerce.number().int().positive().max(100).optional().default(20),
})

// ============================================
// SCHEMA CONFIGURAÇÃO DE TIPO POR TENANT
// ============================================

export const tipoImovelConfigSchema = z.object({
  tipo:               tipoImovelSchema,
  ativo:              z.boolean().optional().default(true),
  atributos_visiveis: z.array(z.string()).optional().default([]),
})

export const upsertTipoImovelConfigSchema = z.object({
  configs: z.array(tipoImovelConfigSchema),
})

// ============================================
// TYPES
// ============================================

export type CreateImovelDTO       = z.infer<typeof createImovelSchema>
export type UpdateImovelDTO       = z.infer<typeof updateImovelSchema>
export type FilterImoveisDTO      = z.infer<typeof filterImoveisSchema>
export type ProximidadeDTO        = z.infer<typeof proximidadeSchema>
export type TipoImovel            = z.infer<typeof tipoImovelSchema>
export type MacroCategoriaImovel  = z.infer<typeof macroCategoriaSchema>
export type CategoriaImovel       = z.infer<typeof categoriaImovelSchema>
export type StatusImovel          = z.infer<typeof statusImovelSchema>
export type StatusMobilia         = z.infer<typeof statusMobiliaSchema>
export type PosicaoSolar          = z.infer<typeof posicaoSolarSchema>
export type TipoImovelConfigDTO   = z.infer<typeof tipoImovelConfigSchema>
