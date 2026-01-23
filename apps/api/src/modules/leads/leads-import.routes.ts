import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { CsvImportService } from '../../shared/services/csv-import.service'
import { z } from 'zod'
import multer from 'fastify-multer'

// Configurar multer para upload em memória
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    // Aceitar apenas CSV
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos') as any, false)
    }
  }
})

export async function leadsImportRoutes(server: FastifyInstance) {
  // Registrar multer
  server.register(multer.contentParser)

  // Middleware de autenticação e tenant
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', tenantMiddleware)

  /**
   * GET /api/v1/leads/import/template
   * Download do template CSV
   */
  server.get('/template', async (_request: FastifyRequest, reply: FastifyReply) => {
    const csv = CsvImportService.generateTemplate()

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="template_leads.csv"')
      .send(csv)
  })

  /**
   * POST /api/v1/leads/import/analyze
   * Analisa CSV e retorna preview
   */
  server.post('/analyze', {
    preHandler: upload.single('file')
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas administradores e gestores podem importar leads'
      })
    }

    const file = (request as any).file
    if (!file) {
      return reply.status(400).send({
        error: 'Arquivo não enviado',
        message: 'Por favor, envie um arquivo CSV'
      })
    }

    try {
      const delimiter = (request.query as any).delimiter || ';'
      const analysis = await CsvImportService.analyzeCSV(file.buffer, delimiter)

      return reply.send({
        success: true,
        data: analysis
      })
    } catch (error: any) {
      return reply.status(400).send({
        error: 'Erro ao analisar CSV',
        message: error.message
      })
    }
  })

  /**
   * POST /api/v1/leads/import
   * Importa leads do CSV
   */
  server.post('/', {
    preHandler: upload.single('file')
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    const tenantId = (request as any).tenantId

    if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas administradores e gestores podem importar leads'
      })
    }

    const file = (request as any).file
    if (!file) {
      return reply.status(400).send({
        error: 'Arquivo não enviado',
        message: 'Por favor, envie um arquivo CSV'
      })
    }

    // Validar body
    const bodySchema = z.object({
      delimiter: z.string().optional().default(';'),
      fieldMapping: z.record(z.string()).optional(),
      defaultOrigem: z.enum(['SITE', 'PORTAL', 'WHATSAPP', 'TELEFONE', 'INDICACAO', 'REDES_SOCIAIS', 'EVENTO', 'OUTRO']).optional(),
      defaultTemperatura: z.enum(['QUENTE', 'MORNO', 'FRIO']).optional(),
      defaultCorretorId: z.string().uuid().optional(),
      skipDuplicates: z.boolean().optional().default(true),
      updateExisting: z.boolean().optional().default(false)
    })

    let options: z.infer<typeof bodySchema>
    try {
      // Body pode vir como string JSON no FormData
      const bodyData = typeof request.body === 'string'
        ? JSON.parse(request.body)
        : request.body || {}
      options = bodySchema.parse(bodyData)
    } catch (error: any) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        message: error.message
      })
    }

    try {
      const result = await CsvImportService.importLeads(file.buffer, tenantId, {
        delimiter: options.delimiter,
        fieldMapping: options.fieldMapping,
        defaultOrigem: options.defaultOrigem as any,
        defaultTemperatura: options.defaultTemperatura as any,
        defaultCorretorId: options.defaultCorretorId,
        skipDuplicates: options.skipDuplicates,
        updateExisting: options.updateExisting
      })

      return reply.send({
        success: true,
        message: `Importação concluída: ${result.sucesso} leads importados`,
        data: result
      })
    } catch (error: any) {
      console.error('Erro na importação:', error)
      return reply.status(500).send({
        error: 'Erro na importação',
        message: error.message
      })
    }
  })

  /**
   * GET /api/v1/leads/import/fields
   * Retorna campos disponíveis para mapeamento
   */
  server.get('/fields', async (_request: FastifyRequest, reply: FastifyReply) => {
    const fields = [
      { name: 'nome', label: 'Nome', required: true, description: 'Nome completo do lead' },
      { name: 'email', label: 'Email', required: false, description: 'Endereço de email' },
      { name: 'telefone', label: 'Telefone', required: true, description: 'Telefone com DDD' },
      { name: 'cpf', label: 'CPF', required: false, description: 'CPF do lead' },
      { name: 'origem', label: 'Origem', required: false, description: 'Origem do lead (SITE, WHATSAPP, etc.)' },
      { name: 'temperatura', label: 'Temperatura', required: false, description: 'Qualificação (QUENTE, MORNO, FRIO)' },
      { name: 'tipo_negocio', label: 'Tipo de Negócio', required: false, description: 'COMPRA, ALUGUEL, TEMPORADA, VENDA' },
      { name: 'tipo_imovel', label: 'Tipo de Imóvel', required: false, description: 'APARTAMENTO, CASA, etc.' },
      { name: 'valor_minimo', label: 'Valor Mínimo', required: false, description: 'Valor mínimo desejado' },
      { name: 'valor_maximo', label: 'Valor Máximo', required: false, description: 'Valor máximo/orçamento' },
      { name: 'estado', label: 'Estado', required: false, description: 'UF (ex: SP, RJ)' },
      { name: 'municipio', label: 'Município', required: false, description: 'Cidade' },
      { name: 'bairro', label: 'Bairro', required: false, description: 'Bairro desejado' },
      { name: 'quartos_min', label: 'Quartos (mín)', required: false, description: 'Mínimo de quartos' },
      { name: 'quartos_max', label: 'Quartos (máx)', required: false, description: 'Máximo de quartos' },
      { name: 'vagas_min', label: 'Vagas (mín)', required: false, description: 'Mínimo de vagas' },
      { name: 'vagas_max', label: 'Vagas (máx)', required: false, description: 'Máximo de vagas' },
      { name: 'area_minima', label: 'Área mínima', required: false, description: 'Área mínima em m²' },
      { name: 'aceita_pets', label: 'Aceita Pets', required: false, description: 'sim/não' },
      { name: 'observacoes', label: 'Observações', required: false, description: 'Notas adicionais' },
      { name: 'corretor_email', label: 'Corretor (email)', required: false, description: 'Email do corretor para atribuição' }
    ]

    const enums = {
      origem: ['SITE', 'PORTAL', 'WHATSAPP', 'TELEFONE', 'INDICACAO', 'REDES_SOCIAIS', 'EVENTO', 'OUTRO'],
      temperatura: ['QUENTE', 'MORNO', 'FRIO'],
      tipo_negocio: ['COMPRA', 'ALUGUEL', 'TEMPORADA', 'VENDA'],
      tipo_imovel: ['APARTAMENTO', 'CASA', 'TERRENO', 'COMERCIAL', 'RURAL', 'CHACARA', 'SOBRADO', 'COBERTURA', 'LOFT', 'KITNET']
    }

    return reply.send({
      success: true,
      data: { fields, enums }
    })
  })
}
