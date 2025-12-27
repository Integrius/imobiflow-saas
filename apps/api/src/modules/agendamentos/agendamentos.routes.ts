/**
 * Rotas para gerenciamento de agendamentos de visitas
 *
 * Permite criar, listar, atualizar e cancelar agendamentos
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../../shared/database/prisma';
import { telegramService } from '../../shared/services/telegram.service';
import { sendGridService } from '../../shared/services/sendgrid.service';

interface CreateAgendamentoBody {
  lead_id: string;
  imovel_id: string;
  corretor_id: string;
  data_visita: string; // ISO 8601
  duracao_minutos?: number;
  tipo_visita?: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';
  observacoes?: string;
}

interface UpdateAgendamentoBody {
  data_visita?: string;
  duracao_minutos?: number;
  tipo_visita?: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';
  observacoes?: string;
  status?: 'PENDENTE' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO' | 'NAO_COMPARECEU';
}

interface ConfirmarAgendamentoBody {
  confirmado_por: 'LEAD' | 'CORRETOR';
}

interface CancelarAgendamentoBody {
  motivo_cancelamento: string;
  cancelado_por: string; // user_id
}

interface FeedbackAgendamentoBody {
  feedback_lead?: string;
  feedback_corretor?: string;
  nota_lead?: number; // 1-5
}

export async function agendamentosRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/agendamentos
   * Cria novo agendamento de visita
   */
  server.post<{ Body: CreateAgendamentoBody }>(
    '/',
    async (request, reply) => {
      try {
        const {
          lead_id,
          imovel_id,
          corretor_id,
          data_visita,
          duracao_minutos = 60,
          tipo_visita = 'PRESENCIAL',
          observacoes
        } = request.body;

        // Validações
        if (!lead_id || !imovel_id || !corretor_id || !data_visita) {
          return reply.status(400).send({
            error: 'Dados incompletos',
            message: 'lead_id, imovel_id, corretor_id e data_visita são obrigatórios'
          });
        }

        // Verificar se lead existe
        const lead = await prisma.lead.findUnique({
          where: { id: lead_id },
          include: { tenant: true }
        });

        if (!lead) {
          return reply.status(404).send({
            error: 'Lead não encontrado'
          });
        }

        // Verificar se imóvel existe
        const imovel = await prisma.imovel.findUnique({
          where: { id: imovel_id },
          include: { proprietario: true }
        });

        if (!imovel) {
          return reply.status(404).send({
            error: 'Imóvel não encontrado'
          });
        }

        // Verificar se corretor existe
        const corretor = await prisma.corretor.findUnique({
          where: { id: corretor_id },
          include: { user: true }
        });

        if (!corretor) {
          return reply.status(404).send({
            error: 'Corretor não encontrado'
          });
        }

        // Validar tenant_id
        if (lead.tenant_id !== imovel.tenant_id || lead.tenant_id !== corretor.tenant_id) {
          return reply.status(403).send({
            error: 'Tenant inválido',
            message: 'Lead, imóvel e corretor devem pertencer ao mesmo tenant'
          });
        }

        // Validar data futura
        const dataVisitaDate = new Date(data_visita);
        if (dataVisitaDate <= new Date()) {
          return reply.status(400).send({
            error: 'Data inválida',
            message: 'A data da visita deve ser futura'
          });
        }

        // Verificar disponibilidade do corretor
        const conflito = await prisma.agendamento.findFirst({
          where: {
            corretor_id,
            data_visita: {
              gte: new Date(dataVisitaDate.getTime() - 60 * 60 * 1000), // 1h antes
              lte: new Date(dataVisitaDate.getTime() + 60 * 60 * 1000)  // 1h depois
            },
            status: {
              in: ['PENDENTE', 'CONFIRMADO']
            }
          }
        });

        if (conflito) {
          return reply.status(409).send({
            error: 'Conflito de horário',
            message: 'Corretor já possui outro agendamento próximo a este horário'
          });
        }

        // Criar agendamento
        const agendamento = await prisma.agendamento.create({
          data: {
            tenant_id: lead.tenant_id,
            lead_id,
            imovel_id,
            corretor_id,
            data_visita: dataVisitaDate,
            duracao_minutos,
            tipo_visita,
            observacoes,
            timeline: [
              {
                evento: 'AGENDAMENTO_CRIADO',
                data: new Date().toISOString(),
                detalhes: {
                  tipo_visita,
                  data_visita: dataVisitaDate.toISOString()
                }
              }
            ]
          },
          include: {
            lead: true,
            imovel: true,
            corretor: {
              include: {
                user: true
              }
            }
          }
        });

        server.log.info(`✅ Agendamento criado: ${agendamento.id}`);

        // Enviar notificações (não bloquear response)
        Promise.all([
          // Email para o lead
          lead.email ? sendGridService.enviarConfirmacaoAgendamento({
            leadNome: lead.nome,
            leadEmail: lead.email,
            dataVisita: dataVisitaDate,
            imovelTitulo: imovel.titulo,
            corretorNome: corretor.user.nome,
            corretorTelefone: corretor.telefone,
            tipoVisita: tipo_visita
          }) : Promise.resolve(),

          // Telegram para o corretor
          corretor.telegram_chat_id ? telegramService.notificarNovoAgendamento(
            corretor.telegram_chat_id,
            {
              agendamentoId: agendamento.id,
              leadNome: lead.nome,
              leadTelefone: lead.telefone,
              imovelTitulo: imovel.titulo,
              imovelEndereco: (imovel.endereco as any).logradouro || 'Endereço não informado',
              dataVisita: dataVisitaDate,
              tipoVisita: tipo_visita,
              observacoes
            }
          ) : Promise.resolve()
        ]).catch(error => {
          server.log.error('Erro ao enviar notificações de agendamento:', error);
        });

        return {
          success: true,
          message: 'Agendamento criado com sucesso!',
          data: agendamento
        };
      } catch (error: any) {
        server.log.error('Erro ao criar agendamento:', error);
        return reply.status(500).send({
          error: 'Erro ao criar agendamento',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/agendamentos
   * Lista agendamentos com filtros
   */
  server.get<{
    Querystring: {
      tenant_id?: string;
      lead_id?: string;
      corretor_id?: string;
      imovel_id?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
    };
  }>('/', async (request, reply) => {
    try {
      const {
        tenant_id,
        lead_id,
        corretor_id,
        imovel_id,
        status,
        data_inicio,
        data_fim
      } = request.query;

      // Validar tenant_id obrigatório
      if (!tenant_id) {
        return reply.status(400).send({
          error: 'tenant_id é obrigatório'
        });
      }

      const where: any = {
        tenant_id
      };

      if (lead_id) where.lead_id = lead_id;
      if (corretor_id) where.corretor_id = corretor_id;
      if (imovel_id) where.imovel_id = imovel_id;
      if (status) where.status = status;

      if (data_inicio || data_fim) {
        where.data_visita = {};
        if (data_inicio) where.data_visita.gte = new Date(data_inicio);
        if (data_fim) where.data_visita.lte = new Date(data_fim);
      }

      const agendamentos = await prisma.agendamento.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
              telefone: true,
              email: true
            }
          },
          imovel: {
            select: {
              id: true,
              codigo: true,
              titulo: true,
              endereco: true,
              tipo: true
            }
          },
          corretor: {
            include: {
              user: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          data_visita: 'asc'
        }
      });

      return {
        success: true,
        total: agendamentos.length,
        data: agendamentos
      };
    } catch (error: any) {
      server.log.error('Erro ao listar agendamentos:', error);
      return reply.status(500).send({
        error: 'Erro ao listar agendamentos',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/agendamentos/:id
   * Busca agendamento por ID
   */
  server.get<{
    Params: { id: string };
  }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const agendamento = await prisma.agendamento.findUnique({
        where: { id },
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: {
              user: true
            }
          }
        }
      });

      if (!agendamento) {
        return reply.status(404).send({
          error: 'Agendamento não encontrado'
        });
      }

      return {
        success: true,
        data: agendamento
      };
    } catch (error: any) {
      server.log.error('Erro ao buscar agendamento:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar agendamento',
        message: error.message
      });
    }
  });

  /**
   * PATCH /api/v1/agendamentos/:id
   * Atualiza agendamento
   */
  server.patch<{
    Params: { id: string };
    Body: UpdateAgendamentoBody;
  }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Verificar se agendamento existe
      const agendamentoExistente = await prisma.agendamento.findUnique({
        where: { id }
      });

      if (!agendamentoExistente) {
        return reply.status(404).send({
          error: 'Agendamento não encontrado'
        });
      }

      // Não permitir alterar agendamentos já realizados ou cancelados
      if (['REALIZADO', 'CANCELADO'].includes(agendamentoExistente.status)) {
        return reply.status(400).send({
          error: 'Agendamento não pode ser alterado',
          message: 'Agendamentos realizados ou cancelados não podem ser alterados'
        });
      }

      // Validar nova data se fornecida
      if (updateData.data_visita) {
        const novaData = new Date(updateData.data_visita);
        if (novaData <= new Date()) {
          return reply.status(400).send({
            error: 'Data inválida',
            message: 'A data da visita deve ser futura'
          });
        }
      }

      // Atualizar agendamento
      const agendamento = await prisma.agendamento.update({
        where: { id },
        data: {
          ...updateData,
          data_visita: updateData.data_visita ? new Date(updateData.data_visita) : undefined,
          timeline: {
            push: JSON.parse(JSON.stringify({
              evento: 'AGENDAMENTO_ATUALIZADO',
              data: new Date().toISOString(),
              detalhes: updateData
            }))
          }
        },
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: {
              user: true
            }
          }
        }
      });

      server.log.info(`✅ Agendamento atualizado: ${id}`);

      return {
        success: true,
        message: 'Agendamento atualizado com sucesso!',
        data: agendamento
      };
    } catch (error: any) {
      server.log.error('Erro ao atualizar agendamento:', error);
      return reply.status(500).send({
        error: 'Erro ao atualizar agendamento',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/agendamentos/:id/confirmar
   * Confirma agendamento (lead ou corretor)
   */
  server.post<{
    Params: { id: string };
    Body: ConfirmarAgendamentoBody;
  }>('/:id/confirmar', async (request, reply) => {
    try {
      const { id } = request.params;
      const { confirmado_por } = request.body;

      const agendamento = await prisma.agendamento.findUnique({
        where: { id },
        include: {
          lead: true,
          corretor: {
            include: { user: true }
          }
        }
      });

      if (!agendamento) {
        return reply.status(404).send({
          error: 'Agendamento não encontrado'
        });
      }

      if (agendamento.status !== 'PENDENTE') {
        return reply.status(400).send({
          error: 'Agendamento não pode ser confirmado',
          message: `Status atual: ${agendamento.status}`
        });
      }

      const updateData: any = {
        timeline: {
          push: {
            evento: `CONFIRMADO_POR_${confirmado_por}`,
            data: new Date().toISOString()
          }
        }
      };

      if (confirmado_por === 'LEAD') {
        updateData.confirmado_lead = true;
      } else if (confirmado_por === 'CORRETOR') {
        updateData.confirmado_corretor = true;
      }

      // Se ambos confirmaram, mudar status
      const ambosConfirmaram =
        (confirmado_por === 'LEAD' && agendamento.confirmado_corretor) ||
        (confirmado_por === 'CORRETOR' && agendamento.confirmado_lead);

      if (ambosConfirmaram) {
        updateData.status = 'CONFIRMADO';
        updateData.data_confirmacao = new Date();
      }

      const agendamentoAtualizado = await prisma.agendamento.update({
        where: { id },
        data: updateData,
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: { user: true }
          }
        }
      });

      server.log.info(`✅ Agendamento confirmado por ${confirmado_por}: ${id}`);

      return {
        success: true,
        message: `Agendamento confirmado por ${confirmado_por.toLowerCase()}!`,
        data: agendamentoAtualizado
      };
    } catch (error: any) {
      server.log.error('Erro ao confirmar agendamento:', error);
      return reply.status(500).send({
        error: 'Erro ao confirmar agendamento',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/agendamentos/:id/cancelar
   * Cancela agendamento
   */
  server.post<{
    Params: { id: string };
    Body: CancelarAgendamentoBody;
  }>('/:id/cancelar', async (request, reply) => {
    try {
      const { id } = request.params;
      const { motivo_cancelamento, cancelado_por } = request.body;

      if (!motivo_cancelamento) {
        return reply.status(400).send({
          error: 'Motivo de cancelamento é obrigatório'
        });
      }

      const agendamento = await prisma.agendamento.findUnique({
        where: { id }
      });

      if (!agendamento) {
        return reply.status(404).send({
          error: 'Agendamento não encontrado'
        });
      }

      if (agendamento.status === 'CANCELADO') {
        return reply.status(400).send({
          error: 'Agendamento já está cancelado'
        });
      }

      if (agendamento.status === 'REALIZADO') {
        return reply.status(400).send({
          error: 'Agendamento já foi realizado e não pode ser cancelado'
        });
      }

      const agendamentoAtualizado = await prisma.agendamento.update({
        where: { id },
        data: {
          status: 'CANCELADO',
          motivo_cancelamento,
          cancelado_por,
          data_cancelamento: new Date(),
          timeline: {
            push: {
              evento: 'AGENDAMENTO_CANCELADO',
              data: new Date().toISOString(),
              detalhes: {
                motivo: motivo_cancelamento,
                cancelado_por
              }
            }
          }
        },
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: { user: true }
          }
        }
      });

      server.log.info(`✅ Agendamento cancelado: ${id}`);

      return {
        success: true,
        message: 'Agendamento cancelado com sucesso!',
        data: agendamentoAtualizado
      };
    } catch (error: any) {
      server.log.error('Erro ao cancelar agendamento:', error);
      return reply.status(500).send({
        error: 'Erro ao cancelar agendamento',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/agendamentos/:id/realizar
   * Marca agendamento como realizado
   */
  server.post<{
    Params: { id: string };
  }>('/:id/realizar', async (request, reply) => {
    try {
      const { id } = request.params;

      const agendamento = await prisma.agendamento.findUnique({
        where: { id }
      });

      if (!agendamento) {
        return reply.status(404).send({
          error: 'Agendamento não encontrado'
        });
      }

      if (agendamento.status !== 'CONFIRMADO') {
        return reply.status(400).send({
          error: 'Apenas agendamentos confirmados podem ser marcados como realizados'
        });
      }

      const agendamentoAtualizado = await prisma.agendamento.update({
        where: { id },
        data: {
          status: 'REALIZADO',
          realizado: true,
          data_realizacao: new Date(),
          timeline: {
            push: {
              evento: 'VISITA_REALIZADA',
              data: new Date().toISOString()
            }
          }
        },
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: { user: true }
          }
        }
      });

      server.log.info(`✅ Agendamento marcado como realizado: ${id}`);

      return {
        success: true,
        message: 'Agendamento marcado como realizado!',
        data: agendamentoAtualizado
      };
    } catch (error: any) {
      server.log.error('Erro ao marcar agendamento como realizado:', error);
      return reply.status(500).send({
        error: 'Erro ao marcar agendamento como realizado',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/agendamentos/:id/feedback
   * Adiciona feedback ao agendamento realizado
   */
  server.post<{
    Params: { id: string };
    Body: FeedbackAgendamentoBody;
  }>('/:id/feedback', async (request, reply) => {
    try {
      const { id } = request.params;
      const { feedback_lead, feedback_corretor, nota_lead } = request.body;

      const agendamento = await prisma.agendamento.findUnique({
        where: { id }
      });

      if (!agendamento) {
        return reply.status(404).send({
          error: 'Agendamento não encontrado'
        });
      }

      if (agendamento.status !== 'REALIZADO') {
        return reply.status(400).send({
          error: 'Apenas agendamentos realizados podem receber feedback'
        });
      }

      // Validar nota se fornecida
      if (nota_lead !== undefined && (nota_lead < 1 || nota_lead > 5)) {
        return reply.status(400).send({
          error: 'Nota inválida',
          message: 'A nota deve ser entre 1 e 5'
        });
      }

      const agendamentoAtualizado = await prisma.agendamento.update({
        where: { id },
        data: {
          feedback_lead,
          feedback_corretor,
          nota_lead,
          timeline: {
            push: {
              evento: 'FEEDBACK_ADICIONADO',
              data: new Date().toISOString(),
              detalhes: {
                nota_lead
              }
            }
          }
        },
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: { user: true }
          }
        }
      });

      server.log.info(`✅ Feedback adicionado ao agendamento: ${id}`);

      return {
        success: true,
        message: 'Feedback registrado com sucesso!',
        data: agendamentoAtualizado
      };
    } catch (error: any) {
      server.log.error('Erro ao adicionar feedback:', error);
      return reply.status(500).send({
        error: 'Erro ao adicionar feedback',
        message: error.message
      });
    }
  });
}
