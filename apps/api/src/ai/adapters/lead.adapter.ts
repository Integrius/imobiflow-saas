import { Lead, Message, UrgencyLevel, Sentiment, Intent } from '@prisma/client';

/**
 * Adapter para converter entre o schema em português e interfaces em inglês
 * usadas pelos serviços de IA
 */

// Interface em inglês para os serviços de IA
export interface LeadData {
  id?: string;
  tenantId: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  source: string;
  status?: string;
  score?: number;

  // Campos IA
  propertyType?: string;
  location?: string;
  bedrooms?: number;
  budget?: number;
  urgency?: 'baixa' | 'média' | 'alta';
  sentiment?: 'positivo' | 'neutro' | 'negativo';
  intent?: string;
  aiEnabled?: boolean;
  escalatedToBroker?: boolean;
  escalationReason?: string;
}

export interface MessageData {
  id?: string;
  tenantId: string;
  leadId: string;
  content: string;
  isFromLead: boolean;
  platform?: 'whatsapp' | 'telegram' | 'webchat' | 'sms' | 'email';
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  aiAnalysis?: any;
  aiScoreImpact?: number;
}

export class LeadAdapter {
  /**
   * Converte LeadData (inglês) para formato do Prisma (português)
   */
  static toPrisma(data: LeadData): any {
    const prismaData: any = {
      nome: data.name,
      telefone: data.phone,
      tenant_id: data.tenantId
    };

    // Campos opcionais - dados pessoais
    if (data.email) prismaData.email = data.email;
    if (data.cpf) prismaData.cpf = data.cpf;

    // Origem - mapeia source para origem
    if (data.source) {
      const sourceMap: Record<string, string> = {
        'whatsapp': 'WHATSAPP',
        'telegram': 'TELEFONE',
        'site': 'SITE',
        'portal': 'PORTAL',
        'indicacao': 'INDICACAO',
        'redes_sociais': 'REDES_SOCIAIS',
        'evento': 'EVENTO',
        'outro': 'OUTRO'
      };
      prismaData.origem = sourceMap[data.source.toLowerCase()] || 'WHATSAPP';
    }

    // Score
    if (data.score !== undefined) prismaData.score = data.score;

    // Status - mapeia para temperatura
    if (data.status) {
      const statusMap: Record<string, string> = {
        'new': 'FRIO',
        'contacted': 'MORNO',
        'qualified': 'QUENTE',
        'hot': 'QUENTE'
      };
      prismaData.temperatura = statusMap[data.status] || 'FRIO';
    }

    // Interesse (obrigatório) - cria JSON vazio se não fornecido
    prismaData.interesse = {};

    // Campos IA - preferências
    if (data.propertyType) prismaData.property_type = data.propertyType;
    if (data.location) prismaData.location = data.location;
    if (data.bedrooms) prismaData.bedrooms = data.bedrooms;
    if (data.budget) prismaData.budget = data.budget;

    // Campos IA - análise comportamental
    if (data.urgency) {
      const urgencyMap: Record<string, UrgencyLevel> = {
        'baixa': 'BAIXA',
        'média': 'MEDIA',
        'alta': 'ALTA'
      };
      prismaData.urgency = urgencyMap[data.urgency];
    }

    if (data.sentiment) {
      const sentimentMap: Record<string, Sentiment> = {
        'positivo': 'POSITIVO',
        'neutro': 'NEUTRO',
        'negativo': 'NEGATIVO'
      };
      prismaData.sentiment = sentimentMap[data.sentiment];
    }

    if (data.intent) {
      const intentMap: Record<string, Intent> = {
        'informacao': 'INFORMACAO',
        'agendamento': 'AGENDAMENTO',
        'negociacao': 'NEGOCIACAO',
        'reclamacao': 'RECLAMACAO',
        'outro': 'OUTRO'
      };
      prismaData.intent = intentMap[data.intent.toLowerCase()] || 'OUTRO';
    }

    // Campos IA - controle
    if (data.aiEnabled !== undefined) prismaData.ai_enabled = data.aiEnabled;
    if (data.escalatedToBroker !== undefined) prismaData.escalated_to_broker = data.escalatedToBroker;
    if (data.escalationReason) prismaData.escalation_reason = data.escalationReason;

    return prismaData;
  }

  /**
   * Converte Lead do Prisma (português) para interface em inglês
   */
  static fromPrisma(lead: any): LeadData {
    const data: LeadData = {
      id: lead.id,
      tenantId: lead.tenant_id,
      name: lead.nome,
      phone: lead.telefone,
      email: lead.email || undefined,
      cpf: lead.cpf || undefined,
      score: lead.score,

      // Mapeia origem para source
      source: lead.origem?.toLowerCase() || 'whatsapp',

      // Mapeia temperatura para status
      status: this.mapTemperaturaToStatus(lead.temperatura)
    };

    // Campos IA - preferências
    if (lead.property_type) data.propertyType = lead.property_type;
    if (lead.location) data.location = lead.location;
    if (lead.bedrooms) data.bedrooms = lead.bedrooms;
    if (lead.budget) data.budget = Number(lead.budget);

    // Campos IA - análise comportamental
    if (lead.urgency) {
      const urgencyMap: Record<UrgencyLevel, 'baixa' | 'média' | 'alta'> = {
        'BAIXA': 'baixa',
        'MEDIA': 'média',
        'ALTA': 'alta'
      };
      data.urgency = urgencyMap[lead.urgency as UrgencyLevel];
    }

    if (lead.sentiment) {
      const sentimentMap: Record<Sentiment, 'positivo' | 'neutro' | 'negativo'> = {
        'POSITIVO': 'positivo',
        'NEUTRO': 'neutro',
        'NEGATIVO': 'negativo'
      };
      data.sentiment = sentimentMap[lead.sentiment as Sentiment];
    }

    if (lead.intent) data.intent = lead.intent.toLowerCase();

    // Campos IA - controle
    data.aiEnabled = lead.ai_enabled;
    data.escalatedToBroker = lead.escalated_to_broker;
    if (lead.escalation_reason) data.escalationReason = lead.escalation_reason;

    return data;
  }

  /**
   * Mapeia temperatura para status
   */
  private static mapTemperaturaToStatus(temperatura: string): string {
    const map: Record<string, string> = {
      'QUENTE': 'hot',
      'MORNO': 'qualified',
      'FRIO': 'new'
    };
    return map[temperatura] || 'new';
  }
}

export class MessageAdapter {
  /**
   * Converte MessageData (inglês) para formato do Prisma (português)
   */
  static toPrisma(data: MessageData): any {
    const prismaData: any = {
      tenant_id: data.tenantId,
      lead_id: data.leadId,
      content: data.content,
      is_from_lead: data.isFromLead
    };

    // Platform
    if (data.platform) {
      prismaData.platform = data.platform.toUpperCase();
    }

    // Status
    if (data.status) {
      prismaData.status = data.status.toUpperCase();
    }

    // AI Analysis
    if (data.aiAnalysis) prismaData.ai_analysis = data.aiAnalysis;
    if (data.aiScoreImpact !== undefined) prismaData.ai_score_impact = data.aiScoreImpact;

    return prismaData;
  }

  /**
   * Converte Message do Prisma (português) para interface em inglês
   */
  static fromPrisma(message: any): MessageData {
    return {
      id: message.id,
      tenantId: message.tenant_id,
      leadId: message.lead_id,
      content: message.content,
      isFromLead: message.is_from_lead,
      platform: message.platform?.toLowerCase(),
      status: message.status?.toLowerCase(),
      aiAnalysis: message.ai_analysis,
      aiScoreImpact: message.ai_score_impact
    };
  }
}
