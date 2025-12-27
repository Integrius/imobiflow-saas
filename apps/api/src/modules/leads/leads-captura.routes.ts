/**
 * Rota pública de captura de leads via landing page
 *
 * Endpoint sem autenticação para receber leads da página de captura
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient, TipoNegocio, TipoImovel } from '@prisma/client';
import { ibgeService } from '../../shared/services/ibge.service';
import { sendGridService } from '../../shared/services/sendgrid.service';
import { leadQualificationService } from '../../ai/services/lead-qualification.service';

const prisma = new PrismaClient();

interface CapturaLeadBody {
  // Tenant (obrigatório via subdomínio ou domínio customizado)
  tenant_slug?: string;

  // Dados pessoais
  nome: string;
  telefone: string;
  email: string;

  // Tipo de negócio e imóvel
  tipo_negocio: TipoNegocio;
  tipo_imovel_desejado: TipoImovel;

  // Valores
  valor_minimo?: number;
  valor_maximo?: number;

  // Localização
  estado: string;
  municipio: string;
  bairro?: string;
  complemento_localizacao?: string;

  // Características
  quartos_min?: number;
  quartos_max?: number;
  vagas_min?: number;
  vagas_max?: number;
  area_minima?: number;
  aceita_pets?: boolean;

  // Observações adicionais
  observacoes?: string;
}

export async function leadsCapturaRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/leads/captura
   * Endpoint público para captura de leads
   */
  server.post<{ Body: CapturaLeadBody }>(
    '/captura',
    async (request, reply) => {
      try {
        const {
          tenant_slug = 'integrius', // Default para teste
          nome,
          telefone,
          email,
          tipo_negocio,
          tipo_imovel_desejado,
          valor_minimo,
          valor_maximo,
          estado,
          municipio,
          bairro,
          complemento_localizacao,
          quartos_min,
          quartos_max,
          vagas_min,
          vagas_max,
          area_minima,
          aceita_pets,
          observacoes
        } = request.body;

        // Validações básicas
        if (!nome || !telefone || !email) {
          return reply.status(400).send({
            error: 'Dados incompletos',
            message: 'Nome, telefone e email são obrigatórios'
          });
        }

        if (!tipo_negocio || !tipo_imovel_desejado) {
          return reply.status(400).send({
            error: 'Dados incompletos',
            message: 'Tipo de negócio e tipo de imóvel são obrigatórios'
          });
        }

        if (!estado || !municipio) {
          return reply.status(400).send({
            error: 'Localização incompleta',
            message: 'Estado e município são obrigatórios'
          });
        }

        // Validar UF
        if (!ibgeService.isValidUF(estado)) {
          return reply.status(400).send({
            error: 'Estado inválido',
            message: 'A sigla do estado fornecida não é válida'
          });
        }

        // Buscar tenant
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenant_slug }
        });

        if (!tenant) {
          return reply.status(404).send({
            error: 'Imobiliária não encontrada',
            message: `Imobiliária com slug "${tenant_slug}" não foi encontrada`
          });
        }

        // Formatar telefone (remover formatação)
        const telefoneLimpo = telefone.replace(/\D/g, '');

        // Validar formato de telefone brasileiro
        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
          return reply.status(400).send({
            error: 'Telefone inválido',
            message: 'O telefone deve ter 10 ou 11 dígitos'
          });
        }

        // Qualificar lead com IA Sofia (não bloquear)
        let qualificacao: any = null;
        try {
          qualificacao = await leadQualificationService.qualificarLead({
            nome,
            telefone: telefoneLimpo,
            email,
            tipo_negocio,
            tipo_imovel_desejado,
            valor_minimo,
            valor_maximo,
            localizacao: ibgeService.formatLocalizacao(estado, municipio, bairro),
            quartos: quartos_min && quartos_max ? `${quartos_min}-${quartos_max}` : undefined,
            vagas: vagas_min && vagas_max ? `${vagas_min}-${vagas_max}` : undefined,
            area_minima,
            aceita_pets,
            observacoes
          });

          server.log.info(`🤖 Sofia qualificou lead: ${qualificacao.temperatura} (${qualificacao.score})`);
        } catch (error) {
          server.log.error('Erro ao qualificar lead com Sofia:', error);
          // Continua mesmo se a qualificação falhar
        }

        // Criar lead
        const lead = await prisma.lead.create({
          data: {
            tenant_id: tenant.id,

            // Dados pessoais
            nome,
            telefone: telefoneLimpo,
            email,

            // Origem
            origem: 'SITE',
            temperatura: qualificacao?.temperatura || 'MORNO',
            score: qualificacao?.score || 50,

            // Tipo de negócio e imóvel
            tipo_negocio,
            tipo_imovel_desejado,

            // Valores
            valor_minimo: valor_minimo ? String(valor_minimo) : null,
            valor_maximo: valor_maximo ? String(valor_maximo) : null,

            // Localização
            estado: estado.toUpperCase(),
            municipio,
            bairro,
            complemento_localizacao,

            // Características
            quartos_min,
            quartos_max,
            vagas_min,
            vagas_max,
            area_minima: area_minima ? String(area_minima) : null,
            aceita_pets,

            // Observações
            observacoes,

            // IA habilitada
            ai_enabled: true,
            ai_qualificacao: qualificacao ? {
              score: qualificacao.score,
              temperatura: qualificacao.temperatura,
              insights: qualificacao.insights,
              analise: qualificacao.analise_detalhada,
              data_qualificacao: new Date().toISOString()
            } : null,

            // Timeline inicial
            timeline: [
              {
                evento: 'LEAD_CRIADO',
                data: new Date().toISOString(),
                origem: 'FORMULARIO_CAPTURA',
                detalhes: {
                  tipo_negocio,
                  tipo_imovel: tipo_imovel_desejado,
                  localizacao: ibgeService.formatLocalizacao(estado, municipio, bairro)
                }
              }
            ],

            // Timestamp do primeiro contato
            ultimo_contato: new Date()
          },
          include: {
            tenant: {
              select: {
                nome: true,
                email: true,
                telefone: true
              }
            }
          }
        });

        server.log.info(`✅ Lead capturado: ${lead.nome} (${lead.id})`);

        // Enviar email de boas-vindas (não bloquear response)
        if (lead.email) {
          sendGridService.enviarBoasVindasLead({
            leadNome: lead.nome,
            leadEmail: lead.email,
            tipoNegocio: lead.tipo_negocio || undefined,
            tipoImovel: lead.tipo_imovel_desejado || undefined,
            localizacao: ibgeService.formatLocalizacao(
              lead.estado || undefined,
              lead.municipio || undefined,
              lead.bairro || undefined
            )
          }).catch((error) => {
            server.log.error('Erro ao enviar email de boas-vindas:', error);
          });
        }

        // TODO: Disparar eventos assíncronos adicionais:
        // 1. Sofia analisa e busca imóveis
        // 2. Enviar email com sugestões de imóveis (após Sofia processar)
        // 3. (Futuro) Enviar WhatsApp com Dialog360
        // 4. Quando corretor atribuído: notificar via Telegram (já implementado)

        return {
          success: true,
          message: 'Lead cadastrado com sucesso! Em breve você receberá sugestões de imóveis por email.',
          data: {
            id: lead.id,
            nome: lead.nome,
            email: lead.email,
            tipo_negocio: lead.tipo_negocio,
            tipo_imovel: lead.tipo_imovel_desejado,
            localizacao: ibgeService.formatLocalizacao(
              lead.estado || undefined,
              lead.municipio || undefined,
              lead.bairro || undefined
            )
          }
        };
      } catch (error: any) {
        server.log.error('Erro ao capturar lead:', error);

        // Erro específico de validação do Prisma
        if (error.code === 'P2002') {
          return reply.status(409).send({
            error: 'Lead já cadastrado',
            message: 'Já existe um lead com este email ou telefone'
          });
        }

        return reply.status(500).send({
          error: 'Erro ao processar solicitação',
          message: 'Ocorreu um erro ao cadastrar seu interesse. Tente novamente.'
        });
      }
    }
  );

  /**
   * GET /api/v1/leads/captura/opcoes
   * Retorna opções para os campos do formulário
   */
  server.get('/captura/opcoes', async (request, reply) => {
    return {
      success: true,
      data: {
        tipos_negocio: [
          { value: 'COMPRA', label: 'Comprar' },
          { value: 'ALUGUEL', label: 'Alugar' },
          { value: 'TEMPORADA', label: 'Temporada' },
          { value: 'VENDA', label: 'Vender meu imóvel' }
        ],
        tipos_imovel: [
          { value: 'APARTAMENTO', label: 'Apartamento' },
          { value: 'CASA', label: 'Casa' },
          { value: 'TERRENO', label: 'Terreno' },
          { value: 'COMERCIAL', label: 'Comercial/Loja' },
          { value: 'RURAL', label: 'Propriedade Rural' },
          { value: 'CHACARA', label: 'Chácara' },
          { value: 'SOBRADO', label: 'Sobrado' },
          { value: 'COBERTURA', label: 'Cobertura' },
          { value: 'LOFT', label: 'Loft' },
          { value: 'KITNET', label: 'Kitnet/Studio' }
        ],
        quartos: [
          { value: 1, label: '1 quarto' },
          { value: 2, label: '2 quartos' },
          { value: 3, label: '3 quartos' },
          { value: 4, label: '4+ quartos' }
        ],
        vagas: [
          { value: 0, label: 'Sem vaga' },
          { value: 1, label: '1 vaga' },
          { value: 2, label: '2 vagas' },
          { value: 3, label: '3+ vagas' }
        ]
      }
    };
  });
}
