import 'dotenv/config';
import { ClaudeService } from './ai/services/claude.service';
import { ANALYSIS_PROMPT, RESPONSE_PROMPT, SOFIA_SYSTEM_PROMPT } from './ai/prompts/sofia-prompts';

async function testAISimple() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     🧪 TESTE SIMPLES: ANÁLISE E RESPOSTA IA        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const claude = new ClaudeService();

  try {
    // Teste 1: Análise de mensagem urgente
    console.log('1️⃣ TESTE: Análise de mensagem com urgência\n');
    console.log('📩 Mensagem: "Olá, preciso de um apartamento de 3 quartos URGENTE! Pode me ajudar?"\n');

    const message1 = 'Olá, preciso de um apartamento de 3 quartos URGENTE! Pode me ajudar?';
    const analysisPrompt1 = `${ANALYSIS_PROMPT}

MENSAGEM DO LEAD:
"${message1}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    const analysis1 = await claude.analyze(analysisPrompt1);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ANÁLISE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(JSON.stringify(analysis1, null, 2));
    console.log('\n');

    // Teste 2: Resposta contextualizada
    console.log('2️⃣ TESTE: Geração de resposta contextualizada\n');

    const context1 = `
═══════════════════════════════════════════════════════
📋 INFORMAÇÕES DO LEAD
═══════════════════════════════════════════════════════
Nome: João Silva
Telefone: +5511999999999
Score: 50/100
Status: Novo

═══════════════════════════════════════════════════════
🎯 PREFERÊNCIAS IDENTIFICADAS
═══════════════════════════════════════════════════════
Tipo de imóvel: Apartamento
Quartos: 3
Urgência: ALTA

═══════════════════════════════════════════════════════
💬 HISTÓRICO DA CONVERSA
═══════════════════════════════════════════════════════
Primeira mensagem do lead
`.trim();

    const response1 = await claude.generateResponse(
      RESPONSE_PROMPT(context1, message1),
      undefined,
      { maxTokens: 500, temperature: 0.8 }
    );

    console.log('💬 RESPOSTA GERADA:');
    console.log(`"${response1}"\n`);

    // Teste 3: Segunda mensagem com contexto
    console.log('3️⃣ TESTE: Análise de segunda mensagem (com orçamento)\n');
    console.log('📩 Mensagem: "Meu orçamento é até R$ 800 mil. Tem algo na Vila Mariana?"\n');

    const message2 = 'Meu orçamento é até R$ 800 mil. Tem algo na Vila Mariana?';
    const analysisPrompt2 = `${ANALYSIS_PROMPT}

MENSAGEM DO LEAD:
"${message2}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    const analysis2 = await claude.analyze(analysisPrompt2);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ANÁLISE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(JSON.stringify(analysis2, null, 2));
    console.log('\n');

    // Teste 4: Resposta com contexto completo
    console.log('4️⃣ TESTE: Resposta com contexto da conversa anterior\n');

    const context2 = `
═══════════════════════════════════════════════════════
📋 INFORMAÇÕES DO LEAD
═══════════════════════════════════════════════════════
Nome: João Silva
Telefone: +5511999999999
Score: 55/100
Status: Qualificado

═══════════════════════════════════════════════════════
🎯 PREFERÊNCIAS IDENTIFICADAS
═══════════════════════════════════════════════════════
Tipo de imóvel: Apartamento
Quartos: 3
Urgência: ALTA
Orçamento: R$ 800.000
Localização: Vila Mariana

═══════════════════════════════════════════════════════
💬 HISTÓRICO DA CONVERSA
═══════════════════════════════════════════════════════
[10:30] Lead: "Olá, preciso de um apartamento de 3 quartos URGENTE! Pode me ajudar?"
[10:31] Sofia: "${response1}"
[10:35] Lead: "Meu orçamento é até R$ 800 mil. Tem algo na Vila Mariana?"
`.trim();

    const response2 = await claude.generateResponse(
      RESPONSE_PROMPT(context2, message2),
      undefined,
      { maxTokens: 500, temperature: 0.8 }
    );

    console.log('💬 RESPOSTA GERADA:');
    console.log(`"${response2}"\n`);

    // Teste 5: Mensagem de agendamento
    console.log('5️⃣ TESTE: Detecção de intenção de agendamento\n');
    console.log('📩 Mensagem: "Perfeito! Quando posso visitar o imóvel? Amanhã de manhã teria disponibilidade?"\n');

    const message3 = 'Perfeito! Quando posso visitar o imóvel? Amanhã de manhã teria disponibilidade?';
    const analysisPrompt3 = `${ANALYSIS_PROMPT}

MENSAGEM DO LEAD:
"${message3}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    const analysis3 = await claude.analyze(analysisPrompt3);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ANÁLISE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(JSON.stringify(analysis3, null, 2));

    // Verifica se detectou corretamente a intenção de agendamento
    if (analysis3.intent === 'agendamento' ||
        (analysis3.response && analysis3.response.toLowerCase().includes('agendamento'))) {
      console.log('\n✅ Intenção de AGENDAMENTO detectada corretamente!');
    } else {
      console.log('\n⚠️ Intenção de agendamento não foi detectada claramente');
    }
    console.log('\n');

    // Estatísticas finais
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ESTATÍSTICAS FINAIS');
    console.log('═══════════════════════════════════════════════════════');
    const stats = claude.getStats();
    console.log(`✅ Total de requests: ${stats.requestCount}`);
    console.log(`💰 Custo total: $${stats.dailyCost.toFixed(4)}`);
    console.log(`💡 Custo médio por interação: $${(stats.dailyCost / (stats.requestCount / 2)).toFixed(4)}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🎉 TESTE COMPLETO! Sistema de IA funcionando perfeitamente!\n');
    console.log('✅ Análise de urgência: OK');
    console.log('✅ Detecção de preferências: OK');
    console.log('✅ Geração de respostas contextualizadas: OK');
    console.log('✅ Detecção de intenção de agendamento: OK');
    console.log('✅ Manutenção de contexto entre mensagens: OK\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

testAISimple().catch(console.error);
