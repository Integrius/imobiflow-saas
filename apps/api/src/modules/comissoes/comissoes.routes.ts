import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

const prisma = new PrismaClient();

export async function comissoesRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/comissoes/calcular
   * Calcula comissões de corretores selecionados baseado em negociações FECHADAS
   */
  server.post(
    '/calcular',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = (request as any).tenantId;
        const { corretor_ids } = request.body as { corretor_ids: string[] };

        if (!corretor_ids || !Array.isArray(corretor_ids) || corretor_ids.length === 0) {
          throw new AppError('É necessário selecionar pelo menos um corretor', 400);
        }

        // Buscar negociações FECHADAS dos corretores selecionados
        const negociacoes = await prisma.negociacao.findMany({
          where: {
            tenant_id: tenantId,
            corretor_id: {
              in: corretor_ids
            },
            status: 'FECHADO',
            data_fechamento: {
              not: null
            }
          },
          include: {
            corretor: {
              include: {
                user: true
              }
            },
            lead: true,
            imovel: true
          },
          orderBy: {
            data_fechamento: 'desc'
          }
        });

        // Agrupar por corretor e calcular comissões
        const comissoesPorCorretor: Record<string, {
          corretor_id: string;
          corretor_nome: string;
          corretor_email: string;
          total_vendas: number;
          total_comissao: number;
          negociacoes: Array<{
            id: string;
            codigo: string;
            lead_nome: string;
            imovel_titulo: string;
            valor_final: number;
            valor_comissao: number;
            data_fechamento: Date;
          }>;
        }> = {};

        for (const negociacao of negociacoes) {
          const corretorId = negociacao.corretor_id;

          // Inicializar se não existe
          if (!comissoesPorCorretor[corretorId]) {
            comissoesPorCorretor[corretorId] = {
              corretor_id: corretorId,
              corretor_nome: negociacao.corretor.user.nome,
              corretor_email: negociacao.corretor.user.email,
              total_vendas: 0,
              total_comissao: 0,
              negociacoes: []
            };
          }

          // Calcular valores
          const valorFinal = negociacao.valor_final ? Number(negociacao.valor_final) : 0;
          const valorComissao = negociacao.valor_comissao ? Number(negociacao.valor_comissao) : 0;

          // Se valor_comissao estiver vazio, calcular 5% do valor final
          const comissaoCalculada = valorComissao > 0 ? valorComissao : valorFinal * 0.05;

          comissoesPorCorretor[corretorId].total_vendas += valorFinal;
          comissoesPorCorretor[corretorId].total_comissao += comissaoCalculada;

          comissoesPorCorretor[corretorId].negociacoes.push({
            id: negociacao.id,
            codigo: negociacao.codigo,
            lead_nome: negociacao.lead.nome,
            imovel_titulo: negociacao.imovel.titulo,
            valor_final: valorFinal,
            valor_comissao: comissaoCalculada,
            data_fechamento: negociacao.data_fechamento!
          });
        }

        // Converter para array e ordenar por total de comissões
        const resultado = Object.values(comissoesPorCorretor).sort(
          (a, b) => b.total_comissao - a.total_comissao
        );

        return reply.send({
          success: true,
          total_corretores: resultado.length,
          total_negociacoes: negociacoes.length,
          comissoes: resultado
        });
      } catch (error: any) {
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao calcular comissões'
        });
      }
    }
  );
}
