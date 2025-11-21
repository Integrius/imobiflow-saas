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

  async create(data: CreateNegociacaoDTO) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: data.lead_id }
    })
    if (!lead) {
      throw new AppError('Lead não encontrado', 404)
    }

    const imovel = await this.prisma.imovel.findUnique({
      where: { id: data.imovel_id }
    })
    if (!imovel) {
      throw new AppError('Imóvel não encontrado', 404)
    }
    if (imovel.status !== 'DISPONIVEL') {
      throw new AppError('Imóvel não está disponível', 400)
    }

    const corretor = await this.prisma.corretor.findUnique({
      where: { id: data.corretor_id }
    })
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404)
    }

    const negociacao = await this.repository.create(data)

    await this.prisma.imovel.update({
      where: { id: data.imovel_id },
      data: { status: 'RESERVADO' }
    })

    return negociacao
  }

  async findAll(query: QueryNegociacoesDTO) {
    return await this.repository.findAll(query)
  }

  async findById(id: string) {
    const negociacao = await this.repository.findById(id)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }
    return negociacao
  }

  async update(id: string, data: UpdateNegociacaoDTO) {
    const negociacao = await this.repository.findById(id)
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
      })

      if (data.status === 'FECHADO') {
        const categoria = negociacao.imovel.categoria
        const novoStatus = categoria === 'VENDA' ? 'VENDIDO' : 'ALUGADO'
        
        await this.prisma.imovel.update({
          where: { id: negociacao.imovel_id },
          data: { status: novoStatus }
        })

        if (data.valor_proposta) {
          await this.calcularComissoes(id, data.valor_proposta)
        }
      }

      if (data.status === 'PERDIDO') {
        await this.prisma.imovel.update({
          where: { id: negociacao.imovel_id },
          data: { status: 'DISPONIVEL' }
        })
      }
    }

    return await this.repository.update(id, data)
  }

  async delete(id: string) {
    const negociacao = await this.repository.findById(id)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    if (negociacao.status !== 'FECHADO') {
      await this.prisma.imovel.update({
        where: { id: negociacao.imovel_id },
        data: { status: 'DISPONIVEL' }
      })
    }

    return await this.repository.delete(id)
  }

  async addTimelineEvent(id: string, evento: AddTimelineEventDTO) {
    const negociacao = await this.repository.findById(id)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    return await this.repository.addTimelineEvent(id, evento)
  }

  async addComissao(id: string, comissao: AddComissaoDTO) {
    const negociacao = await this.repository.findById(id)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }

    const corretor = await this.prisma.corretor.findUnique({
      where: { id: comissao.corretor_id }
    })
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404)
    }

    return await this.repository.addComissao(id, comissao)
  }

  async getPipeline() {
    const countByStatus = await this.repository.countByStatus()
    
    return {
      CONTATO: countByStatus['CONTATO'] || 0,
      VISITA: countByStatus['VISITA'] || 0,
      PROPOSTA: countByStatus['PROPOSTA'] || 0,
      CONTRATO: countByStatus['CONTRATO'] || 0,
      FECHADO: countByStatus['FECHADO'] || 0,
      PERDIDO: countByStatus['PERDIDO'] || 0
    }
  }

  async getByCorretor(corretor_id: string) {
    return await this.repository.findByCorretor(corretor_id)
  }

  private mapStatusToEventType(status: StatusNegociacao): string {
    const map: Record<StatusNegociacao, string> = {
      CONTATO: 'CONTATO',
      VISITA: 'VISITA',
      PROPOSTA: 'PROPOSTA',
      CONTRATO: 'NEGOCIACAO',
      FECHADO: 'FECHAMENTO',
      PERDIDO: 'OBSERVACAO'
    }
    return map[status]
  }

  private async calcularComissoes(negociacao_id: string, valor_venda: number) {
    const negociacao = await this.repository.findById(negociacao_id)
    if (!negociacao) return

    const corretor = negociacao.corretor
    const percentualCorretor = corretor.comissao_padrao.toNumber()
    const valorComissaoCorretor = (valor_venda * percentualCorretor) / 100

    await this.addComissao(negociacao_id, {
      corretor_id: corretor.id,
      percentual: percentualCorretor,
      valor: valorComissaoCorretor
    })

    await this.addTimelineEvent(negociacao_id, {
      tipo: 'FECHAMENTO',
      descricao: `Comissões calculadas automaticamente`,
      dados: {
        valor_venda,
        comissao_corretor: valorComissaoCorretor,
        percentual_corretor: percentualCorretor
      }
    })
  }
}
