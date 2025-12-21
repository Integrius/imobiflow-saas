/**
 * Serviço de integração com SendGrid
 *
 * Envia emails transacionais e de marketing
 */

import sgMail from '@sendgrid/mail';

export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface WelcomeLeadEmail {
  leadNome: string;
  leadEmail: string;
  tipoNegocio?: string;
  tipoImovel?: string;
  localizacao?: string;
}

export interface SugestoesImoveisEmail {
  leadNome: string;
  leadEmail: string;
  imoveis: Array<{
    titulo: string;
    tipo: string;
    valor: number;
    localizacao: string;
    quartos?: number;
    vagas?: number;
    area?: number;
    descricao?: string;
    fotos?: string[];
    url?: string;
  }>;
  totalSugestoes: number;
}

class SendGridService {
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
    } else {
      console.warn('⚠️  SENDGRID_API_KEY não configurado - emails desabilitados');
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }

  /**
   * Email padrão do remetente
   */
  private getDefaultFrom(): string {
    return process.env.SENDGRID_FROM_EMAIL || 'noreply@integrius.com.br';
  }

  /**
   * Nome padrão do remetente
   */
  private getDefaultFromName(): string {
    return process.env.SENDGRID_FROM_NAME || 'ImobiFlow';
  }

  /**
   * Envia email genérico
   */
  async sendEmail(config: EmailConfig): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SendGrid não configurado - email não enviado');
      return false;
    }

    try {
      const from = config.from || `${this.getDefaultFromName()} <${this.getDefaultFrom()}>`;

      await sgMail.send({
        to: config.to,
        from,
        subject: config.subject,
        html: config.html,
        replyTo: config.replyTo
      });

      console.log(`✅ Email enviado para ${config.to}`);
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar email SendGrid:', error.response?.body || error.message);
      throw new Error('Erro ao enviar email');
    }
  }

  /**
   * Email de boas-vindas para novo lead
   */
  async enviarBoasVindasLead(data: WelcomeLeadEmail): Promise<boolean> {
    const { leadNome, leadEmail, tipoNegocio, tipoImovel, localizacao } = data;

    const primeiroNome = leadNome.split(' ')[0];

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C2C2C;
      background-color: #FAF8F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #2C2C2C;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #555;
      margin-bottom: 15px;
    }
    .info-box {
      background: #DFF9C7;
      border-left: 4px solid #8FD14F;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #2C2C2C;
      font-size: 18px;
    }
    .info-box p {
      margin: 5px 0;
      color: #555;
    }
    .button {
      display: inline-block;
      background: #8FD14F;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #F4E2CE;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .emoji {
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏡 ImobiFlow</h1>
    </div>

    <div class="content">
      <p class="greeting">Olá, ${primeiroNome}! 👋</p>

      <p class="message">
        Muito obrigado por usar o <strong>ImobiFlow</strong> para encontrar o imóvel dos seus sonhos!
      </p>

      <p class="message">
        Recebemos sua solicitação e nossa equipe já está trabalhando para encontrar as melhores opções para você.
      </p>

      ${tipoNegocio || tipoImovel || localizacao ? `
      <div class="info-box">
        <h3>🎯 Sua Busca:</h3>
        ${tipoNegocio ? `<p><strong>Tipo de negócio:</strong> ${this.formatTipoNegocio(tipoNegocio)}</p>` : ''}
        ${tipoImovel ? `<p><strong>Tipo de imóvel:</strong> ${this.formatTipoImovel(tipoImovel)}</p>` : ''}
        ${localizacao ? `<p><strong>Localização:</strong> ${localizacao}</p>` : ''}
      </div>
      ` : ''}

      <div class="info-box">
        <h3>⚡ Próximos Passos:</h3>
        <p><span class="emoji">🤖</span> Nossa IA está analisando seu perfil</p>
        <p><span class="emoji">🔍</span> Buscando imóveis que correspondem às suas preferências</p>
        <p><span class="emoji">📧</span> Em breve você receberá sugestões personalizadas</p>
        <p><span class="emoji">👤</span> Um corretor especializado entrará em contato</p>
      </div>

      <p class="message">
        <strong>Tempo estimado:</strong> Você receberá nossas primeiras sugestões em até 24 horas.
      </p>
    </div>

    <div class="footer">
      <p><strong>ImobiFlow</strong></p>
      <p>Tecnologia e inteligência para encontrar o imóvel perfeito</p>
      <p style="margin-top: 20px; font-size: 12px;">
        📧 contato@integrius.com.br | 📱 WhatsApp em breve
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: leadEmail,
      subject: `Olá ${primeiroNome}! Recebemos sua solicitação 🏡`,
      html
    });
  }

  /**
   * Email com sugestões de imóveis
   */
  async enviarSugestoesImoveis(data: SugestoesImoveisEmail): Promise<boolean> {
    const { leadNome, leadEmail, imoveis, totalSugestoes } = data;

    const primeiroNome = leadNome.split(' ')[0];

    const imoveisHtml = imoveis.map((imovel, index) => `
      <div style="background: white; border: 2px solid #DFF9C7; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #2C2C2C; font-size: 20px;">
          ${index + 1}. ${imovel.titulo}
        </h3>

        <p style="color: #666; margin: 5px 0;">
          <strong>Tipo:</strong> ${imovel.tipo} |
          <strong>Valor:</strong> ${this.formatCurrency(imovel.valor)}
        </p>

        <p style="color: #666; margin: 5px 0;">
          <strong>📍 Localização:</strong> ${imovel.localizacao}
        </p>

        ${imovel.quartos || imovel.vagas || imovel.area ? `
        <p style="color: #666; margin: 5px 0;">
          ${imovel.quartos ? `🛏️ ${imovel.quartos} quartos` : ''}
          ${imovel.vagas ? ` | 🚗 ${imovel.vagas} vagas` : ''}
          ${imovel.area ? ` | 📐 ${imovel.area}m²` : ''}
        </p>
        ` : ''}

        ${imovel.descricao ? `
        <p style="color: #555; margin: 15px 0; line-height: 1.6;">
          ${imovel.descricao}
        </p>
        ` : ''}

        ${imovel.url ? `
        <a href="${imovel.url}" style="display: inline-block; background: #8FD14F; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
          Ver detalhes
        </a>
        ` : ''}
      </div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C2C2C;
      background-color: #FAF8F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 650px;
      margin: 40px auto;
      background: #FAF8F5;
    }
    .header {
      background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
      border-radius: 16px 16px 0 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 800;
    }
    .content {
      background: white;
      padding: 40px 30px;
    }
    .footer {
      background: #F4E2CE;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-radius: 0 0 16px 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Encontramos imóveis para você!</h1>
      <p style="margin: 0; font-size: 16px;">Selecionamos ${totalSugestoes} opções que combinam com seu perfil</p>
    </div>

    <div class="content">
      <p style="font-size: 18px; font-weight: 600; color: #2C2C2C; margin-bottom: 10px;">
        Olá, ${primeiroNome}! 👋
      </p>

      <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
        Nossa equipe analisou suas preferências e encontrou ${totalSugestoes} imóveis que podem ser perfeitos para você:
      </p>

      ${imoveisHtml}

      <div style="background: #DFF9C7; border-left: 4px solid #8FD14F; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <p style="margin: 0; font-size: 16px; color: #2C2C2C;">
          <strong>💬 Gostou de algum?</strong><br>
          Em breve um de nossos corretores especializados entrará em contato para agendar visitas e tirar todas as suas dúvidas!
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>ImobiFlow</strong></p>
      <p>Tecnologia e inteligência para encontrar o imóvel perfeito</p>
      <p style="margin-top: 20px; font-size: 12px;">
        📧 contato@integrius.com.br
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: leadEmail,
      subject: `${primeiroNome}, encontramos ${totalSugestoes} imóveis para você! 🏡`,
      html
    });
  }

  /**
   * Formata tipo de negócio
   */
  private formatTipoNegocio(tipo: string): string {
    const tipos: Record<string, string> = {
      'COMPRA': 'Compra',
      'ALUGUEL': 'Aluguel',
      'TEMPORADA': 'Temporada',
      'VENDA': 'Venda'
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
   * Formata valor em Real brasileiro
   */
  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}

// Singleton
export const sendGridService = new SendGridService();
