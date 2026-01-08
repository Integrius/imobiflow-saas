import { PrismaClient, TipoAtividade } from '@prisma/client';
import { FastifyRequest } from 'fastify';

const prisma = new PrismaClient();

interface CreateActivityLogParams {
  tenant_id: string;
  user_id?: string;
  tipo: TipoAtividade;
  acao: string;
  detalhes?: any; // Objeto JSON com informações adicionais (sem dados sensíveis)
  entidade_tipo?: string;
  entidade_id?: string;
  request?: FastifyRequest; // Para capturar IP e User-Agent
}

export class ActivityLogService {
  /**
   * Registra uma atividade no log
   * IMPORTANTE: NÃO registre dados sensíveis (senhas, tokens, dados pessoais completos)
   */
  static async log(params: CreateActivityLogParams) {
    try {
      const {
        tenant_id,
        user_id,
        tipo,
        acao,
        detalhes,
        entidade_tipo,
        entidade_id,
        request,
      } = params;

      // Extrair IP e User-Agent do request (se fornecido)
      let ip_address: string | undefined;
      let user_agent: string | undefined;

      if (request) {
        // IP pode vir de diferentes headers dependendo do proxy
        ip_address =
          (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          (request.headers['x-real-ip'] as string) ||
          request.ip ||
          undefined;

        user_agent = request.headers['user-agent'] || undefined;
      }

      // Sanitizar detalhes para remover dados sensíveis
      const detalhesSanitizados = this.sanitizeDetails(detalhes);

      await prisma.activityLog.create({
        data: {
          tenant_id,
          user_id,
          tipo,
          acao,
          detalhes: detalhesSanitizados,
          ip_address,
          user_agent,
          entidade_tipo,
          entidade_id,
        },
      });

      console.log(`📋 Log registrado: [${tipo}] ${acao}`);
    } catch (error) {
      // Não falhar a operação principal se o log falhar
      console.error('❌ Erro ao registrar log de atividade:', error);
    }
  }

  /**
   * Remove campos sensíveis dos detalhes antes de salvar
   * LGPD Compliance: Não armazenar senhas, tokens, CPF completo, etc.
   */
  private static sanitizeDetails(detalhes: any): any {
    if (!detalhes) return null;

    const sanitized = { ...detalhes };

    // Lista de campos sensíveis que NÃO devem ser logados
    const camposSensiveis = [
      'senha',
      'password',
      'senha_hash',
      'token',
      'access_token',
      'refresh_token',
      'cpf', // Pode logar apenas últimos 3 dígitos se necessário
      'rg',
      'cartao',
      'card_number',
      'cvv',
      'senha_antiga',
      'senha_nova',
    ];

    // Remover campos sensíveis
    camposSensiveis.forEach((campo) => {
      if (sanitized[campo]) {
        delete sanitized[campo];
      }
    });

    // Se tiver email, pode manter (não é tão sensível)
    // Se tiver nome, pode manter
    // Se tiver telefone, pode mascarar parcialmente (opcional)

    return sanitized;
  }

  /**
   * Buscar logs de atividades com filtros
   */
  static async findLogs(params: {
    tenant_id: string;
    user_id?: string;
    tipo?: TipoAtividade;
    entidade_tipo?: string;
    entidade_id?: string;
    data_inicio?: Date;
    data_fim?: Date;
    limit?: number;
    offset?: number;
  }) {
    const {
      tenant_id,
      user_id,
      tipo,
      entidade_tipo,
      entidade_id,
      data_inicio,
      data_fim,
      limit = 50,
      offset = 0,
    } = params;

    const where: any = { tenant_id };

    if (user_id) where.user_id = user_id;
    if (tipo) where.tipo = tipo;
    if (entidade_tipo) where.entidade_tipo = entidade_tipo;
    if (entidade_id) where.entidade_id = entidade_id;

    if (data_inicio || data_fim) {
      where.created_at = {};
      if (data_inicio) where.created_at.gte = data_inicio;
      if (data_fim) where.created_at.lte = data_fim;
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }

  /**
   * Helpers para logs comuns
   */
  static async logLogin(tenant_id: string, user_id: string, request: FastifyRequest, sucesso: boolean = true) {
    await this.log({
      tenant_id,
      user_id,
      tipo: sucesso ? TipoAtividade.LOGIN : TipoAtividade.LOGIN_FALHOU,
      acao: sucesso ? 'Login realizado com sucesso' : 'Tentativa de login falhou',
      request,
    });
  }

  static async logLogout(tenant_id: string, user_id: string, request?: FastifyRequest) {
    await this.log({
      tenant_id,
      user_id,
      tipo: TipoAtividade.LOGOUT,
      acao: 'Logout realizado',
      request,
    });
  }

  static async logSenhaAlterada(tenant_id: string, user_id: string, alteradoPor?: string, request?: FastifyRequest) {
    await this.log({
      tenant_id,
      user_id,
      tipo: TipoAtividade.SENHA_ALTERADA,
      acao: alteradoPor
        ? `Senha alterada por ${alteradoPor}`
        : 'Senha alterada pelo próprio usuário',
      entidade_tipo: 'User',
      entidade_id: user_id,
      request,
    });
  }

  static async logTenantCriado(tenant_id: string, request?: FastifyRequest) {
    await this.log({
      tenant_id,
      tipo: TipoAtividade.TENANT_CRIADO,
      acao: 'Tenant criado - Período de trial iniciado',
      entidade_tipo: 'Tenant',
      entidade_id: tenant_id,
      request,
    });
  }

  static async logTenantCancelado(tenant_id: string, user_id?: string, motivo?: string, request?: FastifyRequest) {
    await this.log({
      tenant_id,
      user_id,
      tipo: TipoAtividade.TENANT_CANCELADO,
      acao: 'Tenant cancelado',
      detalhes: { motivo },
      entidade_tipo: 'Tenant',
      entidade_id: tenant_id,
      request,
    });
  }

  static async logPagamento(
    tenant_id: string,
    sucesso: boolean,
    valor?: number,
    metodo?: string,
    request?: FastifyRequest
  ) {
    await this.log({
      tenant_id,
      tipo: sucesso ? TipoAtividade.PAGAMENTO_REALIZADO : TipoAtividade.PAGAMENTO_FALHOU,
      acao: sucesso ? 'Pagamento realizado com sucesso' : 'Falha no pagamento',
      detalhes: {
        valor,
        metodo,
        // NÃO logar dados do cartão ou informações sensíveis de pagamento
      },
      request,
    });
  }

  static async logUsuarioCriado(
    tenant_id: string,
    novo_user_id: string,
    criado_por_id: string,
    request?: FastifyRequest
  ) {
    await this.log({
      tenant_id,
      user_id: criado_por_id,
      tipo: TipoAtividade.USUARIO_CRIADO,
      acao: 'Novo usuário criado',
      entidade_tipo: 'User',
      entidade_id: novo_user_id,
      request,
    });
  }

  static async logUsuarioDesativado(
    tenant_id: string,
    user_id: string,
    desativado_por_id: string,
    request?: FastifyRequest
  ) {
    await this.log({
      tenant_id,
      user_id: desativado_por_id,
      tipo: TipoAtividade.USUARIO_DESATIVADO,
      acao: 'Usuário desativado',
      entidade_tipo: 'User',
      entidade_id: user_id,
      request,
    });
  }

  static async logExportacaoDados(tenant_id: string, user_id: string, request?: FastifyRequest) {
    await this.log({
      tenant_id,
      user_id,
      tipo: TipoAtividade.TENANT_EXPORTACAO_DADOS,
      acao: 'Exportação de dados realizada',
      entidade_tipo: 'Tenant',
      entidade_id: tenant_id,
      request,
    });
  }
}
