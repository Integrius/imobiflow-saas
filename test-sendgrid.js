/**
 * Script de teste para verificar envio de email via SendGrid
 *
 * Execute com: node test-sendgrid.js SEU_EMAIL@EXEMPLO.COM
 */

const sgMail = require('@sendgrid/mail');

// Verificar se foi passado um email como argumento
const emailDestino = process.argv[2];

if (!emailDestino) {
  console.error('❌ Erro: Você precisa passar um email como argumento');
  console.log('Uso: node test-sendgrid.js seu@email.com');
  process.exit(1);
}

// Configurar API Key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.error('❌ Erro: SENDGRID_API_KEY não configurada');
  console.log('Configure com: export SENDGRID_API_KEY=SG.sua_chave_aqui');
  process.exit(1);
}

sgMail.setApiKey(apiKey);

// Email de teste
const msg = {
  to: emailDestino,
  from: {
    email: 'noreply@integrius.com.br',
    name: 'ImobiFlow'
  },
  subject: '🎉 Teste de Email - ImobiFlow',
  html: `
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
    .success-badge {
      background: #DFF9C7;
      border-left: 4px solid #8FD14F;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .footer {
      background: #F4E2CE;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏡 ImobiFlow</h1>
    </div>

    <div class="content">
      <h2 style="color: #2C2C2C; margin-top: 0;">✅ Email de Teste</h2>

      <p style="font-size: 16px; color: #555;">
        Parabéns! Se você está recebendo este email, significa que sua integração com o SendGrid está funcionando perfeitamente!
      </p>

      <div class="success-badge">
        <h3 style="margin: 0 0 10px 0; color: #2C2C2C;">🎯 Configuração Completa</h3>
        <p style="margin: 5px 0; color: #555;"><strong>✓</strong> API Key configurada</p>
        <p style="margin: 5px 0; color: #555;"><strong>✓</strong> Domínio verificado</p>
        <p style="margin: 5px 0; color: #555;"><strong>✓</strong> Envio de emails ativo</p>
      </div>

      <p style="font-size: 16px; color: #555;">
        Agora você pode enviar emails de boas-vindas para leads, sugestões de imóveis e muito mais!
      </p>

      <p style="font-size: 14px; color: #999; margin-top: 30px;">
        <em>Este é um email de teste automático gerado em ${new Date().toLocaleString('pt-BR')}</em>
      </p>
    </div>

    <div class="footer">
      <p><strong>ImobiFlow</strong></p>
      <p>Tecnologia e inteligência para encontrar o imóvel perfeito</p>
    </div>
  </div>
</body>
</html>
  `.trim()
};

// Enviar email
console.log('📧 Enviando email de teste...');
console.log(`📨 Destinatário: ${emailDestino}`);
console.log(`📤 Remetente: noreply@integrius.com.br`);
console.log('');

sgMail.send(msg)
  .then(() => {
    console.log('✅ Email enviado com sucesso!');
    console.log('');
    console.log('📬 Verifique sua caixa de entrada (e spam) em alguns segundos');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao enviar email:');
    console.error('');

    if (error.response) {
      console.error('Status:', error.response.statusCode);
      console.error('Corpo:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error.message);
    }

    console.error('');
    console.error('💡 Dicas:');
    console.error('1. Verifique se o domínio foi autenticado no SendGrid');
    console.error('2. Confirme que a API Key está correta');
    console.error('3. Aguarde alguns minutos para propagação DNS');

    process.exit(1);
  });
