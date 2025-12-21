/**
 * Serviço de integração com Telegram
 *
 * Envia notificações para corretores quando leads são atribuídos
 */

import axios from 'axios';

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface LeadNotification {
  leadId: string;
  leadNome: string;
  leadTelefone: string;
  leadEmail: string;
  tipoNegocio?: string;
  tipoImovel?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  localizacao?: string;
  quartos?: string;
  vagas?: string;
  areaminima?: number;
  aceitaPets?: boolean;
  observacoes?: string;
  corretorNome: string;
}

class TelegramService {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken) {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN não configurado - notificações desabilitadas');
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!this.botToken;
  }

  /**
   * Envia mensagem simples
   */
  async sendMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Telegram não configurado - mensagem não enviada');
      return false;
    }

    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: parseMode
      });

      return response.data.ok;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem Telegram:', error.response?.data || error.message);
      throw new Error('Erro ao enviar mensagem Telegram');
    }
  }

  /**
   * Formata valor em Real brasileiro
   */
  private formatCurrency(value?: number): string {
    if (!value) return 'Não informado';

    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  /**
   * Formata telefone brasileiro
   */
  private formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');

    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
    }

    if (clean.length === 10) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6)}`;
    }

    return phone;
  }

  /**
   * Envia notificação de novo lead para corretor
   */
  async notificarNovoLead(chatId: string, lead: LeadNotification): Promise<boolean> {
    const message = this.formatLeadMessage(lead);
    return this.sendMessage(chatId, message);
  }

  /**
   * Formata mensagem de lead para Telegram (HTML)
   */
  private formatLeadMessage(lead: LeadNotification): string {
    const sections: string[] = [];

    // Cabeçalho
    sections.push(`🎯 <b>NOVO LEAD ATRIBUÍDO</b>\n`);

    // Informações do lead
    sections.push(`👤 <b>Cliente:</b> ${lead.leadNome}`);
    sections.push(`📱 <b>WhatsApp:</b> ${this.formatPhone(lead.leadTelefone)}`);
    sections.push(`📧 <b>Email:</b> ${lead.leadEmail}`);

    // Separador
    sections.push('\n━━━━━━━━━━━━━━━━━━━━');

    // Preferências do cliente
    sections.push('\n🏡 <b>PREFERÊNCIAS:</b>');

    if (lead.tipoNegocio) {
      const negocio = this.formatTipoNegocio(lead.tipoNegocio);
      sections.push(`📋 <b>Tipo:</b> ${negocio}`);
    }

    if (lead.tipoImovel) {
      const imovel = this.formatTipoImovel(lead.tipoImovel);
      sections.push(`🏢 <b>Imóvel:</b> ${imovel}`);
    }

    if (lead.valorMinimo || lead.valorMaximo) {
      const min = this.formatCurrency(lead.valorMinimo);
      const max = this.formatCurrency(lead.valorMaximo);
      sections.push(`💰 <b>Valor:</b> ${min} - ${max}`);
    }

    if (lead.localizacao) {
      sections.push(`📍 <b>Local:</b> ${lead.localizacao}`);
    }

    if (lead.quartos) {
      sections.push(`🛏️ <b>Quartos:</b> ${lead.quartos}`);
    }

    if (lead.vagas) {
      sections.push(`🚗 <b>Vagas:</b> ${lead.vagas}`);
    }

    if (lead.areaminima) {
      sections.push(`📐 <b>Área mín:</b> ${lead.areaminima}m²`);
    }

    if (lead.aceitaPets !== undefined) {
      const pets = lead.aceitaPets ? '✅ Sim' : '❌ Não';
      sections.push(`🐾 <b>Aceita pets:</b> ${pets}`);
    }

    if (lead.observacoes) {
      sections.push(`\n💬 <b>Observações:</b>\n${lead.observacoes}`);
    }

    // Rodapé
    sections.push('\n━━━━━━━━━━━━━━━━━━━━');
    sections.push(`\n✅ <b>Atribuído para:</b> ${lead.corretorNome}`);
    sections.push(`\n🆔 <b>ID do Lead:</b> <code>${lead.leadId}</code>`);
    sections.push(`\n⏰ <i>Entre em contato o quanto antes!</i>`);

    return sections.join('\n');
  }

  /**
   * Formata tipo de negócio
   */
  private formatTipoNegocio(tipo: string): string {
    const tipos: Record<string, string> = {
      'COMPRA': '🏠 Compra',
      'ALUGUEL': '🔑 Aluguel',
      'TEMPORADA': '🏖️ Temporada',
      'VENDA': '💼 Venda'
    };

    return tipos[tipo] || tipo;
  }

  /**
   * Formata tipo de imóvel
   */
  private formatTipoImovel(tipo: string): string {
    const tipos: Record<string, string> = {
      'APARTAMENTO': 'Apartamento',
      'CASA': 'Casa',
      'TERRENO': 'Terreno',
      'COMERCIAL': 'Comercial',
      'RURAL': 'Rural',
      'LOJA': 'Loja',
      'SALA': 'Sala',
      'GALPAO': 'Galpão',
      'CHACARA': 'Chácara',
      'SITIO': 'Sítio',
      'FAZENDA': 'Fazenda'
    };

    return tipos[tipo] || tipo;
  }

  /**
   * Testa conexão com Telegram
   */
  async testConnection(): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'TELEGRAM_BOT_TOKEN não configurado'
      };
    }

    try {
      const response = await axios.get(`${this.apiUrl}/getMe`);

      return {
        success: response.data.ok,
        botInfo: response.data.result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Obtém chat_id de um usuário (útil para configuração inicial)
   */
  async getUpdates(): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    }

    try {
      const response = await axios.get(`${this.apiUrl}/getUpdates`);
      return response.data.result;
    } catch (error: any) {
      console.error('Erro ao obter updates:', error.response?.data || error.message);
      throw new Error('Erro ao obter updates do Telegram');
    }
  }
}

// Singleton
export const telegramService = new TelegramService();
