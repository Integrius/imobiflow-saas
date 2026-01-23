import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { CsvImportService } from '../../shared/services/csv-import.service'
import { z } from 'zod'

export async function leadsImportRoutes(server: FastifyInstance) {
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
  server.post('/analyze', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas administradores e gestores podem importar leads'
      })
    }

    try {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({
          error: 'Arquivo não enviado',
          message: 'Por favor, envie um arquivo CSV'
        })
      }

      // Verificar tipo de arquivo
      const filename = data.filename.toLowerCase()
      const mimetype = data.mimetype
      if (!filename.endsWith('.csv') && mimetype !== 'text/csv' && mimetype !== 'application/vnd.ms-excel') {
        return reply.status(400).send({
          error: 'Tipo de arquivo inválido',
          message: 'Apenas arquivos CSV são permitidos'
        })
      }

      // Ler o buffer do arquivo
      const buffer = await data.toBuffer()

      // Verificar tamanho (5MB max)
      if (buffer.length > 5 * 1024 * 1024) {
        return reply.status(400).send({
          error: 'Arquivo muito grande',
          message: 'O arquivo deve ter no máximo 5MB'
        })
      }

      const querySchema = z.object({
        delimiter: z.string().optional().default(';')
      })
      const query = querySchema.parse(request.query)

      const analysis = await CsvImportService.analyzeCSV(buffer, query.delimiter)

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
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    const tenantId = (request as any).tenantId

    if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas administradores e gestores podem importar leads'
      })
    }

    try {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({
          error: 'Arquivo não enviado',
          message: 'Por favor, envie um arquivo CSV'
        })
      }

      // Verificar tipo de arquivo
      const filename = data.filename.toLowerCase()
      const mimetype = data.mimetype
      if (!filename.endsWith('.csv') && mimetype !== 'text/csv' && mimetype !== 'application/vnd.ms-excel') {
        return reply.status(400).send({
          error: 'Tipo de arquivo inválido',
          message: 'Apenas arquivos CSV são permitidos'
        })
      }

      // Ler o buffer do arquivo
      const buffer = await data.toBuffer()

      // Verificar tamanho (5MB max)
      if (buffer.length > 5 * 1024 * 1024) {
        return reply.status(400).send({
          error: 'Arquivo muito grande',
          message: 'O arquivo deve ter no máximo 5MB'
        })
      }

      // Obter campos do formulário multipart
      const fields = data.fields

      // Extrair valores dos campos
      const getFieldValue = (fieldName: string): string | undefined => {
        const field = fields[fieldName]
        if (!field) return undefined
        if (Array.isArray(field)) {
          const firstField = field[0]
          return firstField && 'value' in firstField ? String(firstField.value) : undefined
        }
        return 'value' in field ? String(field.value) : undefined
      }

      // Validar e processar opções
      const delimiter = getFieldValue('delimiter') || ';'
      const fieldMappingStr = getFieldValue('fieldMapping')
      const defaultOrigem = getFieldValue('defaultOrigem') || 'OUTRO'
      const defaultTemperatura = getFieldValue('defaultTemperatura') || 'FRIO'
      const defaultCorretorId = getFieldValue('defaultCorretorId')
      const skipDuplicatesStr = getFieldValue('skipDuplicates')
      const updateExistingStr = getFieldValue('updateExisting')

      let fieldMapping: Record<string, string> | undefined
      if (fieldMappingStr) {
        try {
          fieldMapping = JSON.parse(fieldMappingStr)
        } catch {
          fieldMapping = undefined
        }
      }

      const skipDuplicates = skipDuplicatesStr !== 'false'
      const updateExisting = updateExistingStr === 'true'

      const result = await CsvImportService.importLeads(buffer, tenantId, {
        delimiter,
        fieldMapping,
        defaultOrigem: defaultOrigem as any,
        defaultTemperatura: defaultTemperatura as any,
        defaultCorretorId,
        skipDuplicates,
        updateExisting
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
