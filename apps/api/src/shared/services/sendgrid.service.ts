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

  /**
   * Email de confirmação de agendamento de visita
   */
  async enviarConfirmacaoAgendamento(data: {
    leadNome: string;
    leadEmail: string;
    dataVisita: Date;
    imovelTitulo: string;
    corretorNome: string;
    corretorTelefone: string;
    tipoVisita: string;
  }): Promise<boolean> {
    const primeiroNome = data.leadNome.split(' ')[0];

    const dataFormatada = data.dataVisita.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const horaFormatada = data.dataVisita.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const tipoVisitaFormatado = data.tipoVisita === 'PRESENCIAL' ? 'Presencial' :
                                data.tipoVisita === 'VIRTUAL' ? 'Virtual (Online)' : 'Híbrida';

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
      font-size: 18px;
      margin-bottom: 20px;
      color: #2C2C2C;
    }
    .info-box {
      background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
      border-left: 4px solid #8FD14F;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-item {
      margin: 12px 0;
      display: flex;
      align-items: start;
    }
    .info-icon {
      margin-right: 12px;
      font-size: 20px;
      min-width: 24px;
    }
    .info-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 4px;
    }
    .info-value {
      color: #2C2C2C;
      font-size: 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 700;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Visita Agendada com Sucesso!</h1>
    </div>

    <div class="content">
      <p class="greeting">
        Olá, <strong>${primeiroNome}</strong>! 👋
      </p>

      <p>
        Sua visita foi agendada com sucesso! Estamos ansiosos para apresentar o imóvel perfeito para você.
      </p>

      <div class="info-box">
        <div class="info-item">
          <div class="info-icon">🏢</div>
          <div>
            <div class="info-label">Imóvel:</div>
            <div class="info-value">${data.imovelTitulo}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">📅</div>
          <div>
            <div class="info-label">Data:</div>
            <div class="info-value">${dataFormatada}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">⏰</div>
          <div>
            <div class="info-label">Horário:</div>
            <div class="info-value">${horaFormatada}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">🎯</div>
          <div>
            <div class="info-label">Tipo de Visita:</div>
            <div class="info-value">${tipoVisitaFormatado}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">👨‍💼</div>
          <div>
            <div class="info-label">Corretor Responsável:</div>
            <div class="info-value">${data.corretorNome}</div>
            <div class="info-value" style="color: #6C757D; font-size: 14px;">${data.corretorTelefone}</div>
          </div>
        </div>
      </div>

      <p>
        <strong>Importante:</strong> Você receberá lembretes automáticos 24 horas e 1 hora antes da visita.
      </p>

      <p>
        Em caso de imprevistos ou necessidade de reagendamento, entre em contato com seu corretor o quanto antes.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Sua plataforma imobiliária inteligente
      </p>
      <p style="margin: 0; font-size: 12px;">
        Este é um email automático, não responda diretamente.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: data.leadEmail,
      subject: `✅ Visita Agendada - ${data.imovelTitulo}`,
      html,
      replyTo: 'noreply@integrius.com.br'
    });
  }

  /**
   * Email de aviso 5 dias antes do término do trial
   */
  async sendTrialWarningEmail(
    email: string,
    nomeUsuario: string,
    nomeTenant: string,
    diasRestantes: number
  ): Promise<boolean> {
    const primeiroNome = nomeUsuario.split(' ')[0];

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
      background: linear-gradient(135deg, #FFB627 0%, #FF9500 100%);
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
    .warning-box {
      background: linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%);
      border-left: 4px solid #FFB627;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .warning-box h2 {
      margin: 0 0 15px 0;
      color: #FF9500;
      font-size: 20px;
    }
    .highlight {
      background: #FFB627;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
    }
    .info-box {
      background: #F0F8FF;
      border-left: 4px solid #4A90E2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #2C2C2C;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 700;
      margin: 20px 0;
      text-align: center;
      font-size: 16px;
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 10px 0;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Seu período de teste está acabando</h1>
    </div>

    <div class="content">
      <p style="font-size: 18px; font-weight: 600;">
        Olá, ${primeiroNome}! 👋
      </p>

      <p style="font-size: 16px;">
        Esperamos que você esteja aproveitando o <strong>ImobiFlow</strong> e todas as ferramentas que oferecemos para <strong>${nomeTenant}</strong>.
      </p>

      <div class="warning-box">
        <h2>⚠️ Atenção!</h2>
        <p style="margin: 0; font-size: 16px;">
          Seu período de teste gratuito termina em <span class="highlight">${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}</span>.
        </p>
      </div>

      <div class="info-box">
        <h3>🔒 Proteção dos Seus Dados</h3>
        <p style="margin: 5px 0;">
          Não se preocupe! Mesmo após o término do período trial, seus dados ficarão <strong>protegidos e disponíveis por mais 30 dias</strong> para recuperação.
        </p>
        <p style="margin: 15px 0 5px 0; font-weight: 600;">
          📦 Você pode recuperar seus dados de duas formas:
        </p>
        <ul>
          <li><strong>Antes do término:</strong> Clique no botão "Recuperar Dados" no cabeçalho do dashboard (disponível nos últimos 5 dias)</li>
          <li><strong>Após ativar assinatura:</strong> Todos os dados serão restaurados automaticamente</li>
        </ul>
      </div>

      <div class="info-box">
        <h3>💼 O que será exportado?</h3>
        <ul style="margin: 10px 0;">
          <li>📋 Todos os seus <strong>leads</strong> cadastrados</li>
          <li>🏠 Todos os seus <strong>imóveis</strong></li>
          <li>👥 Todos os <strong>proprietários</strong></li>
          <li>💰 Todas as <strong>negociações</strong> em andamento</li>
          <li>📅 Todos os <strong>agendamentos</strong> de visitas</li>
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Os arquivos serão enviados por email em formato CSV (compatível com Excel e planilhas).
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:contato@integrius.com.br?subject=Ativar%20Assinatura%20ImobiFlow" class="cta-button">
          💚 Ativar Minha Assinatura Agora
        </a>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center;">
        Dúvidas? Entre em contato: <strong>contato@integrius.com.br</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Gestão Imobiliária Inteligente
      </p>
      <p style="margin: 0; font-size: 12px;">
        Este é um email automático de sistema.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `⏰ Seu período trial termina em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} - ${nomeTenant}`,
      html
    });
  }

  /**
   * Email URGENTE de aviso 2 dias antes do término do trial
   */
  async sendTrialUrgentWarningEmail(
    email: string,
    nomeUsuario: string,
    nomeTenant: string,
    diasRestantes: number
  ): Promise<boolean> {
    const primeiroNome = nomeUsuario.split(' ')[0];

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
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
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
    .urgent-box {
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
      border-left: 4px solid #DC2626;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border: 2px solid #DC2626;
    }
    .urgent-box h2 {
      margin: 0 0 15px 0;
      color: #DC2626;
      font-size: 22px;
    }
    .highlight {
      background: #DC2626;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 18px;
    }
    .info-box {
      background: #F0F8FF;
      border-left: 4px solid #4A90E2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #2C2C2C;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      color: white;
      text-decoration: none;
      padding: 18px 36px;
      border-radius: 8px;
      font-weight: 700;
      margin: 20px 0;
      text-align: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 10px 0;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 URGENTE: Seu teste expira em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}!</h1>
    </div>

    <div class="content">
      <p style="font-size: 18px; font-weight: 600;">
        Olá, ${primeiroNome}! 👋
      </p>

      <p style="font-size: 16px;">
        Este é um <strong>aviso urgente</strong> sobre o término do seu período de teste no <strong>ImobiFlow</strong> para <strong>${nomeTenant}</strong>.
      </p>

      <div class="urgent-box">
        <h2>⚠️ ATENÇÃO: ÚLTIMA CHANCE!</h2>
        <p style="margin: 0; font-size: 16px;">
          Seu período de teste gratuito termina em apenas <span class="highlight">${diasRestantes} ${diasRestantes === 1 ? 'DIA' : 'DIAS'}</span>!
        </p>
        <p style="margin: 15px 0 0 0; font-weight: 600; color: #DC2626;">
          Após o término, você perderá acesso ao sistema!
        </p>
      </div>

      <div class="info-box">
        <h3>💡 O que você precisa fazer AGORA:</h3>
        <ul>
          <li><strong>📦 Exportar seus dados:</strong> Clique em "Recuperar Dados" no dashboard</li>
          <li><strong>💚 Ativar sua assinatura:</strong> Entre em contato conosco para continuar usando</li>
        </ul>
      </div>

      <div class="info-box">
        <h3>🔒 Proteção dos Seus Dados</h3>
        <p style="margin: 5px 0;">
          Após o término do trial, seus dados ficarão <strong>protegidos por 30 dias</strong>. Durante este período, você pode:
        </p>
        <ul>
          <li>Solicitar exportação de dados em qualquer momento</li>
          <li>Ativar sua assinatura e recuperar tudo automaticamente</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:contato@integrius.com.br?subject=URGENTE%20-%20Ativar%20Assinatura%20ImobiFlow" class="cta-button">
          🚨 ATIVAR MINHA ASSINATURA AGORA
        </a>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
        <strong>Dúvidas ou precisa de ajuda?</strong><br>
        WhatsApp/Email: <strong>contato@integrius.com.br</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Gestão Imobiliária Inteligente
      </p>
      <p style="margin: 0; font-size: 12px;">
        Este é um email automático de sistema. Não perca seus dados!
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `🚨 URGENTE: Seu teste expira em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}! - ${nomeTenant}`,
      html
    });
  }

  /**
   * Email com dados exportados em CSV
   */
  async sendDataExportEmail(
    email: string,
    nomeUsuario: string,
    nomeTenant: string,
    stats: {
      leads: number;
      imoveis: number;
      proprietarios: number;
      negociacoes: number;
      agendamentos: number;
    },
    diasRestantes: number,
    attachments: any[]
  ): Promise<boolean> {
    const primeiroNome = nomeUsuario.split(' ')[0];
    const totalRegistros = stats.leads + stats.imoveis + stats.proprietarios + stats.negociacoes + stats.agendamentos;

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
    .success-box {
      background: linear-gradient(135deg, #D4EDDA 0%, #C3E6CB 100%);
      border-left: 4px solid #28A745;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
    }
    .success-box h2 {
      margin: 0 0 10px 0;
      color: #155724;
      font-size: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 25px 0;
    }
    .stat-card {
      background: #F8F9FA;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #E9ECEF;
    }
    .stat-number {
      font-size: 32px;
      font-weight: 800;
      color: #8FD14F;
      margin: 0;
    }
    .stat-label {
      font-size: 14px;
      color: #6C757D;
      margin: 5px 0 0 0;
    }
    .info-box {
      background: #FFF3CD;
      border-left: 4px solid #FFC107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Dados Exportados com Sucesso!</h1>
    </div>

    <div class="content">
      <p style="font-size: 18px; font-weight: 600;">
        Olá, ${primeiroNome}! 👋
      </p>

      <div class="success-box">
        <h2>📦 ${totalRegistros} registros exportados</h2>
        <p style="margin: 5px 0 0 0; color: #155724;">
          Seus dados de <strong>${nomeTenant}</strong> estão seguros!
        </p>
      </div>

      <p>
        Conforme solicitado, exportamos todos os dados do seu CRM Integrius e estamos enviando em anexo neste email.
      </p>

      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-number">${stats.leads}</p>
          <p class="stat-label">📋 Leads</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${stats.imoveis}</p>
          <p class="stat-label">🏠 Imóveis</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${stats.proprietarios}</p>
          <p class="stat-label">👥 Proprietários</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${stats.negociacoes}</p>
          <p class="stat-label">💰 Negociações</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${stats.agendamentos}</p>
          <p class="stat-label">📅 Agendamentos</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${totalRegistros}</p>
          <p class="stat-label">✨ Total</p>
        </div>
      </div>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">📌 Importante:</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
          <li>Os arquivos estão em formato <strong>CSV</strong> (compatível com Excel, Google Sheets, etc.)</li>
          <li>Seus dados permanecem disponíveis no sistema por <strong>mais ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}</strong></li>
          <li>Após ativar a assinatura, todos os dados serão restaurados automaticamente</li>
          <li>Guarde este email em local seguro como backup</li>
        </ul>
      </div>

      <p style="font-size: 16px; margin-top: 30px;">
        <strong>💚 Quer continuar usando o ImobiFlow?</strong><br>
        Entre em contato conosco para ativar sua assinatura: <a href="mailto:contato@integrius.com.br">contato@integrius.com.br</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Gestão Imobiliária Inteligente
      </p>
      <p style="margin: 0; font-size: 12px;">
        © 2025 CRM Integrius. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    if (!this.isConfigured) {
      console.warn('SendGrid não configurado - email não enviado');
      return false;
    }

    try {
      const from = `${this.getDefaultFromName()} <${this.getDefaultFrom()}>`;

      await sgMail.send({
        to: email,
        from,
        subject: `📦 Seus dados do ${nomeTenant} - ${totalRegistros} registros exportados`,
        html,
        attachments
      });

      console.log(`✅ Email de exportação enviado para ${email} com ${attachments.length} anexos`);
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar email de exportação:', error.response?.body || error.message);
      throw new Error('Erro ao enviar email de exportação');
    }
  }

  /**
   * Email de boas-vindas ao registrar novo tenant
   */
  async enviarEmailBoasVindasRegistro(data: {
    nomeUsuario: string;
    emailUsuario: string;
    nomeTenant: string;
    dataExpiracao: Date;
  }): Promise<boolean> {
    const primeiroNome = data.nomeUsuario.split(' ')[0];

    const dataFormatada = data.dataExpiracao.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

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
      font-size: 32px;
      font-weight: 800;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 18px;
      opacity: 0.95;
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
      line-height: 1.7;
    }
    .trial-box {
      background: linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%);
      border-left: 4px solid #FFB627;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .trial-box h2 {
      margin: 0 0 15px 0;
      color: #FF9500;
      font-size: 22px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .trial-box .highlight {
      background: #FFB627;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 20px;
    }
    .info-box {
      background: #F0F8FF;
      border-left: 4px solid #4A90E2;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box h3 {
      margin: 0 0 15px 0;
      color: #2C2C2C;
      font-size: 18px;
      font-weight: 700;
    }
    .info-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .info-box li {
      margin: 10px 0;
      color: #555;
      line-height: 1.6;
    }
    .warning-box {
      background: #FFF3CD;
      border-left: 4px solid #FFC107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .warning-box p {
      margin: 5px 0;
      color: #856404;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 700;
      margin: 25px 0;
      text-align: center;
      font-size: 16px;
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo ao ImobiFlow!</h1>
      <p>Gestão Imobiliária Inteligente</p>
    </div>

    <div class="content">
      <p class="greeting">
        Olá, ${primeiroNome}! 👋
      </p>

      <p class="message">
        É um grande prazer ter você e a <strong>${data.nomeTenant}</strong> conosco!
        Bem-vindo à plataforma <strong>ImobiFlow</strong>, seu sistema completo de gestão imobiliária com inteligência artificial.
      </p>

      <p class="message">
        Estamos empolgados em ajudá-lo a transformar a forma como você gerencia leads, imóveis e negociações.
        Com nossas ferramentas, você terá mais eficiência, automação e insights inteligentes para fechar mais negócios!
      </p>

      <div class="trial-box">
        <h2>
          <span>🎁</span>
          Período de Teste Gratuito
        </h2>
        <p style="margin: 10px 0; color: #555; font-size: 16px;">
          Você tem <span class="highlight">14 dias</span> para explorar todas as funcionalidades do ImobiFlow sem nenhum custo!
        </p>
        <p style="margin: 10px 0; color: #666; font-size: 15px;">
          📅 Seu período trial expira em: <strong>${dataFormatada}</strong>
        </p>
      </div>

      <div class="info-box">
        <h3>💳 Como Funcionam os Pagamentos?</h3>
        <ul>
          <li>
            <strong>Durante o trial (14 dias):</strong> Use todas as funcionalidades gratuitamente, sem cartão de crédito!
          </li>
          <li>
            <strong>Antes do último dia:</strong> Informe seus dados de pagamento para continuar usando o sistema.
          </li>
          <li>
            <strong>Cobrança mensal:</strong> Após ativar, cobraremos mensalmente sempre no mesmo dia do seu cadastro.
          </li>
          <li>
            <strong>Sem surpresas:</strong> Você será avisado com antecedência sobre o término do trial e poderá exportar seus dados.
          </li>
        </ul>
      </div>

      <div class="warning-box">
        <p style="font-weight: 600;">
          ⚙️ <strong>Cancelamento Simples e Transparente</strong>
        </p>
        <p>
          Você pode cancelar sua assinatura a qualquer momento através do menu <strong>"Opções"</strong> no painel administrativo.
          Não há taxas de cancelamento ou multas!
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; color: #555; margin-bottom: 15px;">
          Comece agora mesmo a explorar o ImobiFlow:
        </p>
        <a href="https://${data.nomeTenant.toLowerCase().replace(/\s+/g, '')}.integrius.com.br/login" class="cta-button">
          🚀 Acessar Minha Conta
        </a>
      </div>

      <p class="message" style="margin-top: 30px;">
        Se tiver qualquer dúvida ou precisar de ajuda, nossa equipe está à disposição!
      </p>

      <p class="message" style="text-align: center; color: #666;">
        📧 Suporte: <strong>contato@integrius.com.br</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Gestão Imobiliária Inteligente
      </p>
      <p style="margin: 0 0 10px 0;">
        Tecnologia e IA para impulsionar seu negócio imobiliário
      </p>
      <p style="margin: 0; font-size: 12px;">
        © 2025-2026 ImobiFlow. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: data.emailUsuario,
      subject: `🎉 Bem-vindo ao ImobiFlow, ${primeiroNome}! Seu trial de 14 dias começou`,
      html
    });
  }

  /**
   * Email de recuperação de senha com token de 6 dígitos
   */
  async sendPasswordResetEmail(
    email: string,
    nomeUsuario: string,
    nomeTenant: string,
    token: string
  ): Promise<boolean> {
    const primeiroNome = nomeUsuario.split(' ')[0];

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
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
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
    .token-box {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      border: 3px solid #3B82F6;
      padding: 30px;
      margin: 25px 0;
      border-radius: 12px;
      text-align: center;
    }
    .token {
      font-size: 48px;
      font-weight: 900;
      color: #3B82F6;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .warning-box {
      background: #FEF2F2;
      border-left: 4px solid #DC2626;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box {
      background: #F0F8FF;
      border-left: 4px solid #4A90E2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Recuperação de Senha</h1>
    </div>

    <div class="content">
      <p style="font-size: 18px; font-weight: 600;">
        Olá, ${primeiroNome}! 👋
      </p>

      <p>
        Você solicitou a recuperação de senha para sua conta no <strong>ImobiFlow</strong> (<strong>${nomeTenant}</strong>).
      </p>

      <div class="token-box">
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #4B5563; font-weight: 600;">
          Seu código de verificação é:
        </p>
        <div class="token">${token}</div>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #6B7280;">
          ⏰ Este código expira em <strong>5 minutos</strong>
        </p>
      </div>

      <div class="info-box">
        <p style="margin: 0; font-size: 14px;">
          <strong>✅ Como usar:</strong>
        </p>
        <ol style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
          <li>Volte para a página de recuperação de senha</li>
          <li>Digite o código acima</li>
          <li>Crie sua nova senha</li>
        </ol>
      </div>

      <div class="warning-box">
        <p style="margin: 0; font-size: 14px; color: #DC2626; font-weight: 600;">
          ⚠️ <strong>Atenção:</strong>
        </p>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
          <li>Se você não solicitou esta recuperação, ignore este email</li>
          <li>Nunca compartilhe este código com ninguém</li>
          <li>Este código só funciona uma vez</li>
        </ul>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
        <strong>Precisa de ajuda?</strong><br>
        Entre em contato: <strong>contato@integrius.com.br</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Gestão Imobiliária Inteligente
      </p>
      <p style="margin: 0; font-size: 12px;">
        Este é um email automático de segurança. Não responda.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `🔐 Código de recuperação de senha: ${token} - ${nomeTenant}`,
      html
    });
  }
}

// Singleton
export const sendGridService = new SendGridService();
