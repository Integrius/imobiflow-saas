import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { MessageProcessorService } from './ai/services/message-processor.service';
import { ContextBuilderService } from './ai/services/context-builder.service';

const prisma = new PrismaClient();

async function testMessageFlow() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     🧪 TESTE: FLUXO COMPLETO DE MENSAGENS          ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // 1. Cria um lead de teste
    console.log('1️⃣ Criando lead de teste...');
    const testLead = await prisma.lead.create({
      data: {
        name: 'João Silva (Teste)',
        phone: '+5511999999999',
        source: 'whatsapp',
        status: 'new',
        score: 50,
        urgency: 'média',
        sentiment: 'neutro'
      }
    });
    console.log(`✅ Lead criado: ${testLead.id}\n`);

    // 2. Simula primeira mensagem
    console.log('2️⃣ Processando primeira mensagem...');
    console.log('📩 Mensagem: "Olá, estou procurando um apartamento de 3 quartos urgente!"\n');

    const processor = new MessageProcessorService();
    const result1 = await processor.processMessage(
      testLead.id,
      'Olá, estou procurando um apartamento de 3 quartos urgente!'
    );

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESULTADO DA ANÁLISE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎯 Urgência:', result1.analysis.urgency);
    console.log('💡 Intenção:', result1.analysis.intent);
    console.log('😊 Sentimento:', result1.analysis.sentiment);
    console.log('🏠 Tipo de imóvel:', result1.analysis.preferences.property_type || 'N/A');
    console.log('🛏️ Quartos:', result1.analysis.preferences.bedrooms || 'N/A');
    console.log('⭐ Score atualizado:', result1.scoreUpdate);
    console.log('📢 Notificar corretor?', result1.shouldNotifyBroker ? 'SIM' : 'NÃO');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('💬 RESPOSTA GERADA:');
    console.log(`"${result1.response}"\n`);

    // 3. Simula segunda mensagem (com contexto)
    console.log('3️⃣ Processando segunda mensagem (com contexto)...');
    console.log('📩 Mensagem: "Meu orçamento é até R$ 800 mil. Tem algo na Vila Mariana?"\n');

    const result2 = await processor.processMessage(
      testLead.id,
      'Meu orçamento é até R$ 800 mil. Tem algo na Vila Mariana?'
    );

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SEGUNDA ANÁLISE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎯 Urgência:', result2.analysis.urgency);
    console.log('💰 Orçamento mencionado?', result2.analysis.budget_mentioned ? 'SIM' : 'NÃO');
    console.log('📍 Localização:', result2.analysis.preferences.location || 'N/A');
    console.log('💵 Orçamento:', result2.analysis.preferences.budget_max ?
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        .format(result2.analysis.preferences.budget_max) : 'N/A');
    console.log('⭐ Score atualizado:', result2.scoreUpdate);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('💬 RESPOSTA GERADA:');
    console.log(`"${result2.response}"\n`);

    // 4. Testa o ContextBuilder
    console.log('4️⃣ Testando ContextBuilder...');
    const contextBuilder = new ContextBuilderService();
    const context = await contextBuilder.buildContext(testLead.id);

    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CONTEXTO CONSTRUÍDO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(contextBuilder.formatContextForPrompt(context));
    console.log('\n');

    // 5. Exibe histórico de mensagens
    console.log('5️⃣ Histórico de mensagens salvas:');
    const messages = await prisma.message.findMany({
      where: { leadId: testLead.id },
      orderBy: { createdAt: 'asc' }
    });

    messages.forEach((msg, index) => {
      const sender = msg.isFromLead ? '👤 Lead' : '🤖 Sofia';
      console.log(`   ${index + 1}. ${sender}: "${msg.content}"`);
    });
    console.log();

    // 6. Estatísticas finais
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ESTATÍSTICAS FINAIS');
    console.log('═══════════════════════════════════════════════════════');
    const stats = processor.getStats();
    console.log(`✅ Total de requests AI: ${stats.requestCount}`);
    console.log(`💰 Custo total: $${stats.dailyCost.toFixed(4)}`);
    console.log(`💡 Custo médio por mensagem: $${(stats.dailyCost / stats.requestCount).toFixed(4)}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // 7. Limpa dados de teste
    console.log('6️⃣ Limpando dados de teste...');
    await prisma.message.deleteMany({
      where: { leadId: testLead.id }
    });
    await prisma.lead.delete({
      where: { id: testLead.id }
    });
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 TESTE COMPLETO! Todos os serviços funcionando!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testMessageFlow().catch(console.error);
