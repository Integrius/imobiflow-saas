import { FastifyInstance } from 'fastify'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { DataExportService } from '../../shared/services/data-export.service'
import { sendgridService } from '../../shared/services/sendgrid.service'
import { prisma } from '../../shared/database/prisma.service'

export async function dataExportRoutes(server: FastifyInstance) {
  /**
   * Verifica se pode exibir botão de exportação (últimos 5 dias)
   */
  server.get(
    '/export/can-export',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = (request as any).tenantId

        const canExport = await DataExportService.isInLast5Days(tenantId)
        const hasExported = await DataExportService.hasExported(tenantId)

        return reply.send({
          canExport,
          hasExported,
          showButton: canExport && !hasExported,
          showMessage: canExport && hasExported
        })
      } catch (error) {
        server.log.error('Erro ao verificar exportação:', error)
        return reply.status(500).send({ error: 'Erro ao verificar exportação' })
      }
    }
  )

  /**
   * Exporta dados do tenant e envia por email
   */
  server.post(
    '/export/data',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = (request as any).tenantId
        const userId = (request as any).userId

        // Verificar se está nos últimos 5 dias
        const canExport = await DataExportService.isInLast5Days(tenantId)
        if (!canExport) {
          return reply.status(403).send({
            error: 'Exportação disponível apenas nos últimos 5 dias do período trial'
          })
        }

        // Verificar se já exportou
        const hasExported = await DataExportService.hasExported(tenantId)
        if (hasExported) {
          return reply.status(400).send({
            error: 'Dados já foram exportados anteriormente'
          })
        }

        // Buscar dados do tenant e usuário
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { nome: true, email: true, data_expiracao: true }
        })

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { nome: true, email: true }
        })

        if (!tenant || !user) {
          return reply.status(404).send({ error: 'Tenant ou usuário não encontrado' })
        }

        // Exportar dados
        server.log.info(`Iniciando exportação de dados para tenant ${tenantId}`)
        const exportData = await DataExportService.exportTenantData(tenantId)

        // Preparar anexos para email
        const attachments = []

        if (exportData.leads.totalRecords > 0) {
          attachments.push({
            content: Buffer.from(exportData.leads.csvContent).toString('base64'),
            filename: exportData.leads.fileName,
            type: 'text/csv',
            disposition: 'attachment'
          })
        }

        if (exportData.imoveis.totalRecords > 0) {
          attachments.push({
            content: Buffer.from(exportData.imoveis.csvContent).toString('base64'),
            filename: exportData.imoveis.fileName,
            type: 'text/csv',
            disposition: 'attachment'
          })
        }

        if (exportData.proprietarios.totalRecords > 0) {
          attachments.push({
            content: Buffer.from(exportData.proprietarios.csvContent).toString('base64'),
            filename: exportData.proprietarios.fileName,
            type: 'text/csv',
            disposition: 'attachment'
          })
        }

        if (exportData.negociacoes.totalRecords > 0) {
          attachments.push({
            content: Buffer.from(exportData.negociacoes.csvContent).toString('base64'),
            filename: exportData.negociacoes.fileName,
            type: 'text/csv',
            disposition: 'attachment'
          })
        }

        if (exportData.agendamentos.totalRecords > 0) {
          attachments.push({
            content: Buffer.from(exportData.agendamentos.csvContent).toString('base64'),
            filename: exportData.agendamentos.fileName,
            type: 'text/csv',
            disposition: 'attachment'
          })
        }

        // Calcular dias restantes
        const diasRestantes = tenant.data_expiracao
          ? Math.ceil((new Date(tenant.data_expiracao).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0

        // Enviar email com anexos
        await sendgridService.sendDataExportEmail(
          user.email,
          user.nome,
          tenant.nome,
          {
            leads: exportData.leads.totalRecords,
            imoveis: exportData.imoveis.totalRecords,
            proprietarios: exportData.proprietarios.totalRecords,
            negociacoes: exportData.negociacoes.totalRecords,
            agendamentos: exportData.agendamentos.totalRecords
          },
          diasRestantes,
          attachments
        )

        // Marcar como exportado
        await DataExportService.markAsExported(tenantId)

        server.log.info(`Exportação concluída para tenant ${tenantId}`)

        return reply.send({
          success: true,
          message: 'Dados exportados e enviados por email com sucesso',
          stats: {
            leads: exportData.leads.totalRecords,
            imoveis: exportData.imoveis.totalRecords,
            proprietarios: exportData.proprietarios.totalRecords,
            negociacoes: exportData.negociacoes.totalRecords,
            agendamentos: exportData.agendamentos.totalRecords
          }
        })
      } catch (error) {
        server.log.error('Erro ao exportar dados:', error)
        return reply.status(500).send({ error: 'Erro ao exportar dados' })
      }
    }
  )
}
