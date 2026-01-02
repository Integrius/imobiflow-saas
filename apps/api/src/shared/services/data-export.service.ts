import { prisma } from '../database/prisma.service'
import { Parser } from 'json2csv'

interface ExportResult {
  fileName: string
  csvContent: string
  totalRecords: number
}

export class DataExportService {
  /**
   * Exporta todos os dados de um tenant para CSV
   */
  static async exportTenantData(tenantId: string): Promise<{
    leads: ExportResult
    imoveis: ExportResult
    negociacoes: ExportResult
    proprietarios: ExportResult
    agendamentos: ExportResult
  }> {
    // 1. Exportar Leads
    const leads = await prisma.lead.findMany({
      where: { tenant_id: tenantId },
      include: {
        corretor: {
          include: {
            user: true
          }
        }
      }
    })

    const leadsCSV = this.generateCSV(
      leads.map(lead => ({
        ID: lead.id,
        Nome: lead.nome,
        Email: lead.email || '',
        Telefone: lead.telefone,
        'Tipo Negócio': lead.tipo_negocio || '',
        'Tipo Imóvel': lead.tipo_imovel_desejado || '',
        'Valor Mínimo': lead.valor_minimo?.toString() || '',
        'Valor Máximo': lead.valor_maximo?.toString() || '',
        Estado: lead.estado || '',
        Município: lead.municipio || '',
        Bairro: lead.bairro || '',
        Origem: lead.origem,
        Temperatura: lead.temperatura,
        Score: lead.score,
        'Corretor Responsável': lead.corretor?.user.nome || '',
        'Data Criação': lead.created_at.toISOString()
      }))
    )

    // 2. Exportar Imóveis
    const imoveis = await prisma.imovel.findMany({
      where: { tenant_id: tenantId },
      include: {
        proprietario: true,
        corretor_responsavel: {
          include: {
            user: true
          }
        }
      }
    })

    const imoveisCSV = this.generateCSV(
      imoveis.map(imovel => ({
        ID: imovel.id,
        Título: imovel.titulo,
        Descrição: imovel.descricao || '',
        'Tipo Negócio': imovel.tipo_negocio,
        'Tipo Imóvel': imovel.tipo_imovel,
        Valor: imovel.valor?.toString() || '',
        'Valor Aluguel': imovel.valor_aluguel?.toString() || '',
        'Valor Condomínio': imovel.valor_condominio?.toString() || '',
        'Valor IPTU': imovel.valor_iptu?.toString() || '',
        CEP: imovel.cep || '',
        Estado: imovel.estado,
        Município: imovel.municipio,
        Bairro: imovel.bairro,
        Logradouro: imovel.logradouro || '',
        Número: imovel.numero || '',
        Complemento: imovel.complemento || '',
        Quartos: imovel.quartos || '',
        Suítes: imovel.suites || '',
        Banheiros: imovel.banheiros || '',
        Vagas: imovel.vagas || '',
        'Área Total': imovel.area_total?.toString() || '',
        'Área Útil': imovel.area_util?.toString() || '',
        Status: imovel.status,
        'Aceita Pets': imovel.aceita_pets ? 'Sim' : 'Não',
        Mobiliado: imovel.mobiliado ? 'Sim' : 'Não',
        Proprietário: imovel.proprietario?.nome || '',
        'Corretor Responsável': imovel.corretor_responsavel?.user.nome || '',
        'Data Criação': imovel.created_at.toISOString()
      }))
    )

    // 3. Exportar Proprietários
    const proprietarios = await prisma.proprietario.findMany({
      where: { tenant_id: tenantId }
    })

    const proprietariosCSV = this.generateCSV(
      proprietarios.map(prop => ({
        ID: prop.id,
        Nome: prop.nome,
        Email: prop.email || '',
        Telefone: prop.telefone,
        CPF: prop.cpf || '',
        RG: prop.rg || '',
        CEP: prop.cep || '',
        Estado: prop.estado || '',
        Município: prop.municipio || '',
        Bairro: prop.bairro || '',
        Logradouro: prop.logradouro || '',
        Número: prop.numero || '',
        Complemento: prop.complemento || '',
        'Data Criação': prop.created_at.toISOString()
      }))
    )

    // 4. Exportar Negociações
    const negociacoes = await prisma.negociacao.findMany({
      where: { tenant_id: tenantId },
      include: {
        lead: true,
        imovel: true,
        corretor: {
          include: {
            user: true
          }
        }
      }
    })

    const negociacoesCSV = this.generateCSV(
      negociacoes.map(neg => ({
        ID: neg.id,
        Lead: neg.lead.nome,
        'Lead Email': neg.lead.email || '',
        'Lead Telefone': neg.lead.telefone,
        Imóvel: neg.imovel.titulo,
        'Tipo Negócio': neg.tipo_negocio,
        'Valor Proposta': neg.valor_proposta?.toString() || '',
        Status: neg.status,
        Corretor: neg.corretor?.user.nome || '',
        Observações: neg.observacoes || '',
        'Data Criação': neg.created_at.toISOString(),
        'Última Atualização': neg.updated_at.toISOString()
      }))
    )

    // 5. Exportar Agendamentos
    const agendamentos = await prisma.agendamento.findMany({
      where: { tenant_id: tenantId },
      include: {
        lead: true,
        imovel: true,
        corretor: {
          include: {
            user: true
          }
        }
      }
    })

    const agendamentosCSV = this.generateCSV(
      agendamentos.map(ag => ({
        ID: ag.id,
        Lead: ag.lead.nome,
        'Lead Telefone': ag.lead.telefone,
        Imóvel: ag.imovel.titulo,
        'Data Visita': ag.data_visita.toISOString(),
        'Duração (min)': ag.duracao_minutos,
        'Tipo Visita': ag.tipo_visita,
        Status: ag.status,
        Corretor: ag.corretor.user.nome,
        'Confirmado Lead': ag.confirmado_lead ? 'Sim' : 'Não',
        'Confirmado Corretor': ag.confirmado_corretor ? 'Sim' : 'Não',
        Realizado: ag.realizado ? 'Sim' : 'Não',
        'Feedback Lead': ag.feedback_lead || '',
        'Nota Lead': ag.nota_lead || '',
        'Data Criação': ag.created_at.toISOString()
      }))
    )

    return {
      leads: {
        fileName: `leads_${tenantId}.csv`,
        csvContent: leadsCSV,
        totalRecords: leads.length
      },
      imoveis: {
        fileName: `imoveis_${tenantId}.csv`,
        csvContent: imoveisCSV,
        totalRecords: imoveis.length
      },
      proprietarios: {
        fileName: `proprietarios_${tenantId}.csv`,
        csvContent: proprietariosCSV,
        totalRecords: proprietarios.length
      },
      negociacoes: {
        fileName: `negociacoes_${tenantId}.csv`,
        csvContent: negociacoesCSV,
        totalRecords: negociacoes.length
      },
      agendamentos: {
        fileName: `agendamentos_${tenantId}.csv`,
        csvContent: agendamentosCSV,
        totalRecords: agendamentos.length
      }
    }
  }

  /**
   * Gera CSV a partir de array de objetos
   */
  private static generateCSV(data: any[]): string {
    if (data.length === 0) {
      return ''
    }

    const fields = Object.keys(data[0])
    const parser = new Parser({ fields, delimiter: ';', withBOM: true })
    return parser.parse(data)
  }

  /**
   * Verifica se tenant está nos últimos 5 dias do trial
   */
  static async isInLast5Days(tenantId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { status: true, data_expiracao: true }
    })

    if (!tenant || tenant.status !== 'TRIAL' || !tenant.data_expiracao) {
      return false
    }

    const now = new Date()
    const expirationDate = new Date(tenant.data_expiracao)
    const diffTime = expirationDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays <= 5 && diffDays >= 0
  }

  /**
   * Verifica se tenant já exportou dados
   */
  static async hasExported(tenantId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { data_exportacao_dados: true }
    })

    return !!tenant?.data_exportacao_dados
  }

  /**
   * Marca data de exportação
   */
  static async markAsExported(tenantId: string): Promise<void> {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { data_exportacao_dados: new Date() }
    })
  }
}
