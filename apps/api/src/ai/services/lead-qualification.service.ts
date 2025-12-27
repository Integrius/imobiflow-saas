/**
 * Serviço de Qualificação Automática de Leads
 *
 * Sofia analisa cada lead capturado e determina:
 * - Score (0-100): Probabilidade de conversão
 * - Temperatura (FRIO, MORNO, QUENTE): Urgência e intenção de compra
 * - Insights: Pontos fortes e fracos do lead
 */

import { ClaudeService } from './claude.service';

export interface LeadQualificationInput {
  nome: string;
  telefone: string;
  email?: string;
  tipo_negocio: string;
  tipo_imovel_desejado: string;
  valor_minimo?: number;
  valor_maximo?: number;
  localizacao?: string;
  quartos?: string;
  vagas?: string;
  area_minima?: number;
  aceita_pets?: boolean;
  observacoes?: string;
}

export interface LeadQualificationResult {
  score: number; // 0-100
  temperatura: 'FRIO' | 'MORNO' | 'QUENTE';
  insights: {
    pontos_fortes: string[];
    pontos_fracos: string[];
    recomendacao: string;
  };
  analise_detalhada: {
    poder_compra: 'BAIXO' | 'MÉDIO' | 'ALTO';
    clareza_necessidades: 'BAIXA' | 'MÉDIA' | 'ALTA';
    urgencia: 'BAIXA' | 'MÉDIA' | 'ALTA';
    probabilidade_conversao: number; // 0-100
  };
}

class LeadQualificationService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  /**
   * Qualifica um lead usando IA
   */
  async qualificarLead(lead: LeadQualificationInput): Promise<LeadQualificationResult> {
    const prompt = this.buildQualificationPrompt(lead);

    try {
      const result = await this.claudeService.analyze(prompt);

      // Validar e sanitizar resultado
      return this.validateAndSanitize(result);
    } catch (error) {
      console.error('Erro ao qualificar lead:', error);
      // Retornar qualificação padrão em caso de erro
      return this.getDefaultQualification();
    }
  }

  /**
   * Constrói prompt para qualificação
   */
  private buildQualificationPrompt(lead: LeadQualificationInput): string {
    const localizacao = lead.localizacao || 'Não especificada';
    const orcamento = this.formatarOrcamento(lead.valor_minimo, lead.valor_maximo);
    const caracteristicas = this.formatarCaracteristicas(lead);

    return `
Você é Sofia, especialista em qualificação de leads imobiliários.

Analise o lead abaixo e retorne um JSON com a qualificação:

📋 DADOS DO LEAD:
- Nome: ${lead.nome}
- Telefone: ${lead.telefone}
- Email: ${lead.email || 'Não fornecido'}
- Tipo de Negócio: ${this.formatarTipoNegocio(lead.tipo_negocio)}
- Tipo de Imóvel: ${this.formatarTipoImovel(lead.tipo_imovel_desejado)}
- Localização: ${localizacao}
- Orçamento: ${orcamento}
- Características: ${caracteristicas}
- Observações: ${lead.observacoes || 'Nenhuma'}

🎯 CRITÉRIOS DE QUALIFICAÇÃO:

**SCORE (0-100):**
- 0-30: Lead frio (baixa probabilidade de conversão)
- 31-60: Lead morno (média probabilidade)
- 61-100: Lead quente (alta probabilidade)

Considere:
- Orçamento definido: +20 pontos
- Localização específica: +15 pontos
- Características detalhadas (quartos, vagas): +15 pontos
- Email fornecido: +10 pontos
- Observações detalhadas: +10 pontos
- Urgência implícita nas observações: +20 pontos

**TEMPERATURA:**
- FRIO: Sem urgência, explorando opções, sem orçamento claro
- MORNO: Alguma urgência, orçamento definido, necessidades claras
- QUENTE: Urgência explícita, orçamento alto, detalhes completos

**PODER DE COMPRA:**
- BAIXO: < R$ 300.000 ou sem orçamento definido
- MÉDIO: R$ 300.000 - R$ 1.000.000
- ALTO: > R$ 1.000.000

**CLAREZA DAS NECESSIDADES:**
- BAIXA: Apenas tipo de imóvel
- MÉDIA: Tipo + localização ou orçamento
- ALTA: Tipo + localização + orçamento + características

**URGÊNCIA:**
- BAIXA: "Estou apenas olhando", "sem pressa"
- MÉDIA: "Procurando há algum tempo", "interesse sério"
- ALTA: "Preciso urgente", "mudança em breve", "já visitei outros"

Retorne APENAS o JSON (sem markdown):

{
  "score": number,
  "temperatura": "FRIO" | "MORNO" | "QUENTE",
  "insights": {
    "pontos_fortes": ["ponto 1", "ponto 2"],
    "pontos_fracos": ["ponto 1", "ponto 2"],
    "recomendacao": "string"
  },
  "analise_detalhada": {
    "poder_compra": "BAIXO" | "MÉDIO" | "ALTO",
    "clareza_necessidades": "BAIXA" | "MÉDIA" | "ALTA",
    "urgencia": "BAIXA" | "MÉDIA" | "ALTA",
    "probabilidade_conversao": number
  }
}
`.trim();
  }

  /**
   * Formata orçamento para exibição
   */
  private formatarOrcamento(min?: number, max?: number): string {
    if (!min && !max) return 'Não definido';
    if (min && max) return `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`;
    if (min) return `A partir de R$ ${min.toLocaleString('pt-BR')}`;
    if (max) return `Até R$ ${max.toLocaleString('pt-BR')}`;
    return 'Não definido';
  }

  /**
   * Formata características
   */
  private formatarCaracteristicas(lead: LeadQualificationInput): string {
    const caracteristicas: string[] = [];

    if (lead.quartos) caracteristicas.push(`${lead.quartos} quartos`);
    if (lead.vagas) caracteristicas.push(`${lead.vagas} vagas`);
    if (lead.area_minima) caracteristicas.push(`Mínimo ${lead.area_minima}m²`);
    if (lead.aceita_pets !== undefined) {
      caracteristicas.push(lead.aceita_pets ? 'Aceita pets' : 'Não aceita pets');
    }

    return caracteristicas.length > 0 ? caracteristicas.join(', ') : 'Não especificadas';
  }

  /**
   * Formata tipo de negócio
   */
  private formatarTipoNegocio(tipo: string): string {
    const tipos: Record<string, string> = {
      'COMPRA': 'Compra',
      'ALUGUEL': 'Aluguel',
      'TEMPORADA': 'Temporada',
      'VENDA': 'Vender imóvel próprio'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Formata tipo de imóvel
   */
  private formatarTipoImovel(tipo: string): string {
    const tipos: Record<string, string> = {
      'APARTAMENTO': 'Apartamento',
      'CASA': 'Casa',
      'TERRENO': 'Terreno',
      'COMERCIAL': 'Comercial',
      'RURAL': 'Rural',
      'CHACARA': 'Chácara',
      'SOBRADO': 'Sobrado',
      'COBERTURA': 'Cobertura',
      'LOFT': 'Loft',
      'KITNET': 'Kitnet/Studio'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Valida e sanitiza resultado da IA
   */
  private validateAndSanitize(result: any): LeadQualificationResult {
    return {
      score: this.validateScore(result.score),
      temperatura: this.validateTemperatura(result.temperatura),
      insights: {
        pontos_fortes: Array.isArray(result.insights?.pontos_fortes)
          ? result.insights.pontos_fortes.slice(0, 5)
          : ['Lead capturado com sucesso'],
        pontos_fracos: Array.isArray(result.insights?.pontos_fracos)
          ? result.insights.pontos_fracos.slice(0, 5)
          : ['Poucas informações fornecidas'],
        recomendacao: result.insights?.recomendacao || 'Entrar em contato para qualificar melhor'
      },
      analise_detalhada: {
        poder_compra: this.validateEnum(result.analise_detalhada?.poder_compra, ['BAIXO', 'MÉDIO', 'ALTO'], 'MÉDIO'),
        clareza_necessidades: this.validateEnum(result.analise_detalhada?.clareza_necessidades, ['BAIXA', 'MÉDIA', 'ALTA'], 'MÉDIA'),
        urgencia: this.validateEnum(result.analise_detalhada?.urgencia, ['BAIXA', 'MÉDIA', 'ALTA'], 'MÉDIA'),
        probabilidade_conversao: this.validateScore(result.analise_detalhada?.probabilidade_conversao)
      }
    };
  }

  /**
   * Valida score (0-100)
   */
  private validateScore(score: any): number {
    const num = Number(score);
    if (isNaN(num)) return 50;
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  /**
   * Valida temperatura
   */
  private validateTemperatura(temp: any): 'FRIO' | 'MORNO' | 'QUENTE' {
    if (['FRIO', 'MORNO', 'QUENTE'].includes(temp)) return temp;
    return 'MORNO';
  }

  /**
   * Valida enum genérico
   */
  private validateEnum<T extends string>(value: any, validValues: T[], defaultValue: T): T {
    if (validValues.includes(value as T)) return value as T;
    return defaultValue;
  }

  /**
   * Retorna qualificação padrão em caso de erro
   */
  private getDefaultQualification(): LeadQualificationResult {
    return {
      score: 50,
      temperatura: 'MORNO',
      insights: {
        pontos_fortes: ['Lead capturado via formulário web'],
        pontos_fracos: ['Erro na análise automática - revisar manualmente'],
        recomendacao: 'Entrar em contato para qualificar'
      },
      analise_detalhada: {
        poder_compra: 'MÉDIO',
        clareza_necessidades: 'MÉDIA',
        urgencia: 'MÉDIA',
        probabilidade_conversao: 50
      }
    };
  }
}

// Singleton
export const leadQualificationService = new LeadQualificationService();
