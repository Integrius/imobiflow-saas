import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { pdfReportService } from './pdf.service'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { requireManager } from '../../shared/middlewares/permissions.middleware'

const leadsReportQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  corretor_id: z.string().uuid().optional()
})

const corretorReportQuerySchema = z.object({
  corretor_id: z.string().uuid(),
  mes: z.string().transform(v => parseInt(v)),
  ano: z.string().transform(v => parseInt(v))
})

const tenantReportQuerySchema = z.object({
  mes: z.string().transform(v => parseInt(v)),
  ano: z.string().transform(v => parseInt(v))
})

export async function reportsRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/reports/leads
   * Gera relatório de leads em PDF
   */
  server.get(
    '/leads',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const query = leadsReportQuerySchema.parse(request.query)

        const filters = {
          tenantId,
          startDate: query.start_date ? new Date(query.start_date) : undefined,
          endDate: query.end_date ? new Date(query.end_date) : undefined,
          corretorId: query.corretor_id
        }

        const pdfBuffer = await pdfReportService.generateLeadsReport(filters)

        reply.header('Content-Type', 'application/pdf')
        reply.header('Content-Disposition', `attachment; filename="relatorio-leads-${Date.now()}.pdf"`)

        return reply.send(pdfBuffer)
      } catch (error: any) {
        console.error('Erro ao gerar relatório de leads:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao gerar relatório'
        })
      }
    }
  )

  /**
   * GET /api/v1/reports/corretor
   * Gera relatório de desempenho do corretor em PDF
   */
  server.get(
    '/corretor',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id
        const userType = request.user!.tipo
        const query = corretorReportQuerySchema.parse(request.query)

        // Corretor só pode gerar relatório de si mesmo
        if (userType === 'CORRETOR') {
          // Buscar corretor_id do usuário
          const { prisma } = await import('../../shared/database/prisma')
          const corretor = await prisma.corretor.findUnique({
            where: { user_id: userId }
          })

          if (!corretor || corretor.id !== query.corretor_id) {
            return reply.status(403).send({
              success: false,
              error: 'Você só pode gerar relatório do seu próprio desempenho'
            })
          }
        }

        const pdfBuffer = await pdfReportService.generateCorretorReport(
          tenantId,
          query.corretor_id,
          query.mes,
          query.ano
        )

        reply.header('Content-Type', 'application/pdf')
        reply.header('Content-Disposition', `attachment; filename="relatorio-corretor-${query.mes}-${query.ano}.pdf"`)

        return reply.send(pdfBuffer)
      } catch (error: any) {
        console.error('Erro ao gerar relatório do corretor:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao gerar relatório'
        })
      }
    }
  )

  /**
   * GET /api/v1/reports/tenant
   * Gera relatório mensal geral do tenant em PDF
   */
  server.get(
    '/tenant',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const query = tenantReportQuerySchema.parse(request.query)

        const pdfBuffer = await pdfReportService.generateTenantReport(
          tenantId,
          query.mes,
          query.ano
        )

        reply.header('Content-Type', 'application/pdf')
        reply.header('Content-Disposition', `attachment; filename="relatorio-mensal-${query.mes}-${query.ano}.pdf"`)

        return reply.send(pdfBuffer)
      } catch (error: any) {
        console.error('Erro ao gerar relatório do tenant:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao gerar relatório'
        })
      }
    }
  )
}
