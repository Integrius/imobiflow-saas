import { prisma } from '../../shared/database/prisma'
import { NotificationType } from '@prisma/client'

interface CreateNotificationParams {
  tenantId: string
  userId: string
  title: string
  message: string
  type?: NotificationType
  entityType?: string
  entityId?: string
  actionUrl?: string
}

interface CreateBulkNotificationParams {
  tenantId: string
  userIds: string[]
  title: string
  message: string
  type?: NotificationType
  entityType?: string
  entityId?: string
  actionUrl?: string
}

interface NotificationFilters {
  tenantId: string
  userId: string
  isRead?: boolean
  type?: NotificationType
  limit?: number
  offset?: number
}

class NotificationsService {
  /**
   * Criar uma notificação para um usuário específico
   */
  async create(params: CreateNotificationParams) {
    const notification = await prisma.notification.create({
      data: {
        tenant_id: params.tenantId,
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        entity_type: params.entityType,
        entity_id: params.entityId,
        action_url: params.actionUrl
      }
    })

    return notification
  }

  /**
   * Criar notificações para múltiplos usuários
   */
  async createBulk(params: CreateBulkNotificationParams) {
    const notifications = await prisma.notification.createMany({
      data: params.userIds.map(userId => ({
        tenant_id: params.tenantId,
        user_id: userId,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        entity_type: params.entityType,
        entity_id: params.entityId,
        action_url: params.actionUrl
      }))
    })

    return notifications
  }

  /**
   * Buscar notificações de um usuário
   */
  async getByUser(filters: NotificationFilters) {
    const where: any = {
      tenant_id: filters.tenantId,
      user_id: filters.userId
    }

    if (filters.isRead !== undefined) {
      where.is_read = filters.isRead
    }

    if (filters.type) {
      where.type = filters.type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          tenant_id: filters.tenantId,
          user_id: filters.userId,
          is_read: false
        }
      })
    ])

    return {
      notifications,
      total,
      unreadCount
    }
  }

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        is_read: false
      }
    })
  }

  /**
   * Marcar uma notificação como lida
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        user_id: userId
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    })

    return notification.count > 0
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(tenantId: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    })

    return result.count
  }

  /**
   * Deletar uma notificação
   */
  async delete(notificationId: string, userId: string) {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        user_id: userId
      }
    })

    return result.count > 0
  }

  /**
   * Deletar notificações antigas (mais de 30 dias)
   */
  async deleteOld(tenantId: string, daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notification.deleteMany({
      where: {
        tenant_id: tenantId,
        created_at: { lt: cutoffDate },
        is_read: true // Só deleta as já lidas
      }
    })

    return result.count
  }

  // =============================================
  // MÉTODOS DE NOTIFICAÇÃO ESPECÍFICOS
  // =============================================

  /**
   * Notificar sobre novo lead atribuído
   */
  async notifyNewLeadAssigned(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    leadId: string
  ) {
    return this.create({
      tenantId,
      userId: corretorUserId,
      title: '🎯 Novo Lead Atribuído',
      message: `O lead "${leadName}" foi atribuído a você. Entre em contato o quanto antes!`,
      type: 'LEAD',
      entityType: 'Lead',
      entityId: leadId,
      actionUrl: `/dashboard/leads?id=${leadId}`
    })
  }

  /**
   * Notificar sobre lead quente
   */
  async notifyHotLead(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    leadId: string
  ) {
    return this.create({
      tenantId,
      userId: corretorUserId,
      title: '🔥 Lead Quente!',
      message: `O lead "${leadName}" foi qualificado como QUENTE. Priorize o contato!`,
      type: 'LEAD',
      entityType: 'Lead',
      entityId: leadId,
      actionUrl: `/dashboard/leads?id=${leadId}`
    })
  }

  /**
   * Notificar sobre temperatura do lead alterada
   */
  async notifyLeadTemperatureChanged(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    leadId: string,
    oldTemp: string,
    newTemp: string
  ) {
    const emoji = newTemp === 'FRIO' ? '❄️' : newTemp === 'MORNO' ? '⚡' : '🔥'
    return this.create({
      tenantId,
      userId: corretorUserId,
      title: `${emoji} Temperatura Alterada`,
      message: `O lead "${leadName}" mudou de ${oldTemp} para ${newTemp}. Revise sua abordagem.`,
      type: 'LEAD',
      entityType: 'Lead',
      entityId: leadId,
      actionUrl: `/dashboard/leads?id=${leadId}`
    })
  }

  /**
   * Notificar sobre nova proposta
   */
  async notifyNewProposal(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    imovelTitulo: string,
    valor: number,
    propostaId: string
  ) {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)

    return this.create({
      tenantId,
      userId: corretorUserId,
      title: '💰 Nova Proposta Recebida',
      message: `${leadName} fez uma proposta de ${valorFormatado} para "${imovelTitulo}".`,
      type: 'PROPOSTA',
      entityType: 'Proposta',
      entityId: propostaId,
      actionUrl: `/dashboard/negociacoes`
    })
  }

  /**
   * Notificar sobre agendamento de visita
   */
  async notifyVisitScheduled(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    imovelTitulo: string,
    dataVisita: Date,
    agendamentoId: string
  ) {
    const dataFormatada = dataVisita.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    return this.create({
      tenantId,
      userId: corretorUserId,
      title: '📅 Nova Visita Agendada',
      message: `Visita com ${leadName} em "${imovelTitulo}" - ${dataFormatada}`,
      type: 'AGENDAMENTO',
      entityType: 'Agendamento',
      entityId: agendamentoId,
      actionUrl: `/dashboard/agendamentos`
    })
  }

  /**
   * Notificar sobre visita próxima (lembrete)
   */
  async notifyUpcomingVisit(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    imovelTitulo: string,
    horasRestantes: number,
    agendamentoId: string
  ) {
    return this.create({
      tenantId,
      userId: corretorUserId,
      title: `⏰ Visita em ${horasRestantes}h`,
      message: `Lembrete: Você tem uma visita com ${leadName} em "${imovelTitulo}" em ${horasRestantes} hora(s).`,
      type: 'AGENDAMENTO',
      entityType: 'Agendamento',
      entityId: agendamentoId,
      actionUrl: `/dashboard/agendamentos`
    })
  }

  /**
   * Notificar sobre meta atingida
   */
  async notifyGoalAchieved(
    tenantId: string,
    corretorUserId: string,
    metaTipo: string,
    mes: number,
    ano: number
  ) {
    const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    return this.create({
      tenantId,
      userId: corretorUserId,
      title: '🏆 Meta Atingida!',
      message: `Parabéns! Você atingiu sua meta de ${metaTipo} em ${meses[mes]}/${ano}!`,
      type: 'META',
      actionUrl: `/dashboard/metas`
    })
  }

  /**
   * Notificar sobre negociação fechada
   */
  async notifyDealClosed(
    tenantId: string,
    corretorUserId: string,
    leadName: string,
    imovelTitulo: string,
    valor: number,
    negociacaoId: string
  ) {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)

    return this.create({
      tenantId,
      userId: corretorUserId,
      title: '🎉 Negociação Fechada!',
      message: `Parabéns! A negociação com ${leadName} por "${imovelTitulo}" foi fechada por ${valorFormatado}!`,
      type: 'NEGOCIACAO',
      entityType: 'Negociacao',
      entityId: negociacaoId,
      actionUrl: `/dashboard/negociacoes`
    })
  }

  /**
   * Notificar mensagem do sistema para todos do tenant
   */
  async notifyAllUsers(
    tenantId: string,
    title: string,
    message: string,
    type: NotificationType = 'SISTEMA'
  ) {
    // Buscar todos os usuários ativos do tenant
    const users = await prisma.user.findMany({
      where: {
        tenant_id: tenantId,
        ativo: true
      },
      select: { id: true }
    })

    if (users.length === 0) return { count: 0 }

    return this.createBulk({
      tenantId,
      userIds: users.map(u => u.id),
      title,
      message,
      type
    })
  }

  /**
   * Notificar ADMIN/GESTOR sobre evento importante
   */
  async notifyManagers(
    tenantId: string,
    title: string,
    message: string,
    type: NotificationType = 'INFO'
  ) {
    // Buscar admins e gestores do tenant
    const managers = await prisma.user.findMany({
      where: {
        tenant_id: tenantId,
        ativo: true,
        tipo: { in: ['ADMIN', 'GESTOR'] }
      },
      select: { id: true }
    })

    if (managers.length === 0) return { count: 0 }

    return this.createBulk({
      tenantId,
      userIds: managers.map(u => u.id),
      title,
      message,
      type
    })
  }
}

export const notificationsService = new NotificationsService()
