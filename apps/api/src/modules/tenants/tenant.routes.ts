import { FastifyInstance } from 'fastify'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { prisma } from '../../shared/database/prisma.service'

export async function tenantRoutes(server: FastifyInstance) {
  // Endpoint para obter informações do trial
  server.get(
    '/trial-info',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = (request as any).tenantId

        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            status: true,
            data_expiracao: true,
            plano: true
          }
        })

        if (!tenant) {
          return reply.status(404).send({ error: 'Tenant não encontrado' })
        }

        // Se não está em trial, retornar sem informações
        if (tenant.status !== 'TRIAL') {
          return reply.send({
            isTrial: false,
            status: tenant.status,
            plano: tenant.plano
          })
        }

        // Calcular dias restantes
        const now = new Date()
        const expirationDate = tenant.data_expiracao ? new Date(tenant.data_expiracao) : null
        
        let diasRestantes = 0
        if (expirationDate) {
          const diffTime = expirationDate.getTime() - now.getTime()
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return reply.send({
          isTrial: true,
          status: tenant.status,
          plano: tenant.plano,
          data_expiracao: expirationDate,
          dias_restantes: diasRestantes > 0 ? diasRestantes : 0,
          expirado: diasRestantes <= 0
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar informações do trial')
        return reply.status(500).send({ error: 'Erro ao buscar informações do trial' })
      }
    }
  )
}
