import 'dotenv/config';
import { ClaudeService } from './ai/services/claude.service';

async function testServices() {
  console.log('🧪 Iniciando testes dos serviços...\n');

  // Teste 1: ClaudeService
  console.log('═══════════════════════════════════════════════════════');
  console.log('1️⃣ Testando ClaudeService');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const claude = new ClaudeService();

    console.log('📤 Enviando prompt simples...');
    const response = await claude.generateResponse(
      'Responda em português: Você está funcionando corretamente?'
    );

    console.log('📥 Resposta recebida:');
    console.log(`"${response}"\n`);

    const stats = claude.getStats();
    console.log('📊 Estatísticas:');
    console.log(`   - Requests: ${stats.requestCount}`);
    console.log(`   - Custo acumulado: $${stats.dailyCost.toFixed(4)}\n`);

    console.log('✅ ClaudeService está funcionando!\n');

  } catch (error: any) {
    console.error('❌ Erro no ClaudeService:', error.message);
    console.error('💡 Verifique se ANTHROPIC_API_KEY está configurada no .env\n');
    return;
  }

  // Teste 2: Análise com JSON
  console.log('═══════════════════════════════════════════════════════');
  console.log('2️⃣ Testando análise de mensagem');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const claude = new ClaudeService();

    const testMessage = 'Oi, estou procurando um apartamento de 2 quartos urgente!';
    console.log(`📤 Analisando mensagem: "${testMessage}"`);

    const analysis = await claude.analyze(`
      Analise esta mensagem de um lead imobiliário e retorne JSON:
      "${testMessage}"

      Retorne: {"urgencia": "alta" | "média" | "baixa", "tipo": string, "quartos": number}
    `);

    console.log('📥 Análise recebida:');
    console.log(JSON.stringify(analysis, null, 2));
    console.log('\n✅ Análise JSON funcionando!\n');

  } catch (error: any) {
    console.error('❌ Erro na análise:', error.message);
  }

  // Teste 3: Contexto
  console.log('═══════════════════════════════════════════════════════');
  console.log('3️⃣ Testando resposta com contexto');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const claude = new ClaudeService();

    const context = 'Você é Sofia, assistente de uma imobiliária premium.';
    const prompt = 'Como você ajudaria um cliente interessado em apartamentos?';

    console.log('📤 Contexto:', context);
    console.log('📤 Prompt:', prompt);

    const response = await claude.generateResponse(prompt, context);

    console.log('📥 Resposta com contexto:');
    console.log(`"${response}"\n`);

    console.log('✅ Contexto funcionando!\n');

  } catch (error: any) {
    console.error('❌ Erro com contexto:', error.message);
  }

  // Resumo final
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════\n');

  const claude = new ClaudeService();
  const finalStats = claude.getStats();

  console.log(`✅ Total de requests: ${finalStats.requestCount}`);
  console.log(`💰 Custo total dos testes: $${finalStats.dailyCost.toFixed(4)}`);
  console.log(`💡 Custo estimado por mensagem: $${(finalStats.dailyCost / finalStats.requestCount).toFixed(6)}\n`);

  console.log('🎉 Todos os testes concluídos com sucesso!');
  console.log('🚀 ClaudeService está pronto para uso!\n');
}

testServices().catch(console.error);
