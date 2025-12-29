import { prisma } from '../../shared/database/prisma';
import { StatusProposta } from '@prisma/client';

export class PropostasService {
  /**
   * Cria ou atualiza a proposta de um lead para um imóvel
   * Um lead só pode ter uma proposta ativa por imóvel
   */
  async createOrUpdate(data: {
    tenant_id: string;
    lead_id: string;
    imovel_id: string;
    corretor_id?: string;
    valor: number;
    observacoes?: string;
  }) {
    // Verificar se já existe proposta deste lead para este imóvel
    const existingProposta = await prisma.proposta.findUnique({
      where: {
        tenant_id_lead_id_imovel_id: {
          tenant_id: data.tenant_id,
          lead_id: data.lead_id,
          imovel_id: data.imovel_id,
        },
      },
    });

    if (existingProposta) {
      // Atualizar proposta existente
      return await prisma.proposta.update({
        where: {
          id: existingProposta.id,
        },
        data: {
          valor: data.valor,
          observacoes: data.observacoes,
          status: StatusProposta.PENDENTE, // Volta para pendente ao atualizar
          corretor_id: data.corretor_id,
          updated_at: new Date(),
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
              telefone: true,
              email: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
              codigo: true,
              preco: true,
              fotos: true,
            },
          },
          corretor: {
            select: {
              id: true,
              user: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Criar nova proposta
      return await prisma.proposta.create({
        data: {
          tenant_id: data.tenant_id,
          lead_id: data.lead_id,
          imovel_id: data.imovel_id,
          corretor_id: data.corretor_id,
          valor: data.valor,
          observacoes: data.observacoes,
          status: StatusProposta.PENDENTE,
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
              telefone: true,
              email: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
              codigo: true,
              preco: true,
              fotos: true,
            },
          },
          corretor: {
            select: {
              id: true,
              user: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }
  }

  /**
   * Busca a melhor oferta (maior valor) para um imóvel
   */
  async getBestOfferForImovel(tenant_id: string, imovel_id: string) {
    const bestOffer = await prisma.proposta.findFirst({
      where: {
        tenant_id,
        imovel_id,
        status: {
          in: [StatusProposta.PENDENTE, StatusProposta.CONTRA], // Apenas propostas ativas
        },
      },
      orderBy: {
        valor: 'desc', // Maior valor primeiro
      },
      include: {
        lead: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return bestOffer;
  }

  /**
   * Busca a proposta de um lead específico para um imóvel
   */
  async getUserOfferForImovel(tenant_id: string, lead_id: string, imovel_id: string) {
    return await prisma.proposta.findUnique({
      where: {
        tenant_id_lead_id_imovel_id: {
          tenant_id,
          lead_id,
          imovel_id,
        },
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            codigo: true,
            preco: true,
            fotos: true,
          },
        },
        corretor: {
          select: {
            id: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Lista todas as propostas de um imóvel
   */
  async listByImovel(tenant_id: string, imovel_id: string) {
    return await prisma.proposta.findMany({
      where: {
        tenant_id,
        imovel_id,
      },
      include: {
        lead: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            email: true,
          },
        },
        corretor: {
          select: {
            id: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        valor: 'desc',
      },
    });
  }

  /**
   * Lista todas as propostas de um lead
   */
  async listByLead(tenant_id: string, lead_id: string) {
    return await prisma.proposta.findMany({
      where: {
        tenant_id,
        lead_id,
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            codigo: true,
            preco: true,
            fotos: true,
          },
        },
        corretor: {
          select: {
            id: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Atualiza o status de uma proposta
   */
  async updateStatus(
    proposta_id: string,
    status: StatusProposta,
    resposta?: string,
    respondido_por_id?: string
  ) {
    return await prisma.proposta.update({
      where: {
        id: proposta_id,
      },
      data: {
        status,
        resposta,
        respondido_por_id,
        data_resposta: resposta ? new Date() : undefined,
      },
    });
  }

  /**
   * Cancela uma proposta
   */
  async cancel(proposta_id: string) {
    return await this.updateStatus(proposta_id, StatusProposta.CANCELADA);
  }

  /**
   * Aceita uma proposta
   */
  async accept(proposta_id: string, respondido_por_id: string, resposta?: string) {
    return await this.updateStatus(
      proposta_id,
      StatusProposta.ACEITA,
      resposta,
      respondido_por_id
    );
  }

  /**
   * Recusa uma proposta
   */
  async reject(proposta_id: string, respondido_por_id: string, resposta?: string) {
    return await this.updateStatus(
      proposta_id,
      StatusProposta.RECUSADA,
      resposta,
      respondido_por_id
    );
  }

  /**
   * Faz uma contraproposta
   */
  async counter(proposta_id: string, respondido_por_id: string, resposta: string) {
    return await this.updateStatus(
      proposta_id,
      StatusProposta.CONTRA,
      resposta,
      respondido_por_id
    );
  }
}

export const propostasService = new PropostasService();
