import { PrismaClient } from '@prisma/client'
import { NegociacoesRepository } from './negociacoes.repository'
import { 
  CreateNegociacaoDTO, 
  UpdateNegociacaoDTO, 
  QueryNegociacoesDTO,
  AddTimelineEventDTO,
  AddComissaoDTO,
  StatusNegociacao
} from './negociacoes.schema'
import { AppError } from '../../shared/errors/AppError'

export class NegociacoesService {
  private repository: NegociacoesRepository

  constructor(private prisma: PrismaClient) {
    this.repository = new NegociacoesRepository(prisma)
  }

  async create(data: CreateNegociacaoDTO, tenantId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: data.lead_id, tenant_id: tenantId }
    })
    if (!lead) {
      throw new AppError('Lead não encontrado', 404)
    }

    const imovel = await this.prisma.imovel.findFirst({
      where: { id: data.imovel_id, tenant_id: tenantId }
    })
    if (!imovel) {
      throw new AppError('Imóvel não encontrado', 404)
    }
    if (imovel.status !== 'DISPONIVEL') {
      throw new AppError('Imóvel não está disponível', 400)
    }

    const corretor = await this.prisma.corretor.findFirst({
      where: { id: data.corretor_id, tenant_id: tenantId }
    })
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404)
    }

    const negociacao = await this.repository.create(data, tenantId)

    await this.prisma.imovel.update({
      where: { id: data.imovel_id },
      data: { status: 'RESERVADO' }
    })

    return negociacao
  }

  async findAll(query: QueryNegociacoesDTO, tenantId: string) {
    return await this.repository.findAll(query, tenantId)
  }

  async findById(id: string, tenantId: string) {
    const negociacao = await this.repository.findById(id, tenantId)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }
    return negociacao
  }

  async update(id: string, data: UpdateNegociacaoDTO, tenantId: string) {
    const negociacao = await this.repository.findById(id, tenantId)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    if (data.status && data.status !== negociacao.status) {
      await this.addTimelineEvent(id, {
        tipo: this.mapStatusToEventType(data.status),
        descricao: `Status alterado para ${data.status}`,
        dados: {
          status_anterior: negociacao.status,
          status_novo: data.status
        }
      }, tenantId)

      if (data.status === 'FECHADO') {
        const categoria = negociacao.imovel.categoria
        const novoStatus = categoria === 'VENDA' ? 'VENDIDO' : 'ALUGADO'

        await this.prisma.imovel.update({
          where: { id: negociacao.imovel_id },
          data: { status: novoStatus }
        })

        if (data.valor_proposta) {
          await this.calcularComissoes(id, data.valor_proposta, tenantId)
        }
      }

      if (data.status === 'PERDIDO') {
        await this.prisma.imovel.update({
          where: { id: negociacao.imovel_id },
          data: { status: 'DISPONIVEL' }
        })
      }
    }

    return await this.repository.update(id, data, tenantId)
  }

  async delete(id: string, tenantId: string) {
    const negociacao = await this.repository.findById(id, tenantId)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    if (negociacao.status !== 'FECHADO') {
      await this.prisma.imovel.update({
        where: { id: negociacao.imovel_id },
        data: { status: 'DISPONIVEL' }
      })
    }

    return await this.repository.delete(id, tenantId)
  }

  async addTimelineEvent(id: string, evento: AddTimelineEventDTO, tenantId: string) {
    const negociacao = await this.repository.findById(id, tenantId)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    return await this.repository.addTimelineEvent(id, evento, tenantId)
  }

  async addComissao(id: string, comissao: AddComissaoDTO, tenantId: string) {
    const negociacao = await this.repository.findById(id, tenantId)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    const corretor = await this.prisma.corretor.findFirst({
      where: { id: comissao.corretor_id, tenant_id: tenantId }
    })
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404)
    }

    return await this.repository.addComissao(id, comissao, tenantId)
  }

  async getPipeline(tenantId: string) {
    const countByStatus = await this.repository.countByStatus(tenantId)

    return {
      CONTATO: countByStatus['CONTATO'] || 0,
      VISITA: countByStatus['VISITA'] || 0,
      PROPOSTA: countByStatus['PROPOSTA'] || 0,
      CONTRATO: countByStatus['CONTRATO'] || 0,
      FECHADO: countByStatus['FECHADO'] || 0,
      PERDIDO: countByStatus['PERDIDO'] || 0
    }
  }

  async getByCorretor(corretor_id: string, tenantId: string) {
    return await this.repository.findByCorretor(corretor_id, tenantId)
  }

  private mapStatusToEventType(status: StatusNegociacao): 'CONTATO' | 'VISITA' | 'PROPOSTA' | 'OBSERVACAO' | 'NEGOCIACAO' | 'FECHAMENTO' {
    const map: Record<StatusNegociacao, 'CONTATO' | 'VISITA' | 'PROPOSTA' | 'OBSERVACAO' | 'NEGOCIACAO' | 'FECHAMENTO'> = {
      CONTATO: 'CONTATO',
      VISITA_AGENDADA: 'VISITA',
      VISITA_REALIZADA: 'VISITA',
      PROPOSTA: 'PROPOSTA',
      ANALISE_CREDITO: 'NEGOCIACAO',
      CONTRATO: 'NEGOCIACAO',
      FECHADO: 'FECHAMENTO',
      PERDIDO: 'OBSERVACAO',
      CANCELADO: 'OBSERVACAO'
    }
    return map[status]
  }

  private async calcularComissoes(negociacao_id: string, valor_venda: number, tenantId: string) {
    const negociacao = await this.repository.findById(negociacao_id, tenantId)
    if (!negociacao) return

    const corretor = negociacao.corretor
    const percentualCorretor = corretor.comissao_padrao.toNumber()
    const valorComissaoCorretor = (valor_venda * percentualCorretor) / 100

    await this.addComissao(negociacao_id, {
      corretor_id: corretor.id,
      percentual: percentualCorretor,
      valor: valorComissaoCorretor
    }, tenantId)

    await this.addTimelineEvent(negociacao_id, {
      tipo: 'FECHAMENTO',
      descricao: `Comissões calculadas automaticamente`,
      dados: {
        valor_venda,
        comissao_corretor: valorComissaoCorretor,
        percentual_corretor: percentualCorretor
      }
    }, tenantId)
  }
}
