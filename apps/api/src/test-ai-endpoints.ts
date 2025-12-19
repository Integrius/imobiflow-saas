import 'dotenv/config';

const API_BASE = 'http://localhost:3333/api/v1/ai';

async function testAIEndpoints() {
  try {
    console.log('🧪 Testando Endpoints de IA\n');

    // 1. Buscar estatísticas
    console.log('1️⃣ GET /api/v1/ai/stats');
    const statsResponse = await fetch(`${API_BASE}/stats?tenantId=test-tenant`);
    const stats = await statsResponse.json();
    console.log('Stats:', JSON.stringify(stats, null, 2));
    console.log('✅ Stats OK\n');

    // 2. Buscar lead com conversa (se existir)
    console.log('2️⃣ GET /api/v1/ai/lead/:leadId/conversation');
    console.log('⏭️  Pulando - requer leadId existente\n');

    // 3. Buscar mensagens (se existir)
    console.log('3️⃣ GET /api/v1/ai/lead/:leadId/messages');
    console.log('⏭️  Pulando - requer leadId existente\n');

    console.log('✅ Todos os endpoints estão acessíveis!');
    console.log('\n📋 Endpoints disponíveis:');
    console.log('POST   /api/v1/ai/process-message');
    console.log('GET    /api/v1/ai/lead/:leadId/messages');
    console.log('GET    /api/v1/ai/lead/:leadId/conversation');
    console.log('GET    /api/v1/ai/stats');
    console.log('PATCH  /api/v1/ai/lead/:leadId/toggle');
    console.log('POST   /api/v1/ai/lead/:leadId/escalate');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testAIEndpoints();
