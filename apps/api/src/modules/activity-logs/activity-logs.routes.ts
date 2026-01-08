import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../shared/middlewares/permissions.middleware';
import { ActivityLogService } from '../../shared/services/activity-log.service';
import { TipoAtividade } from '@prisma/client';

export async function activityLogsRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/activity-logs
   * Lista logs de atividades do tenant
   * Apenas ADMIN pode acessar
   */
  server.get(
    '/',
    {
      preHandler: [authMiddleware, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const query = request.query as any;

        const params = {
          tenant_id: user.tenantId,
          user_id: query.user_id,
          tipo: query.tipo as TipoAtividade,
          entidade_tipo: query.entidade_tipo,
          entidade_id: query.entidade_id,
          data_inicio: query.data_inicio ? new Date(query.data_inicio) : undefined,
          data_fim: query.data_fim ? new Date(query.data_fim) : undefined,
          limit: query.limit ? parseInt(query.limit) : 50,
          offset: query.offset ? parseInt(query.offset) : 0,
        };

        const result = await ActivityLogService.findLogs(params);

        return reply.send({
          success: true,
          ...result,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar logs de atividades',
        });
      }
    }
  );

  /**
   * GET /api/v1/activity-logs/tipos
   * Lista tipos de atividades disponíveis
   * Apenas ADMIN pode acessar
   */
  server.get(
    '/tipos',
    {
      preHandler: [authMiddleware, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const tipos = Object.values(TipoAtividade);
      return reply.send({
        success: true,
        tipos,
      });
    }
  );

  /**
   * GET /api/v1/activity-logs/stats
   * Estatísticas de logs do tenant
   * Apenas ADMIN pode acessar
   */
  server.get(
    '/stats',
    {
      preHandler: [authMiddleware, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const query = request.query as any;

        const data_inicio = query.data_inicio ? new Date(query.data_inicio) : undefined;
        const data_fim = query.data_fim ? new Date(query.data_fim) : undefined;

        // Buscar logs agrupados por tipo
        const result = await ActivityLogService.findLogs({
          tenant_id: user.tenantId,
          data_inicio,
          data_fim,
          limit: 10000, // Buscar muitos para fazer estatísticas
        });

        // Agrupar por tipo
        const porTipo: Record<string, number> = {};
        result.logs.forEach((log: any) => {
          porTipo[log.tipo] = (porTipo[log.tipo] || 0) + 1;
        });

        // Últimas 24 horas
        const ultimas24h = result.logs.filter((log: any) => {
          const diff = Date.now() - new Date(log.created_at).getTime();
          return diff < 24 * 60 * 60 * 1000;
        }).length;

        // Últimos 7 dias
        const ultimos7dias = result.logs.filter((log: any) => {
          const diff = Date.now() - new Date(log.created_at).getTime();
          return diff < 7 * 24 * 60 * 60 * 1000;
        }).length;

        return reply.send({
          success: true,
          stats: {
            total: result.total,
            ultimas24h,
            ultimos7dias,
            porTipo,
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar estatísticas',
        });
      }
    }
  );
}
