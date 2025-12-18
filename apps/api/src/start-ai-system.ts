import 'dotenv/config';
import { AIOrchestrator } from './ai/orchestrator.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║                                                      ║');
  console.log('║         🏠 VIVOLY BI + IA SYSTEM                    ║');
  console.log('║         Assistente Inteligente Sofia                ║');
  console.log('║                                                      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log();

  const orchestrator = new AIOrchestrator();

  // Handlers de shutdown gracioso
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n\n⚠️ Recebido sinal ${signal}, desligando...`);
    await orchestrator.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Inicializa o sistema
  try {
    await orchestrator.initialize();

    // Exibe estatísticas iniciais
    const stats = await orchestrator.getSystemStats();

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ESTATÍSTICAS INICIAIS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👥 Total de leads: ${stats.leads.total}`);
    console.log(`🟢 Leads ativos (7 dias): ${stats.leads.active}`);
    console.log(`🔥 Leads quentes (score ≥80): ${stats.leads.hot}`);
    console.log(`💬 Total de mensagens: ${stats.messages.total}`);
    console.log(`📱 WhatsApp: ${stats.whatsapp.ready ? '✅ Conectado' : '⏳ Aguardando'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🎯 Sistema ativo! Aguardando mensagens...');
    console.log('💡 Pressione Ctrl+C para desligar\n');

    // Exibe estatísticas a cada 5 minutos
    setInterval(async () => {
      const currentStats = await orchestrator.getSystemStats();
      console.log('\n📊 Estatísticas (5min):');
      console.log(`   AI Requests: ${currentStats.ai.requests}`);
      console.log(`   AI Cost: $${currentStats.ai.cost.toFixed(4)}`);
      console.log(`   Leads ativos: ${currentStats.leads.active}`);
    }, 5 * 60 * 1000);

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('\n💡 Verifique:');
    console.error('   1. Variáveis de ambiente (.env)');
    console.error('   2. Conexão com banco de dados');
    console.error('   3. ANTHROPIC_API_KEY configurada');
    console.error('   4. WhatsApp Web conectado\n');
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error: any) => {
  console.error('\n❌ Erro não tratado:', error);
});

process.on('uncaughtException', (error: any) => {
  console.error('\n❌ Exceção não capturada:', error);
  process.exit(1);
});

// Inicia o sistema
main();
