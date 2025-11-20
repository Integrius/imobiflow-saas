import { PrismaClient } from '@prisma/client'
import { NegociacoesRepository } from './negociacoes.repository'
import { AppError } from '../../shared/errors/AppError'
import {
  CreateNegociacaoDTO,
  UpdateNegociacaoDTO,
  ChangeStatusDTO,
  AddComissaoDTO,
  AddDocumentoDTO,
  ListNegociacoesDTO,
} from './negociacoes.schema'

export class NegociacoesService {
  private repository: NegociacoesRepository

  constructor(prisma: PrismaClient) {
    this.repository = new NegociacoesRepository(prisma)
  }

  async create(data: CreateNegociacaoDTO, prisma: PrismaClient) {
    const lead = await prisma.lead.findUnique({
      where: { id: data.lead_id },
    })
    if (!lead) {
      throw new AppError('Lead não encontrado', 404)
    }

    const imovel = await prisma.imovel.findUnique({
      where: { id: data.imovel_id },
    })
    if (!imovel) {
      throw new AppError('Imóvel não encontrado', 404)
    }
    if (imovel.status === 'VENDIDO' || imovel.status === 'ALUGADO') {
      throw new AppError('Imóvel não está disponível', 400)
    }

    const corretor = await prisma.corretor.findUnique({
      where: { id: data.corretor_id },
    })
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404)
    }

    const negociacaoExistente = await prisma.negociacao.findFirst({
      where: {
        lead_id: data.lead_id,
        imovel_id: data.imovel_id,
        status: {
          notIn: ['FECHADO', 'PERDIDO', 'CANCELADO'],
        },
      },
    })

    if (negociacaoExistente) {
      throw new AppError('Já existe uma negociação ativa para este lead e imóvel', 400)
    }

    return this.repository.create(data)
  }

  async findAll(filters: ListNegociacoesDTO) {
    return this.repository.findAll(filters)
  }

  async findById(id: string) {
    const negociacao = await this.repository.findById(id)
    if (!negociacao) {
      throw new AppError('Negociação não encontrada', 404)
    }
    return negociacao
  }

  async update(id: string, data: UpdateNegociacaoDTO) {
    await this.findById(id)
    return this.repository.update(id, data)
  }

  async changeStatus(id: string, data: ChangeStatusDTO, prisma: PrismaClient) {
    const negociacao = await this.findById(id)

    this.validateStatusTransition(negociacao.status, data.status)

    if (data.status === 'PERDIDO' && !data.motivo_perda) {
      throw new AppError('Motivo da perda é obrigatório', 400)
    }

    if (data.status === 'FECHADO') {
      const valor = data.valor_fechamento || negociacao.valor_proposta
      if (!valor) {
        throw new AppError('Valor de fechamento é obrigatório', 400)
      }

      const corretor = await prisma.corretor.findUnique({
        where: { id: negociacao.corretor_id },
      })

      if (corretor && corretor.comissao_padrao) {
        const valorComissao = (Number(valor) * Number(corretor.comissao_padrao)) / 100

        await this.repository.addComissao(id, {
          corretor_id: corretor.id,
          percentual: Number(corretor.comissao_padrao),
          valor: valorComissao,
          tipo: 'VENDA',
          observacoes: 'Comissão calculada automaticamente',
        })
      }

      const imovel = await prisma.imovel.findUnique({
        where: { id: negociacao.imovel_id },
      })

      if (imovel) {
        const novoStatus = imovel.categoria === 'VENDA' ? 'VENDIDO' : 'ALUGADO'
        await prisma.imovel.update({
          where: { id: negociacao.imovel_id },
          data: { status: novoStatus },
        })
      }
    }

    return this.repository.changeStatus(
      id,
      data.status,
      data.motivo_perda,
      data.valor_fechamento
    )
  }

  async addComissao(id: string, data: AddComissaoDTO, prisma: PrismaClient) {
    await this.findById(id)

    const corretor = await prisma.corretor.findUnique({
      where: { id: data.corretor_id },
    })
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404)
    }

    return this.repository.addComissao(id, data)
  }

  async addDocumento(id: string, data: AddDocumentoDTO) {
    await this.findById(id)
    return this.repository.addDocumento(id, data)
  }

  async delete(id: string, prisma: PrismaClient) {
    const negociacao = await this.findById(id)

    if (!['CONTATO', 'PERDIDO', 'CANCELADO'].includes(negociacao.status)) {
      throw new AppError(
        'Só é possível excluir negociações em status CONTATO, PERDIDO ou CANCELADO',
        400
      )
    }

    return this.repository.delete(id)
  }

  async getStats(filters?: {
    corretor_id?: string
    data_inicio?: Date
    data_fim?: Date
  }) {
    return this.repository.getStats(filters)
  }

  private validateStatusTransition(statusAtual: string, statusNovo: string) {
    const transicoesValidas: Record<string, string[]> = {
      CONTATO: ['VISITA_AGENDADA', 'PERDIDO', 'CANCELADO'],
      VISITA_AGENDADA: ['VISITA_REALIZADA', 'CONTATO', 'PERDIDO', 'CANCELADO'],
      VISITA_REALIZADA: ['PROPOSTA', 'CONTATO', 'PERDIDO', 'CANCELADO'],
      PROPOSTA: ['ANALISE_CREDITO', 'CONTRATO', 'VISITA_REALIZADA', 'PERDIDO', 'CANCELADO'],
      ANALISE_CREDITO: ['CONTRATO', 'PROPOSTA', 'PERDIDO', 'CANCELADO'],
      CONTRATO: ['FECHADO', 'PERDIDO', 'CANCELADO'],
      FECHADO: [],
      PERDIDO: [],
      CANCELADO: [],
    }

    if (!transicoesValidas[statusAtual]?.includes(statusNovo)) {
      throw new AppError(
        `Transição de ${statusAtual} para ${statusNovo} não é permitida`,
        400
      )
    }
  }
}
