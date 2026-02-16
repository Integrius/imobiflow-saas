import { prisma } from '../../shared/database/prisma.service'
import { mercadoPagoService, MP_PLANS } from '../../shared/services/mercadopago.service'
import { PlanoTenant } from '@prisma/client'

const PLAN_LIMITS: Record<string, { limite_usuarios: number; limite_imoveis: number; limite_storage_mb: number }> = {
  BASICO: { limite_usuarios: 3, limite_imoveis: 100, limite_storage_mb: 1000 },
  PRO: { limite_usuarios: 10, limite_imoveis: 500, limite_storage_mb: 5000 },
  ENTERPRISE: { limite_usuarios: 50, limite_imoveis: 5000, limite_storage_mb: 50000 },
}

export class PagamentosService {
  /**
   * Retorna os limites do plano baseado no tipo de plano.
   */
  private getPlanLimits(plano: PlanoTenant) {
    return PLAN_LIMITS[plano] || PLAN_LIMITS.BASICO
  }

  /**
   * Cria uma assinatura para o tenant.
   * Retorna a URL de checkout do Mercado Pago e o ID da assinatura interna.
   */
  async criarAssinatura(
    tenantId: string,
    plano: PlanoTenant,
    payerEmail: string,
  ): Promise<{ checkoutUrl: string; assinaturaId: string }> {
    // 1. Buscar tenant e validar status
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })

    if (!tenant) {
      throw new Error('Tenant nao encontrado.')
    }

    if (tenant.status !== 'TRIAL' && tenant.status !== 'ATIVO') {
      throw new Error(
        `Tenant com status "${tenant.status}" nao pode criar assinatura. Status permitidos: TRIAL, ATIVO.`,
      )
    }

    // 2. Verificar se ja existe assinatura ATIVA ou PENDENTE (evitar duplicatas)
    const assinaturaExistente = await prisma.assinatura.findFirst({
      where: {
        tenant_id: tenantId,
        status: { in: ['ATIVA', 'PENDENTE'] },
      },
    })

    if (assinaturaExistente) {
      throw new Error(
        `Ja existe uma assinatura ${assinaturaExistente.status} para este tenant. Cancele a assinatura atual antes de criar uma nova.`,
      )
    }

    // 3. Obter o ID do plano no Mercado Pago a partir de variavel de ambiente
    const mpPlanId = mercadoPagoService.getPlanId(plano)

    if (!mpPlanId) {
      throw new Error(
        `Plano "${plano}" nao configurado no Mercado Pago. Configure a variavel MERCADOPAGO_PLAN_${plano}.`,
      )
    }

    // 4. Obter pricing do plano
    const planConfig = MP_PLANS[plano as keyof typeof MP_PLANS]

    if (!planConfig) {
      throw new Error(`Configuracao de preco nao encontrada para o plano "${plano}".`)
    }

    // 5. Criar registro de Assinatura no banco com status PENDENTE
    const assinatura = await prisma.assinatura.create({
      data: {
        tenant_id: tenantId,
        plano,
        valor_mensal: planConfig.amount,
        status: 'PENDENTE',
        gateway: 'mercadopago',
        metodo_pagamento: null,
        historico: [
          {
            tipo: 'CRIACAO',
            data: new Date().toISOString(),
            descricao: `Assinatura criada para o plano ${plano}. Aguardando pagamento.`,
            plano,
            valor: planConfig.amount,
          },
        ],
        inicio: new Date(),
        periodicidade: 'MENSAL',
      },
    })

    // 6. Criar subscription no Mercado Pago para obter a URL de checkout
    const backUrl =
      process.env.MERCADOPAGO_BACK_URL || 'https://vivoly.integrius.com.br/dashboard/planos'

    const mpSubscription = await mercadoPagoService.createSubscription({
      planId: mpPlanId,
      payerEmail,
      externalReference: tenantId,
      backUrl,
    })

    // 7. Atualizar Assinatura com o gateway_id retornado pelo Mercado Pago
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: { gateway_id: mpSubscription.id },
    })

    // 8. Retornar URL de checkout e ID da assinatura interna
    return {
      checkoutUrl: mpSubscription.init_point,
      assinaturaId: assinatura.id,
    }
  }

  /**
   * Retorna a assinatura atual do tenant com informacoes combinadas.
   */
  async getAssinatura(tenantId: string): Promise<any> {
    // Buscar a assinatura mais recente do tenant
    const assinatura = await prisma.assinatura.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    })

    // Buscar informacoes do tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        nome: true,
        plano: true,
        status: true,
        limite_usuarios: true,
        limite_imoveis: true,
        limite_storage_mb: true,
        total_usuarios: true,
        total_imoveis: true,
        data_expiracao: true,
      },
    })

    if (!tenant) {
      throw new Error('Tenant nao encontrado.')
    }

    return {
      assinatura: assinatura || null,
      tenant: {
        id: tenant.id,
        nome: tenant.nome,
        plano: tenant.plano,
        status: tenant.status,
        limites: {
          usuarios: tenant.limite_usuarios,
          imoveis: tenant.limite_imoveis,
          storage_mb: tenant.limite_storage_mb,
        },
        uso: {
          usuarios: tenant.total_usuarios,
          imoveis: tenant.total_imoveis,
        },
        data_expiracao: tenant.data_expiracao,
      },
    }
  }

  /**
   * Cancela a assinatura ativa do tenant.
   */
  async cancelarAssinatura(tenantId: string, motivo: string): Promise<void> {
    // 1. Buscar assinatura ativa com gateway_id
    const assinatura = await prisma.assinatura.findFirst({
      where: {
        tenant_id: tenantId,
        status: 'ATIVA',
      },
    })

    if (!assinatura) {
      throw new Error('Nenhuma assinatura ativa encontrada para este tenant.')
    }

    // 2. Cancelar no Mercado Pago se gateway_id existir
    if (assinatura.gateway_id) {
      try {
        await mercadoPagoService.cancelSubscription(assinatura.gateway_id)
      } catch (err) {
        console.error(
          `Erro ao cancelar assinatura no Mercado Pago (gateway_id: ${assinatura.gateway_id}):`,
          err,
        )
        // Continua o cancelamento interno mesmo se falhar no gateway
      }
    }

    const agora = new Date()

    // 3. Atualizar Assinatura: status CANCELADA e fim = agora
    // 4. Push evento de cancelamento no historico[]
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: {
        status: 'CANCELADA',
        fim: agora,
        historico: {
          push: {
            tipo: 'CANCELAMENTO',
            data: agora.toISOString(),
            descricao: `Assinatura cancelada. Motivo: ${motivo}`,
            motivo,
          },
        },
      },
    })

    // 5. Atualizar status do Tenant para CANCELADO
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'CANCELADO' },
    })
  }

  /**
   * Processa webhook recebido do Mercado Pago.
   */
  async processarWebhook(type: string, dataId: string): Promise<void> {
    if (type === 'subscription_preapproval') {
      // 1. Buscar dados da subscription no Mercado Pago
      let mpSubscription: any
      try {
        mpSubscription = await mercadoPagoService.getSubscription(dataId)
      } catch (err) {
        console.error(`Erro ao buscar subscription ${dataId} no Mercado Pago:`, err)
        return
      }

      // 2. Buscar Assinatura pelo gateway_id
      const assinatura = await prisma.assinatura.findFirst({
        where: { gateway_id: dataId },
      })

      if (!assinatura) {
        console.warn(
          `Webhook subscription_preapproval: Assinatura com gateway_id "${dataId}" nao encontrada no banco.`,
        )
        return
      }

      // 3. Mapear status do Mercado Pago para status interno
      const statusMap: Record<string, string> = {
        authorized: 'ATIVA',
        pending: 'PENDENTE',
        paused: 'SUSPENSA',
        cancelled: 'CANCELADA',
      }

      const novoStatus = statusMap[mpSubscription.status] || 'PENDENTE'
      const agora = new Date()

      // 4. Atualizar Assinatura com novo status
      await prisma.assinatura.update({
        where: { id: assinatura.id },
        data: {
          status: novoStatus as any,
          metodo_pagamento: mpSubscription.payment_method_id || assinatura.metodo_pagamento,
          proxima_cobranca: mpSubscription.next_payment_date
            ? new Date(mpSubscription.next_payment_date)
            : assinatura.proxima_cobranca,
          historico: {
            push: {
              tipo: 'WEBHOOK_STATUS',
              data: agora.toISOString(),
              descricao: `Status atualizado via webhook: ${mpSubscription.status} -> ${novoStatus}`,
              mp_status: mpSubscription.status,
              status_interno: novoStatus,
            },
          },
        },
      })

      // 5. Atualizar Tenant conforme o novo status da assinatura
      if (novoStatus === 'ATIVA') {
        const limites = this.getPlanLimits(assinatura.plano)
        await prisma.tenant.update({
          where: { id: assinatura.tenant_id },
          data: {
            status: 'ATIVO',
            plano: assinatura.plano,
            data_expiracao: null,
            ...limites,
          },
        })
      } else if (novoStatus === 'SUSPENSA') {
        await prisma.tenant.update({
          where: { id: assinatura.tenant_id },
          data: { status: 'SUSPENSO' },
        })
      } else if (novoStatus === 'CANCELADA') {
        await prisma.tenant.update({
          where: { id: assinatura.tenant_id },
          data: { status: 'CANCELADO' },
        })
      }

      console.log(
        `Webhook processado: subscription_preapproval ${dataId} -> ${novoStatus} (tenant: ${assinatura.tenant_id})`,
      )
    } else if (type === 'payment') {
      // Buscar pagamento no MP (nao implementado completamente ainda, apenas log)
      console.log(`Webhook payment recebido: dataId=${dataId}. Processamento de pagamentos pendente.`)

      // Tentar encontrar assinatura associada pelo external_reference ou gateway_id
      // Por enquanto, apenas registrar no historico se encontrar a assinatura
      const assinatura = await prisma.assinatura.findFirst({
        where: { gateway_id: dataId },
      })

      if (assinatura) {
        const agora = new Date()
        await prisma.assinatura.update({
          where: { id: assinatura.id },
          data: {
            historico: {
              push: {
                tipo: 'PAYMENT_WEBHOOK',
                data: agora.toISOString(),
                descricao: `Evento de pagamento recebido (dataId: ${dataId}). Processamento detalhado pendente.`,
                payment_data_id: dataId,
              },
            },
          },
        })
      }
    } else {
      console.log(`Webhook tipo "${type}" recebido (dataId: ${dataId}). Nenhuma acao configurada.`)
    }
  }

  /**
   * Retorna o historico de eventos de pagamento do tenant.
   */
  async getHistorico(tenantId: string): Promise<any[]> {
    // Buscar todas as assinaturas do tenant
    const assinaturas = await prisma.assinatura.findMany({
      where: { tenant_id: tenantId },
      select: {
        id: true,
        plano: true,
        status: true,
        historico: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    })

    // Flatten historicos de todas as assinaturas e adicionar contexto
    const eventos: any[] = []

    for (const assinatura of assinaturas) {
      if (Array.isArray(assinatura.historico)) {
        for (const evento of assinatura.historico) {
          const eventoObj = typeof evento === 'object' && evento !== null ? evento : {}
          eventos.push({
            ...eventoObj,
            assinatura_id: assinatura.id,
            assinatura_plano: assinatura.plano,
            assinatura_status: assinatura.status,
          })
        }
      }
    }

    // Ordenar por data desc
    eventos.sort((a, b) => {
      const dataA = a.data ? new Date(a.data).getTime() : 0
      const dataB = b.data ? new Date(b.data).getTime() : 0
      return dataB - dataA
    })

    return eventos
  }
}
