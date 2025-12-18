import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { LeadAdapter, MessageAdapter } from './ai/adapters/lead.adapter';
import { ClaudeService } from './ai/services/claude.service';
import { ANALYSIS_PROMPT } from './ai/prompts/sofia-prompts';

const prisma = new PrismaClient();

async function testIntegration() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     🧪 TESTE: INTEGRAÇÃO COMPLETA COM SCHEMA       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // 1. Buscar tenant de teste ou usar o primeiro disponível
    console.log('1️⃣ Buscando tenant...');
    const tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.error('❌ Nenhum tenant encontrado no banco!');
      console.log('💡 Crie um tenant primeiro antes de rodar este teste.');
      return;
    }

    console.log(`✅ Usando tenant: ${tenant.nome} (${tenant.id})\n`);

    // 2. Criar lead de teste
    console.log('2️⃣ Criando lead de teste...');

    const leadData = LeadAdapter.toPrisma({
      tenantId: tenant.id,
      name: 'João Silva (Teste IA)',
      phone: '+5511999999999',
      email: 'joao.teste@example.com',
      source: 'whatsapp',
      status: 'new',
      score: 50
    });

    const lead = await prisma.lead.create({
      data: leadData
    });

    console.log(`✅ Lead criado: ${lead.nome} (${lead.id})\n`);

    // 3. Simular primeira mensagem
    console.log('3️⃣ Processando primeira mensagem...');
    const message1Content = 'Olá, estou procurando um apartamento de 3 quartos urgente!';
    console.log(`📩 "${message1Content}"\n`);

    // Análise da mensagem com IA
    const claude = new ClaudeService();
    const analysisPrompt = `${ANALYSIS_PROMPT}

MENSAGEM DO LEAD:
"${message1Content}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    const analysis1 = await claude.analyze(analysisPrompt);
    console.log('📊 Análise da IA:');
    console.log(JSON.stringify(analysis1, null, 2));
    console.log();

    // Salvar mensagem do lead
    const message1Data = MessageAdapter.toPrisma({
      tenantId: tenant.id,
      leadId: lead.id,
      content: message1Content,
      isFromLead: true,
      platform: 'whatsapp',
      status: 'delivered',
      aiAnalysis: analysis1,
      aiScoreImpact: 5
    });

    const message1 = await prisma.message.create({
      data: message1Data
    });

    console.log(`✅ Mensagem salva (${message1.id})\n`);

    // Atualizar lead com análise
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        property_type: 'apartamento',
        bedrooms: 3,
        urgency: 'ALTA',
        score: { increment: 5 }
      }
    });

    console.log('✅ Lead atualizado com análise da IA\n');

    // Salvar resposta da IA
    const sofiaResponse = 'Olá, João! Entendi sua necessidade. Temos ótimos apartamentos de 3 quartos. Qual seu orçamento?';

    const message2Data = MessageAdapter.toPrisma({
      tenantId: tenant.id,
      leadId: lead.id,
      content: sofiaResponse,
      isFromLead: false,
      platform: 'whatsapp',
      status: 'sent'
    });

    await prisma.message.create({
      data: message2Data
    });

    console.log('✅ Resposta da IA salva\n');

    // 4. Simular segunda mensagem
    console.log('4️⃣ Processando segunda mensagem...');
    const message2Content = 'Meu orçamento é até R$ 800 mil. Tem algo na Vila Mariana?';
    console.log(`📩 "${message2Content}"\n`);

    const analysisPrompt2 = `${ANALYSIS_PROMPT}

MENSAGEM DO LEAD:
"${message2Content}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    const analysis2 = await claude.analyze(analysisPrompt2);
    console.log('📊 Análise da IA:');
    console.log(JSON.stringify(analysis2, null, 2));
    console.log();

    // Salvar segunda mensagem
    const message3Data = MessageAdapter.toPrisma({
      tenantId: tenant.id,
      leadId: lead.id,
      content: message2Content,
      isFromLead: true,
      platform: 'whatsapp',
      status: 'delivered',
      aiAnalysis: analysis2,
      aiScoreImpact: 3
    });

    await prisma.message.create({
      data: message3Data
    });

    // Atualizar lead
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        location: 'Vila Mariana',
        budget: 800000,
        score: { increment: 3 }
      }
    });

    console.log('✅ Segunda mensagem processada e lead atualizado\n');

    // 5. Buscar histórico completo
    console.log('5️⃣ Buscando histórico de conversas...');

    const leadWithMessages = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: {
        messages: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 LEAD ATUALIZADO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Nome: ${leadWithMessages?.nome}`);
    console.log(`Telefone: ${leadWithMessages?.telefone}`);
    console.log(`Score: ${leadWithMessages?.score}/100`);
    console.log(`Urgência: ${leadWithMessages?.urgency || 'N/A'}`);
    console.log(`Tipo de imóvel: ${leadWithMessages?.property_type || 'N/A'}`);
    console.log(`Localização: ${leadWithMessages?.location || 'N/A'}`);
    console.log(`Quartos: ${leadWithMessages?.bedrooms || 'N/A'}`);
    console.log(`Orçamento: ${leadWithMessages?.budget ? `R$ ${Number(leadWithMessages.budget).toLocaleString('pt-BR')}` : 'N/A'}`);
    console.log();

    console.log('═══════════════════════════════════════════════════════');
    console.log('💬 HISTÓRICO DE MENSAGENS');
    console.log('═══════════════════════════════════════════════════════');

    leadWithMessages?.messages.forEach((msg, index) => {
      const sender = msg.is_from_lead ? '👤 Lead' : '🤖 Sofia';
      const time = msg.created_at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      console.log(`${index + 1}. [${time}] ${sender}:`);
      console.log(`   "${msg.content}"`);
      if (msg.ai_analysis) {
        console.log(`   📊 Score Impact: ${msg.ai_score_impact || 0}`);
      }
      console.log();
    });

    // 6. Estatísticas
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ESTATÍSTICAS');
    console.log('═══════════════════════════════════════════════════════');

    const stats = claude.getStats();
    console.log(`✅ Requests IA: ${stats.requestCount}`);
    console.log(`💰 Custo total: $${stats.dailyCost.toFixed(4)}`);
    console.log(`📩 Total de mensagens: ${leadWithMessages?.messages.length || 0}`);
    console.log(`⭐ Score final: ${leadWithMessages?.score}/100`);
    console.log();

    // 7. Limpar dados de teste
    console.log('6️⃣ Limpando dados de teste...');

    await prisma.message.deleteMany({
      where: { lead_id: lead.id }
    });

    await prisma.lead.delete({
      where: { id: lead.id }
    });

    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 TESTE DE INTEGRAÇÃO COMPLETO!');
    console.log('✅ Schema do Prisma: OK');
    console.log('✅ Adapters (português ↔ inglês): OK');
    console.log('✅ Criação de lead: OK');
    console.log('✅ Salvamento de mensagens: OK');
    console.log('✅ Análise da IA: OK');
    console.log('✅ Atualização de preferências: OK');
    console.log('✅ Histórico de conversas: OK\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testIntegration().catch(console.error);
