/**
 * Rota pública de captura de leads via landing page
 *
 * Endpoint sem autenticação para receber leads da página de captura
 */

import { FastifyInstance } from 'fastify';
import { TipoNegocio, TipoImovel, Prisma } from '@prisma/client';
import { ibgeService } from '../../shared/services/ibge.service';
import { sendGridService } from '../../shared/services/sendgrid.service';
import { twilioService } from '../../shared/services/twilio.service';
import { leadQualificationService } from '../../ai/services/lead-qualification.service';
import { propertyMatchingService, LeadProfile } from '../../ai/services/property-matching.service';
import { prisma } from '../../shared/database/prisma.service';

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
        } catch (error: any) {
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
            ai_qualificacao: qualificacao ? JSON.parse(JSON.stringify({
              score: qualificacao.score,
              temperatura: qualificacao.temperatura,
              insights: qualificacao.insights,
              analise: qualificacao.analise_detalhada,
              data_qualificacao: new Date().toISOString()
            })) : Prisma.JsonNull,

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

        // Buscar tenant para URLs e informações
        const tenantInfo = await prisma.tenant.findUnique({
          where: { id: tenant.id },
          select: { nome: true, slug: true, telefone: true }
        });

        // Processar sugestões de imóveis e enviar notificações (assíncrono)
        setImmediate(async () => {
          try {
            // 1. Montar perfil do lead para matching
            const leadProfile: LeadProfile = {
              id: lead.id,
              nome: lead.nome,
              email: lead.email || undefined,
              telefone: lead.telefone,
              tipo_negocio: tipo_negocio,
              tipo_imovel_desejado: tipo_imovel_desejado,
              valor_minimo,
              valor_maximo,
              estado,
              municipio,
              bairro,
              quartos_min,
              quartos_max,
              vagas_min,
              vagas_max,
              area_minima,
              aceita_pets,
              observacoes
            };

            // 2. Buscar imóveis compatíveis com IA
            server.log.info(`🏠 [Captura] Buscando sugestões de imóveis para ${lead.nome}...`);
            const sugestoes = await propertyMatchingService.findMatchingProperties(
              tenant.id,
              leadProfile,
              5 // máximo 5 sugestões
            );

            server.log.info(`✅ [Captura] ${sugestoes.total_encontrados} imóveis encontrados, ${sugestoes.sugestoes.length} sugeridos`);

            // 3. Salvar sugestões no lead (para histórico)
            if (sugestoes.sugestoes.length > 0) {
              await prisma.lead.update({
                where: { id: lead.id },
                data: {
                  ai_qualificacao: {
                    ...(lead.ai_qualificacao as any || {}),
                    sugestoes_enviadas: sugestoes.sugestoes.map(s => ({
                      imovel_id: s.imovel.id,
                      score: s.score,
                      data: new Date().toISOString()
                    }))
                  }
                }
              });
            }

            // 4. Enviar email com sugestões (ou boas-vindas se não houver)
            if (lead.email) {
              const tenantUrl = `https://${tenantInfo?.slug || 'imobiliaria'}.integrius.com.br`;

              if (sugestoes.sugestoes.length > 0) {
                // Email com sugestões de imóveis
                await sendGridService.enviarSugestoesImoveis({
                  leadNome: lead.nome,
                  leadEmail: lead.email,
                  sugestoes: sugestoes.sugestoes.map(s => ({
                    titulo: s.imovel.titulo,
                    preco: s.imovel.preco,
                    endereco: [s.imovel.endereco?.bairro, s.imovel.endereco?.cidade].filter(Boolean).join(', '),
                    quartos: s.imovel.caracteristicas?.quartos,
                    vagas: s.imovel.caracteristicas?.vagas,
                    area: s.imovel.caracteristicas?.area_total,
                    foto: s.imovel.fotos?.[0],
                    destaque: s.destaque,
                    url: `${tenantUrl}/imovel/${s.imovel.id}`
                  })),
                  mensagemPersonalizada: sugestoes.mensagem_personalizada,
                  tenantNome: tenantInfo?.nome || 'Imobiliária',
                  tenantUrl
                });
                server.log.info(`📧 [Captura] Email com ${sugestoes.sugestoes.length} sugestões enviado para ${lead.email}`);
              } else {
                // Email de boas-vindas (sem sugestões)
                await sendGridService.enviarBoasVindasLead({
                  leadNome: lead.nome,
                  leadEmail: lead.email,
                  tipoNegocio: tipo_negocio,
                  tipoImovel: tipo_imovel_desejado,
                  localizacao: ibgeService.formatLocalizacao(estado, municipio, bairro)
                });
                server.log.info(`📧 [Captura] Email de boas-vindas enviado para ${lead.email}`);
              }
            }

            // 5. Enviar WhatsApp com sugestões (se tiver telefone e sugestões)
            if (lead.telefone && sugestoes.sugestoes.length > 0) {
              try {
                const tenantUrl = `https://${tenantInfo?.slug || 'imobiliaria'}.integrius.com.br`;
                await twilioService.enviarSugestoesImoveis({
                  telefone: lead.telefone,
                  nome: lead.nome,
                  sugestoes: sugestoes.sugestoes.slice(0, 3).map(s => ({
                    titulo: s.imovel.titulo,
                    preco: s.imovel.preco,
                    endereco: [s.imovel.endereco?.bairro, s.imovel.endereco?.cidade].filter(Boolean).join(', '),
                    quartos: s.imovel.caracteristicas?.quartos,
                    url: `${tenantUrl}/imovel/${s.imovel.id}`
                  })),
                  mensagemPersonalizada: sugestoes.mensagem_personalizada,
                  tenantNome: tenantInfo?.nome || 'Imobiliária'
                });
                server.log.info(`📱 [Captura] WhatsApp com sugestões enviado para ${lead.telefone}`);
              } catch (whatsappError: any) {
                server.log.error(`Erro ao enviar WhatsApp com sugestões: ${whatsappError?.message || whatsappError}`);
              }
            }

          } catch (asyncError: any) {
            server.log.error(`Erro ao processar sugestões assíncronas: ${asyncError?.message || asyncError}`);
          }
        });

        // Nota: O envio de sugestões acontece de forma assíncrona após a resposta

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
