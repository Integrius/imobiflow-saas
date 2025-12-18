import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConversationContext {
  leadInfo: string;
  conversationHistory: string;
  leadPreferences: string;
  urgencyLevel: string;
  lastInteraction: string;
}

export class ContextBuilderService {
  /**
   * Constrói o contexto completo de uma conversa para enviar ao Claude
   */
  async buildContext(leadId: string): Promise<ConversationContext> {
    // Busca informações do lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20 // Últimas 20 mensagens
        },
        deals: {
          include: {
            property: true
          }
        }
      }
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado`);
    }

    // 1. Informações básicas do lead
    const leadInfo = this.buildLeadInfo(lead);

    // 2. Histórico de conversa
    const conversationHistory = this.buildConversationHistory(lead.messages);

    // 3. Preferências identificadas
    const leadPreferences = this.buildLeadPreferences(lead);

    // 4. Nível de urgência
    const urgencyLevel = this.determineUrgency(lead);

    // 5. Última interação
    const lastInteraction = this.getLastInteraction(lead.messages);

    return {
      leadInfo,
      conversationHistory,
      leadPreferences,
      urgencyLevel,
      lastInteraction
    };
  }

  /**
   * Formata informações básicas do lead
   */
  private buildLeadInfo(lead: any): string {
    const parts = [
      `Nome: ${lead.name}`,
      `Telefone: ${lead.phone}`,
      `Score: ${lead.score}/100`,
      `Status: ${lead.status}`,
      `Primeiro contato: ${this.formatDate(lead.createdAt)}`
    ];

    if (lead.email) {
      parts.push(`Email: ${lead.email}`);
    }

    return parts.join('\n');
  }

  /**
   * Formata o histórico de mensagens
   */
  private buildConversationHistory(messages: any[]): string {
    if (!messages || messages.length === 0) {
      return 'Nenhuma mensagem anterior.';
    }

    const formatted = messages.map(msg => {
      const time = this.formatDate(msg.createdAt);
      const sender = msg.isFromLead ? 'Lead' : 'Sofia';
      return `[${time}] ${sender}: ${msg.content}`;
    });

    return formatted.join('\n');
  }

  /**
   * Identifica e formata preferências do lead
   */
  private buildLeadPreferences(lead: any): string {
    const preferences: string[] = [];

    // Preferências explícitas (se houver campos no banco)
    if (lead.propertyType) {
      preferences.push(`Tipo de imóvel: ${lead.propertyType}`);
    }

    if (lead.budget) {
      preferences.push(`Orçamento: ${this.formatCurrency(lead.budget)}`);
    }

    if (lead.location) {
      preferences.push(`Localização desejada: ${lead.location}`);
    }

    if (lead.bedrooms) {
      preferences.push(`Quartos: ${lead.bedrooms}`);
    }

    // Analisa mensagens para extrair preferências implícitas
    if (lead.messages && lead.messages.length > 0) {
      const keywords = this.extractKeywordsFromMessages(lead.messages);
      if (keywords.length > 0) {
        preferences.push(`Palavras-chave mencionadas: ${keywords.join(', ')}`);
      }
    }

    return preferences.length > 0
      ? preferences.join('\n')
      : 'Preferências ainda não identificadas.';
  }

  /**
   * Determina o nível de urgência do lead
   */
  private determineUrgency(lead: any): string {
    // Se já tem urgência calculada
    if (lead.urgency) {
      return lead.urgency;
    }

    // Calcula baseado em score e comportamento
    if (lead.score >= 80) return 'alta';
    if (lead.score >= 50) return 'média';
    return 'baixa';
  }

  /**
   * Retorna informações sobre a última interação
   */
  private getLastInteraction(messages: any[]): string {
    if (!messages || messages.length === 0) {
      return 'Primeiro contato';
    }

    const lastMessage = messages[messages.length - 1];
    const hoursAgo = this.getHoursAgo(lastMessage.createdAt);

    if (hoursAgo < 1) {
      return 'Interagiu há poucos minutos';
    } else if (hoursAgo < 24) {
      return `Última interação há ${Math.floor(hoursAgo)} horas`;
    } else {
      const daysAgo = Math.floor(hoursAgo / 24);
      return `Última interação há ${daysAgo} dia(s)`;
    }
  }

  /**
   * Extrai palavras-chave relevantes das mensagens
   */
  private extractKeywordsFromMessages(messages: any[]): string[] {
    const keywords = new Set<string>();
    const relevantWords = [
      'apartamento', 'casa', 'kitnet', 'studio', 'cobertura',
      'urgente', 'rápido', 'imediato',
      'financiamento', 'entrada', 'parcelado',
      'piscina', 'garagem', 'academia', 'playground',
      'pet', 'animal', 'cachorro', 'gato'
    ];

    messages.forEach(msg => {
      if (msg.isFromLead) {
        const content = msg.content.toLowerCase();
        relevantWords.forEach(word => {
          if (content.includes(word)) {
            keywords.add(word);
          }
        });
      }
    });

    return Array.from(keywords);
  }

  /**
   * Formata data de forma amigável
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calcula horas desde uma data
   */
  private getHoursAgo(date: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Formata valores monetários
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Gera uma string formatada com todo o contexto para o prompt
   */
  formatContextForPrompt(context: ConversationContext): string {
    return `
═══════════════════════════════════════════════════════
📋 INFORMAÇÕES DO LEAD
═══════════════════════════════════════════════════════
${context.leadInfo}

═══════════════════════════════════════════════════════
🎯 PREFERÊNCIAS IDENTIFICADAS
═══════════════════════════════════════════════════════
${context.leadPreferences}

═══════════════════════════════════════════════════════
⚡ URGÊNCIA: ${context.urgencyLevel.toUpperCase()}
═══════════════════════════════════════════════════════
${context.lastInteraction}

═══════════════════════════════════════════════════════
💬 HISTÓRICO DA CONVERSA
═══════════════════════════════════════════════════════
${context.conversationHistory}
`.trim();
  }
}
