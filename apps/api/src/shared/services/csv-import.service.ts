import { parse } from 'csv-parse/sync'
import { prisma } from '../database/prisma.service'
import { OrigemLead, Temperatura, TipoNegocio, TipoImovel } from '@prisma/client'

// Mapeamento de campos do CSV para campos do Lead
interface CsvFieldMapping {
  nome: string
  email?: string
  telefone: string
  cpf?: string
  origem?: string
  temperatura?: string
  tipo_negocio?: string
  tipo_imovel?: string
  valor_minimo?: string
  valor_maximo?: string
  estado?: string
  municipio?: string
  bairro?: string
  quartos_min?: string
  quartos_max?: string
  vagas_min?: string
  vagas_max?: string
  area_minima?: string
  aceita_pets?: string
  observacoes?: string
  corretor_email?: string // Para atribuição por email do corretor
}

// Resultado da importação
interface ImportResult {
  total: number
  sucesso: number
  erros: number
  duplicados: number
  detalhes: Array<{
    linha: number
    status: 'sucesso' | 'erro' | 'duplicado'
    nome?: string
    telefone?: string
    erro?: string
  }>
}

// Mapeamento de aliases para campos
const FIELD_ALIASES: Record<string, string[]> = {
  nome: ['nome', 'name', 'nome_completo', 'cliente', 'lead'],
  email: ['email', 'e-mail', 'e_mail', 'correio'],
  telefone: ['telefone', 'tel', 'phone', 'celular', 'whatsapp', 'contato'],
  cpf: ['cpf', 'documento', 'doc'],
  origem: ['origem', 'source', 'fonte', 'canal'],
  temperatura: ['temperatura', 'temp', 'status', 'qualificacao'],
  tipo_negocio: ['tipo_negocio', 'tipo negocio', 'negocio', 'interesse', 'operacao'],
  tipo_imovel: ['tipo_imovel', 'tipo imovel', 'imovel', 'tipo'],
  valor_minimo: ['valor_minimo', 'valor minimo', 'min', 'valor_min', 'preco_min'],
  valor_maximo: ['valor_maximo', 'valor maximo', 'max', 'valor_max', 'preco_max', 'budget', 'orcamento'],
  estado: ['estado', 'uf', 'state'],
  municipio: ['municipio', 'cidade', 'city', 'localidade'],
  bairro: ['bairro', 'neighborhood', 'regiao'],
  quartos_min: ['quartos_min', 'quartos min', 'quartos', 'dormitorios'],
  quartos_max: ['quartos_max', 'quartos max'],
  vagas_min: ['vagas_min', 'vagas min', 'vagas', 'garagem'],
  vagas_max: ['vagas_max', 'vagas max'],
  area_minima: ['area_minima', 'area minima', 'area', 'metragem', 'm2'],
  aceita_pets: ['aceita_pets', 'pets', 'animais'],
  observacoes: ['observacoes', 'obs', 'notas', 'comentarios', 'descricao'],
  corretor_email: ['corretor_email', 'corretor', 'vendedor', 'responsavel']
}

// Mapeamento de valores para enums
const ORIGEM_MAPPING: Record<string, OrigemLead> = {
  'site': 'SITE',
  'portal': 'PORTAL',
  'whatsapp': 'WHATSAPP',
  'telefone': 'TELEFONE',
  'indicacao': 'INDICACAO',
  'indicação': 'INDICACAO',
  'redes_sociais': 'REDES_SOCIAIS',
  'redes sociais': 'REDES_SOCIAIS',
  'instagram': 'REDES_SOCIAIS',
  'facebook': 'REDES_SOCIAIS',
  'evento': 'EVENTO',
  'outro': 'OUTRO',
  'outros': 'OUTRO',
  'importacao': 'OUTRO',
  'importação': 'OUTRO',
  'csv': 'OUTRO'
}

const TEMPERATURA_MAPPING: Record<string, Temperatura> = {
  'quente': 'QUENTE',
  'hot': 'QUENTE',
  'morno': 'MORNO',
  'warm': 'MORNO',
  'frio': 'FRIO',
  'cold': 'FRIO'
}

const TIPO_NEGOCIO_MAPPING: Record<string, TipoNegocio> = {
  'compra': 'COMPRA',
  'comprar': 'COMPRA',
  'buy': 'COMPRA',
  'aluguel': 'ALUGUEL',
  'alugar': 'ALUGUEL',
  'locacao': 'ALUGUEL',
  'locação': 'ALUGUEL',
  'rent': 'ALUGUEL',
  'temporada': 'TEMPORADA',
  'venda': 'VENDA',
  'vender': 'VENDA',
  'sell': 'VENDA'
}

const TIPO_IMOVEL_MAPPING: Record<string, TipoImovel> = {
  'apartamento': 'APARTAMENTO',
  'apto': 'APARTAMENTO',
  'ap': 'APARTAMENTO',
  'casa': 'CASA',
  'terreno': 'TERRENO',
  'lote': 'TERRENO',
  'comercial': 'COMERCIAL',
  'sala': 'COMERCIAL',
  'loja': 'COMERCIAL',
  'rural': 'RURAL',
  'fazenda': 'RURAL',
  'sitio': 'RURAL',
  'sítio': 'RURAL',
  'chacara': 'CHACARA',
  'chácara': 'CHACARA',
  'sobrado': 'SOBRADO',
  'cobertura': 'COBERTURA',
  'loft': 'LOFT',
  'kitnet': 'KITNET',
  'studio': 'KITNET'
}

export class CsvImportService {
  /**
   * Analisa o CSV e retorna preview das colunas detectadas
   */
  static async analyzeCSV(buffer: Buffer, delimiter: string = ';'): Promise<{
    headers: string[]
    mappedFields: Record<string, string>
    sampleRows: Record<string, string>[]
    totalRows: number
  }> {
    // Tentar detectar encoding e converter para UTF-8
    const content = buffer.toString('utf-8').replace(/^\uFEFF/, '') // Remove BOM

    const records = parse(content, {
      columns: false,
      skip_empty_lines: true,
      delimiter,
      relaxColumnCount: true
    }) as string[][]

    if (records.length === 0) {
      throw new Error('Arquivo CSV vazio')
    }

    const headers = records[0].map(h => h.trim().toLowerCase())
    const dataRows = records.slice(1)

    // Mapear campos automaticamente
    const mappedFields: Record<string, string> = {}
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      const matchedHeader = headers.find(h =>
        aliases.some(alias => h.includes(alias.toLowerCase()))
      )
      if (matchedHeader) {
        mappedFields[field] = matchedHeader
      }
    }

    // Amostras das primeiras 5 linhas
    const sampleRows = dataRows.slice(0, 5).map(row => {
      const obj: Record<string, string> = {}
      headers.forEach((header, idx) => {
        obj[header] = row[idx] || ''
      })
      return obj
    })

    return {
      headers,
      mappedFields,
      sampleRows,
      totalRows: dataRows.length
    }
  }

  /**
   * Importa leads do CSV
   */
  static async importLeads(
    buffer: Buffer,
    tenantId: string,
    options: {
      delimiter?: string
      fieldMapping?: Record<string, string>
      defaultOrigem?: OrigemLead
      defaultTemperatura?: Temperatura
      defaultCorretorId?: string
      skipDuplicates?: boolean
      updateExisting?: boolean
    } = {}
  ): Promise<ImportResult> {
    const {
      delimiter = ';',
      fieldMapping = {},
      defaultOrigem = 'OUTRO',
      defaultTemperatura = 'FRIO',
      defaultCorretorId,
      skipDuplicates = true,
      updateExisting = false
    } = options

    const content = buffer.toString('utf-8').replace(/^\uFEFF/, '')

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      relaxColumnCount: true,
      cast: false
    }) as Record<string, string>[]

    const result: ImportResult = {
      total: records.length,
      sucesso: 0,
      erros: 0,
      duplicados: 0,
      detalhes: []
    }

    // Criar mapa de corretores por email para atribuição
    const corretores = await prisma.corretor.findMany({
      where: { tenant_id: tenantId },
      include: { user: { select: { email: true } } }
    })
    const corretorMap = new Map(
      corretores.map(c => [c.user.email.toLowerCase(), c.id])
    )

    // Processar cada linha
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const lineNumber = i + 2 // +2 porque linha 1 é header

      try {
        // Mapear campos
        const getValue = (field: string): string | undefined => {
          const mappedColumn = fieldMapping[field]
          if (mappedColumn && row[mappedColumn]) {
            return row[mappedColumn].trim()
          }
          // Tentar aliases automáticos
          for (const alias of FIELD_ALIASES[field] || []) {
            const value = Object.entries(row).find(
              ([key]) => key.toLowerCase().includes(alias.toLowerCase())
            )?.[1]
            if (value) return value.trim()
          }
          return undefined
        }

        const nome = getValue('nome')
        const telefone = getValue('telefone')

        // Validar campos obrigatórios
        if (!nome) {
          result.erros++
          result.detalhes.push({
            linha: lineNumber,
            status: 'erro',
            telefone,
            erro: 'Nome é obrigatório'
          })
          continue
        }

        if (!telefone) {
          result.erros++
          result.detalhes.push({
            linha: lineNumber,
            status: 'erro',
            nome,
            erro: 'Telefone é obrigatório'
          })
          continue
        }

        // Normalizar telefone (remover caracteres não numéricos)
        const telefoneNormalizado = telefone.replace(/\D/g, '')
        if (telefoneNormalizado.length < 10) {
          result.erros++
          result.detalhes.push({
            linha: lineNumber,
            status: 'erro',
            nome,
            telefone,
            erro: 'Telefone inválido (mínimo 10 dígitos)'
          })
          continue
        }

        // Verificar duplicata
        const existing = await prisma.lead.findFirst({
          where: {
            tenant_id: tenantId,
            telefone: { contains: telefoneNormalizado.slice(-9) }
          }
        })

        if (existing) {
          if (skipDuplicates && !updateExisting) {
            result.duplicados++
            result.detalhes.push({
              linha: lineNumber,
              status: 'duplicado',
              nome,
              telefone,
              erro: 'Lead já existe com este telefone'
            })
            continue
          }

          if (updateExisting) {
            // Atualizar lead existente
            await prisma.lead.update({
              where: { id: existing.id },
              data: {
                nome,
                email: getValue('email') || existing.email,
                observacoes: getValue('observacoes') || existing.observacoes
              }
            })
            result.sucesso++
            result.detalhes.push({
              linha: lineNumber,
              status: 'sucesso',
              nome,
              telefone
            })
            continue
          }
        }

        // Mapear valores de enums
        const origemRaw = getValue('origem')?.toLowerCase()
        const origem = origemRaw ? (ORIGEM_MAPPING[origemRaw] || defaultOrigem) : defaultOrigem

        const temperaturaRaw = getValue('temperatura')?.toLowerCase()
        const temperatura = temperaturaRaw
          ? (TEMPERATURA_MAPPING[temperaturaRaw] || defaultTemperatura)
          : defaultTemperatura

        const tipoNegocioRaw = getValue('tipo_negocio')?.toLowerCase()
        const tipo_negocio = tipoNegocioRaw
          ? TIPO_NEGOCIO_MAPPING[tipoNegocioRaw]
          : undefined

        const tipoImovelRaw = getValue('tipo_imovel')?.toLowerCase()
        const tipo_imovel = tipoImovelRaw
          ? TIPO_IMOVEL_MAPPING[tipoImovelRaw]
          : undefined

        // Atribuição de corretor
        let corretor_id = defaultCorretorId
        const corretorEmail = getValue('corretor_email')?.toLowerCase()
        if (corretorEmail && corretorMap.has(corretorEmail)) {
          corretor_id = corretorMap.get(corretorEmail)
        }

        // Parse de valores numéricos
        const parseDecimal = (value?: string): number | undefined => {
          if (!value) return undefined
          const num = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'))
          return isNaN(num) ? undefined : num
        }

        const parseInt_ = (value?: string): number | undefined => {
          if (!value) return undefined
          const num = parseInt(value.replace(/\D/g, ''), 10)
          return isNaN(num) ? undefined : num
        }

        const parseBool = (value?: string): boolean | undefined => {
          if (!value) return undefined
          const lower = value.toLowerCase()
          if (['sim', 'yes', 'true', '1', 's'].includes(lower)) return true
          if (['nao', 'não', 'no', 'false', '0', 'n'].includes(lower)) return false
          return undefined
        }

        // Criar lead
        await prisma.lead.create({
          data: {
            tenant_id: tenantId,
            nome,
            email: getValue('email'),
            telefone: telefoneNormalizado,
            cpf: getValue('cpf'),
            origem,
            temperatura,
            tipo_negocio,
            tipo_imovel_desejado: tipo_imovel,
            valor_minimo: parseDecimal(getValue('valor_minimo')),
            valor_maximo: parseDecimal(getValue('valor_maximo')),
            estado: getValue('estado'),
            municipio: getValue('municipio'),
            bairro: getValue('bairro'),
            quartos_min: parseInt_(getValue('quartos_min')),
            quartos_max: parseInt_(getValue('quartos_max')),
            vagas_min: parseInt_(getValue('vagas_min')),
            vagas_max: parseInt_(getValue('vagas_max')),
            area_minima: parseDecimal(getValue('area_minima')),
            aceita_pets: parseBool(getValue('aceita_pets')),
            observacoes: getValue('observacoes'),
            corretor_id,
            timeline: [{
              tipo: 'IMPORTACAO',
              descricao: 'Lead importado via CSV',
              data: new Date().toISOString()
            }]
          }
        })

        result.sucesso++
        result.detalhes.push({
          linha: lineNumber,
          status: 'sucesso',
          nome,
          telefone
        })
      } catch (error: any) {
        result.erros++
        result.detalhes.push({
          linha: lineNumber,
          status: 'erro',
          nome: row['nome'] || row['Nome'],
          telefone: row['telefone'] || row['Telefone'],
          erro: error.message || 'Erro desconhecido'
        })
      }
    }

    return result
  }

  /**
   * Gera template CSV para download
   */
  static generateTemplate(): string {
    const headers = [
      'nome',
      'email',
      'telefone',
      'cpf',
      'origem',
      'temperatura',
      'tipo_negocio',
      'tipo_imovel',
      'valor_minimo',
      'valor_maximo',
      'estado',
      'municipio',
      'bairro',
      'quartos_min',
      'quartos_max',
      'vagas_min',
      'vagas_max',
      'area_minima',
      'aceita_pets',
      'observacoes',
      'corretor_email'
    ]

    const example = [
      'João Silva',
      'joao@email.com',
      '11999998888',
      '123.456.789-00',
      'SITE',
      'MORNO',
      'COMPRA',
      'APARTAMENTO',
      '300000',
      '500000',
      'SP',
      'São Paulo',
      'Jardins',
      '2',
      '3',
      '1',
      '2',
      '80',
      'sim',
      'Precisa de vaga coberta',
      'corretor@imobiliaria.com'
    ]

    // BOM + Headers + Exemplo
    const bom = '\uFEFF'
    return bom + headers.join(';') + '\n' + example.join(';')
  }
}

export const csvImportService = new CsvImportService()
