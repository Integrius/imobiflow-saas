/**
 * Serviço de Matching de Imóveis com IA
 *
 * Sofia analisa o perfil do lead e sugere imóveis compatíveis
 * do catálogo do tenant, ordenados por relevância.
 */

import { ClaudeService } from './claude.service';
import { prisma } from '../../shared/database/prisma.service';

export interface LeadProfile {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  tipo_negocio: string; // COMPRA, ALUGUEL, TEMPORADA
  tipo_imovel_desejado: string; // APARTAMENTO, CASA, etc.
  valor_minimo?: number;
  valor_maximo?: number;
  estado?: string;
  municipio?: string;
  bairro?: string;
  quartos_min?: number;
  quartos_max?: number;
  vagas_min?: number;
  vagas_max?: number;
  area_minima?: number;
  aceita_pets?: boolean;
  observacoes?: string;
}

export interface ImovelForMatching {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  preco: number;
  endereco: {
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  caracteristicas: {
    quartos?: number;
    suites?: number;
    banheiros?: number;
    vagas?: number;
    area_total?: number;
    area_construida?: number;
    mobiliado?: boolean;
    aceita_pets?: boolean;
  };
  fotos: string[];
  diferenciais: string[];
}

export interface MatchResult {
  imovel: ImovelForMatching;
  score: number; // 0-100: relevância para o lead
  motivos: string[]; // Por que esse imóvel foi sugerido
  destaque: string; // Frase de destaque personalizada
}

export interface PropertyMatchingResult {
  lead: {
    id: string;
    nome: string;
  };
  sugestoes: MatchResult[];
  mensagem_personalizada: string;
  total_encontrados: number;
  criterios_usados: string[];
}

class PropertyMatchingService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  /**
   * Busca e ranqueia imóveis compatíveis com o perfil do lead
   */
  async findMatchingProperties(
    tenantId: string,
    leadProfile: LeadProfile,
    maxResults: number = 5
  ): Promise<PropertyMatchingResult> {
    console.log(`🏠 [PropertyMatching] Buscando imóveis para lead: ${leadProfile.nome}`);

    // 1. Buscar imóveis disponíveis que atendam aos critérios básicos
    const imoveis = await this.buscarImoveisDisponiveis(tenantId, leadProfile);

    if (imoveis.length === 0) {
      console.log(`❌ [PropertyMatching] Nenhum imóvel encontrado para os critérios`);
      return {
        lead: { id: leadProfile.id, nome: leadProfile.nome },
        sugestoes: [],
        mensagem_personalizada: `Olá ${leadProfile.nome}! Ainda não encontramos imóveis que atendam exatamente aos seus critérios, mas estamos trabalhando para encontrar a opção perfeita para você.`,
        total_encontrados: 0,
        criterios_usados: this.getCriteriosUsados(leadProfile)
      };
    }

    console.log(`✅ [PropertyMatching] ${imoveis.length} imóveis encontrados, analisando com IA...`);

    // 2. Usar IA para ranquear e personalizar sugestões
    const sugestoesRanqueadas = await this.ranquearComIA(leadProfile, imoveis, maxResults);

    // 3. Gerar mensagem personalizada
    const mensagem = await this.gerarMensagemPersonalizada(leadProfile, sugestoesRanqueadas);

    return {
      lead: { id: leadProfile.id, nome: leadProfile.nome },
      sugestoes: sugestoesRanqueadas,
      mensagem_personalizada: mensagem,
      total_encontrados: imoveis.length,
      criterios_usados: this.getCriteriosUsados(leadProfile)
    };
  }

  /**
   * Busca imóveis disponíveis que atendam aos critérios básicos do lead
   */
  private async buscarImoveisDisponiveis(
    tenantId: string,
    lead: LeadProfile
  ): Promise<ImovelForMatching[]> {
    // Mapear tipo de negócio do lead para categoria do imóvel
    const categoriaMap: Record<string, string> = {
      'COMPRA': 'VENDA',
      'ALUGUEL': 'LOCACAO',
      'TEMPORADA': 'TEMPORADA'
    };

    const categoria = categoriaMap[lead.tipo_negocio] || 'VENDA';

    // Construir filtros de preço com margem de 20%
    const precoMin = lead.valor_minimo ? lead.valor_minimo * 0.8 : undefined;
    const precoMax = lead.valor_maximo ? lead.valor_maximo * 1.2 : undefined;

    // Buscar imóveis
    const whereClause: any = {
      tenant_id: tenantId,
      status: 'DISPONIVEL',
      categoria: categoria
    };

    // Filtro de tipo de imóvel
    if (lead.tipo_imovel_desejado) {
      whereClause.tipo = lead.tipo_imovel_desejado;
    }

    // Filtro de preço
    if (precoMin || precoMax) {
      whereClause.preco = {};
      if (precoMin) whereClause.preco.gte = precoMin;
      if (precoMax) whereClause.preco.lte = precoMax;
    }

    const imoveis = await prisma.imovel.findMany({
      where: whereClause,
      select: {
        id: true,
        codigo: true,
        titulo: true,
        descricao: true,
        tipo: true,
        categoria: true,
        preco: true,
        endereco: true,
        caracteristicas: true,
        fotos: true,
        diferenciais: true
      },
      orderBy: { created_at: 'desc' },
      take: 50 // Limitar para performance
    });

    // Converter para formato de matching
    return imoveis.map(imovel => ({
      id: imovel.id,
      codigo: imovel.codigo,
      titulo: imovel.titulo,
      descricao: imovel.descricao,
      tipo: imovel.tipo,
      categoria: imovel.categoria,
      preco: Number(imovel.preco),
      endereco: imovel.endereco as any,
      caracteristicas: imovel.caracteristicas as any,
      fotos: imovel.fotos,
      diferenciais: imovel.diferenciais
    }));
  }

  /**
   * Usa IA para ranquear imóveis por relevância
   */
  private async ranquearComIA(
    lead: LeadProfile,
    imoveis: ImovelForMatching[],
    maxResults: number
  ): Promise<MatchResult[]> {
    // Primeiro, aplicar filtros locais para pré-ranquear
    const imoveisComScore = imoveis.map(imovel => ({
      imovel,
      scoreLocal: this.calcularScoreLocal(lead, imovel)
    }));

    // Ordenar por score local e pegar os top candidatos
    const topCandidatos = imoveisComScore
      .sort((a, b) => b.scoreLocal - a.scoreLocal)
      .slice(0, Math.min(maxResults * 2, 10)); // Dobro do necessário para a IA refinar

    if (topCandidatos.length === 0) {
      return [];
    }

    // Usar IA para análise mais profunda e personalização
    try {
      const prompt = this.buildRankingPrompt(lead, topCandidatos.map(c => c.imovel));
      const resultado = await this.claudeService.analyze(prompt);

      // Processar resultado da IA
      const sugestoes = this.processarResultadoIA(resultado, topCandidatos);

      return sugestoes.slice(0, maxResults);
    } catch (error) {
      console.error('Erro ao ranquear com IA, usando score local:', error);
      // Fallback: usar apenas score local
      return topCandidatos.slice(0, maxResults).map(c => ({
        imovel: c.imovel,
        score: c.scoreLocal,
        motivos: this.gerarMotivosLocais(lead, c.imovel),
        destaque: `${c.imovel.titulo} - Excelente opção para você!`
      }));
    }
  }

  /**
   * Calcula score local baseado em critérios objetivos
   */
  private calcularScoreLocal(lead: LeadProfile, imovel: ImovelForMatching): number {
    let score = 0;
    const carac = imovel.caracteristicas || {};
    const end = imovel.endereco || {};

    // Tipo de imóvel (peso alto)
    if (lead.tipo_imovel_desejado === imovel.tipo) {
      score += 25;
    }

    // Preço dentro da faixa (peso alto)
    if (lead.valor_minimo && lead.valor_maximo) {
      if (imovel.preco >= lead.valor_minimo && imovel.preco <= lead.valor_maximo) {
        score += 25; // Dentro da faixa exata
      } else if (imovel.preco >= lead.valor_minimo * 0.9 && imovel.preco <= lead.valor_maximo * 1.1) {
        score += 15; // Margem de 10%
      }
    }

    // Localização (peso médio-alto)
    if (lead.estado && end.estado?.toUpperCase() === lead.estado.toUpperCase()) {
      score += 10;
      if (lead.municipio && end.cidade?.toLowerCase().includes(lead.municipio.toLowerCase())) {
        score += 10;
        if (lead.bairro && end.bairro?.toLowerCase().includes(lead.bairro.toLowerCase())) {
          score += 10; // Bairro exato é bônus
        }
      }
    }

    // Quartos
    if (lead.quartos_min && carac.quartos) {
      if (carac.quartos >= lead.quartos_min) {
        score += 10;
        if (lead.quartos_max && carac.quartos <= lead.quartos_max) {
          score += 5; // Dentro da faixa
        }
      }
    }

    // Vagas
    if (lead.vagas_min && carac.vagas) {
      if (carac.vagas >= lead.vagas_min) {
        score += 5;
      }
    }

    // Área
    if (lead.area_minima && carac.area_total) {
      if (carac.area_total >= lead.area_minima) {
        score += 5;
      }
    }

    // Aceita pets
    if (lead.aceita_pets === true && carac.aceita_pets === true) {
      score += 5;
    } else if (lead.aceita_pets === true && carac.aceita_pets === false) {
      score -= 10; // Penalidade
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Constrói prompt para a IA ranquear imóveis
   */
  private buildRankingPrompt(lead: LeadProfile, imoveis: ImovelForMatching[]): string {
    const leadInfo = `
PERFIL DO CLIENTE:
- Nome: ${lead.nome}
- Busca: ${this.formatarTipoNegocio(lead.tipo_negocio)} de ${this.formatarTipoImovel(lead.tipo_imovel_desejado)}
- Orçamento: ${this.formatarOrcamento(lead.valor_minimo, lead.valor_maximo)}
- Localização desejada: ${[lead.bairro, lead.municipio, lead.estado].filter(Boolean).join(', ') || 'Não especificada'}
- Quartos: ${lead.quartos_min ? `${lead.quartos_min}${lead.quartos_max ? `-${lead.quartos_max}` : '+'}` : 'Não especificado'}
- Vagas: ${lead.vagas_min ? `${lead.vagas_min}+` : 'Não especificado'}
- Área mínima: ${lead.area_minima ? `${lead.area_minima}m²` : 'Não especificada'}
- Aceita pets: ${lead.aceita_pets === true ? 'Sim' : lead.aceita_pets === false ? 'Não' : 'Não informado'}
- Observações: ${lead.observacoes || 'Nenhuma'}
`;

    const imoveisInfo = imoveis.map((im, i) => `
IMÓVEL ${i + 1} (ID: ${im.id}):
- Título: ${im.titulo}
- Tipo: ${im.tipo}
- Preço: R$ ${im.preco.toLocaleString('pt-BR')}
- Localização: ${[im.endereco?.bairro, im.endereco?.cidade, im.endereco?.estado].filter(Boolean).join(', ')}
- Quartos: ${im.caracteristicas?.quartos || 'N/I'}
- Vagas: ${im.caracteristicas?.vagas || 'N/I'}
- Área: ${im.caracteristicas?.area_total ? `${im.caracteristicas.area_total}m²` : 'N/I'}
- Aceita pets: ${im.caracteristicas?.aceita_pets ? 'Sim' : 'Não'}
- Diferenciais: ${im.diferenciais?.slice(0, 3).join(', ') || 'N/I'}
`).join('\n');

    return `
Você é Sofia, especialista em matching imobiliário.

${leadInfo}

IMÓVEIS DISPONÍVEIS:
${imoveisInfo}

Analise a compatibilidade de cada imóvel com o perfil do cliente.

Retorne APENAS um JSON (sem markdown) com o seguinte formato:

{
  "ranking": [
    {
      "imovel_id": "id-do-imovel",
      "score": 85,
      "motivos": ["Motivo 1", "Motivo 2", "Motivo 3"],
      "destaque": "Frase curta e persuasiva para destacar este imóvel para o cliente"
    }
  ]
}

REGRAS:
- Score de 0 a 100 (quanto maior, mais compatível)
- Ordene do mais compatível ao menos compatível
- Máximo 3 motivos por imóvel
- Destaque deve ser personalizado para o cliente (use o nome dele)
- Considere todos os critérios do cliente, não apenas preço
`.trim();
  }

  /**
   * Processa resultado da IA
   */
  private processarResultadoIA(
    resultado: any,
    candidatos: { imovel: ImovelForMatching; scoreLocal: number }[]
  ): MatchResult[] {
    const imoveisMap = new Map(candidatos.map(c => [c.imovel.id, c.imovel]));

    if (!resultado?.ranking || !Array.isArray(resultado.ranking)) {
      // Fallback
      return candidatos.map(c => ({
        imovel: c.imovel,
        score: c.scoreLocal,
        motivos: this.gerarMotivosLocais({ tipo_imovel_desejado: c.imovel.tipo } as LeadProfile, c.imovel),
        destaque: c.imovel.titulo
      }));
    }

    return resultado.ranking
      .filter((r: any) => imoveisMap.has(r.imovel_id))
      .map((r: any) => ({
        imovel: imoveisMap.get(r.imovel_id)!,
        score: Math.min(100, Math.max(0, Number(r.score) || 50)),
        motivos: Array.isArray(r.motivos) ? r.motivos.slice(0, 3) : [],
        destaque: r.destaque || imoveisMap.get(r.imovel_id)!.titulo
      }));
  }

  /**
   * Gera motivos locais (fallback quando IA falha)
   */
  private gerarMotivosLocais(lead: LeadProfile, imovel: ImovelForMatching): string[] {
    const motivos: string[] = [];
    const carac = imovel.caracteristicas || {};

    if (lead.tipo_imovel_desejado === imovel.tipo) {
      motivos.push(`${this.formatarTipoImovel(imovel.tipo)} conforme você procura`);
    }

    if (carac.quartos) {
      motivos.push(`${carac.quartos} quarto${carac.quartos > 1 ? 's' : ''}`);
    }

    if (carac.vagas) {
      motivos.push(`${carac.vagas} vaga${carac.vagas > 1 ? 's' : ''} de garagem`);
    }

    if (imovel.endereco?.bairro) {
      motivos.push(`Localizado no ${imovel.endereco.bairro}`);
    }

    return motivos.slice(0, 3);
  }

  /**
   * Gera mensagem personalizada para o lead
   */
  private async gerarMensagemPersonalizada(
    lead: LeadProfile,
    sugestoes: MatchResult[]
  ): Promise<string> {
    if (sugestoes.length === 0) {
      return `Olá ${lead.nome}! Estamos trabalhando para encontrar imóveis que atendam aos seus critérios. Em breve entraremos em contato com novidades!`;
    }

    const primeiroNome = lead.nome.split(' ')[0];
    const tipoNegocio = lead.tipo_negocio === 'COMPRA' ? 'comprar' :
                        lead.tipo_negocio === 'ALUGUEL' ? 'alugar' : 'encontrar';

    if (sugestoes.length === 1) {
      return `Olá ${primeiroNome}! Encontramos uma excelente opção para você ${tipoNegocio}: ${sugestoes[0].imovel.titulo}. ${sugestoes[0].destaque}`;
    }

    return `Olá ${primeiroNome}! Encontramos ${sugestoes.length} imóveis perfeitos para você! O destaque é: ${sugestoes[0].imovel.titulo}. Confira todas as opções e entre em contato conosco!`;
  }

  /**
   * Retorna lista de critérios usados na busca
   */
  private getCriteriosUsados(lead: LeadProfile): string[] {
    const criterios: string[] = [];

    if (lead.tipo_negocio) criterios.push(`Tipo: ${this.formatarTipoNegocio(lead.tipo_negocio)}`);
    if (lead.tipo_imovel_desejado) criterios.push(`Imóvel: ${this.formatarTipoImovel(lead.tipo_imovel_desejado)}`);
    if (lead.valor_minimo || lead.valor_maximo) criterios.push(`Orçamento: ${this.formatarOrcamento(lead.valor_minimo, lead.valor_maximo)}`);
    if (lead.municipio) criterios.push(`Cidade: ${lead.municipio}`);
    if (lead.bairro) criterios.push(`Bairro: ${lead.bairro}`);
    if (lead.quartos_min) criterios.push(`Quartos: ${lead.quartos_min}+`);

    return criterios;
  }

  // Helpers de formatação
  private formatarTipoNegocio(tipo: string): string {
    const map: Record<string, string> = {
      'COMPRA': 'Compra',
      'ALUGUEL': 'Aluguel',
      'TEMPORADA': 'Temporada'
    };
    return map[tipo] || tipo;
  }

  private formatarTipoImovel(tipo: string): string {
    const map: Record<string, string> = {
      'APARTAMENTO': 'Apartamento',
      'CASA': 'Casa',
      'TERRENO': 'Terreno',
      'COMERCIAL': 'Comercial',
      'RURAL': 'Rural',
      'CHACARA': 'Chácara',
      'SOBRADO': 'Sobrado',
      'COBERTURA': 'Cobertura',
      'LOFT': 'Loft',
      'KITNET': 'Kitnet'
    };
    return map[tipo] || tipo;
  }

  private formatarOrcamento(min?: number, max?: number): string {
    if (!min && !max) return 'Não definido';
    if (min && max) return `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`;
    if (min) return `A partir de R$ ${min.toLocaleString('pt-BR')}`;
    return `Até R$ ${max!.toLocaleString('pt-BR')}`;
  }
}

// Singleton
export const propertyMatchingService = new PropertyMatchingService();
