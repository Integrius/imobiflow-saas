import { LeadsRepository } from './leads.repository'
import { CreateLeadDTO, UpdateLeadDTO, ListLeadsQuery, TimelineEvent } from './leads.schema'
import { AppError } from '../../shared/errors/app-error'

export class LeadsService {
  constructor(private leadsRepository: LeadsRepository) {}

  async create(data: CreateLeadDTO, tenantId: string) {
    // Verificar se já existe lead com mesmo telefone
    const existingLead = await this.leadsRepository.findAll({
      page: 1,
      limit: 1,
      search: data.telefone,
    }, tenantId)

    if (existingLead.data.length > 0) {
      throw new AppError('Já existe um lead com este telefone', 400, 'LEAD_ALREADY_EXISTS')
    }

    // Criar lead
    const lead = await this.leadsRepository.create(data, tenantId)

    // Calcular score inicial
    const score = this.calculateScore(lead)
    const temperatura = this.calculateTemperatura(score)

    // Atualizar com score e temperatura
    const updatedLead = await this.leadsRepository.update(lead.id, { score, temperatura }, tenantId)

    // Adicionar evento na timeline
    await this.leadsRepository.addTimelineEvent(lead.id, {
      tipo: 'OBSERVACAO',
      descricao: 'Lead criado no sistema',
      detalhes: {
        origem: data.origem,
        score_inicial: score,
      },
    }, tenantId)

    return updatedLead
  }

  async findAll(query: ListLeadsQuery, tenantId: string) {
    return await this.leadsRepository.findAll(query, tenantId)
  }

  async findById(id: string, tenantId: string) {
    const lead = await this.leadsRepository.findById(id, tenantId)
    if (!lead) {
      throw new AppError('Lead não encontrado', 404, 'LEAD_NOT_FOUND')
    }
    return lead
  }

  async update(id: string, data: UpdateLeadDTO, tenantId: string) {
    const lead = await this.findById(id, tenantId)

    const updatedLead = await this.leadsRepository.update(id, data, tenantId)

    await this.leadsRepository.addTimelineEvent(id, {
      tipo: 'OBSERVACAO',
      descricao: 'Lead atualizado',
      detalhes: data,
    }, tenantId)

    return updatedLead
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId)
    await this.leadsRepository.delete(id, tenantId)
  }

  async assignCorretor(leadId: string, corretorId: string, tenantId: string) {
    const lead = await this.findById(leadId, tenantId)

    if (lead.corretor_id === corretorId) {
      throw new AppError('Lead já está atribuído a este corretor', 400)
    }

    const updatedLead = await this.leadsRepository.update(leadId, {
      corretor_id: corretorId,
    }, tenantId)

    await this.leadsRepository.addTimelineEvent(leadId, {
      tipo: 'OBSERVACAO',
      descricao: 'Lead atribuído ao corretor',
      detalhes: { corretor_id: corretorId },
    }, tenantId)

    return updatedLead
  }

  async addTimelineEvent(leadId: string, event: TimelineEvent, tenantId: string) {
    await this.findById(leadId, tenantId)
    return await this.leadsRepository.addTimelineEvent(leadId, event, tenantId)
  }

  async getStats(tenantId: string) {
    return await this.leadsRepository.getStats(tenantId)
  }

  private calculateScore(lead: any): number {
    let score = 0

    if (lead.email) score += 10
    if (lead.cpf) score += 15

    const interesse = lead.interesse as any
    if (interesse) {
      if (interesse.tipo_imovel?.length > 0) score += 7
      if (interesse.faixa_preco?.min || interesse.faixa_preco?.max) score += 7
      if (interesse.localizacao?.length > 0) score += 6
    }

    const origemScores: Record<string, number> = {
      INDICACAO: 25,
      SITE: 20,
      WHATSAPP: 15,
      TELEFONE: 10,
      PORTAL: 8,
      REDES_SOCIAIS: 5,
    }
    score += origemScores[lead.origem] || 0

    if (lead.corretor_id) score += 10

    return Math.min(score, 100)
  }

  private calculateTemperatura(score: number): 'QUENTE' | 'MORNO' | 'FRIO' {
    if (score >= 70) return 'QUENTE'
    if (score >= 40) return 'MORNO'
    return 'FRIO'
  }
}
