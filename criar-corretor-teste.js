/**
 * Script para criar um corretor de teste no ImobiFlow
 *
 * Uso:
 *   node criar-corretor-teste.js
 *
 * Pré-requisitos:
 *   - Ter um usuário ADMIN ou GESTOR criado
 *   - Fazer login para obter o token JWT
 */

const API_URL = 'https://imobiflow-saas-1.onrender.com/api/v1';
const TENANT_SLUG = 'vivoly'; // Subdomínio do tenant

// ===== PASSO 1: FAZER LOGIN COMO ADMIN =====
console.log('📋 PASSO 1: Fazer login como ADMIN/GESTOR\n');

const loginData = {
  email: 'admin@vivoly.com.br', // Altere para seu email de admin
  senha: 'senha123'              // Altere para sua senha
};

console.log('Fazendo login com:', loginData.email);

fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Host': `${TENANT_SLUG}.integrius.com.br`
  },
  body: JSON.stringify(loginData)
})
  .then(res => res.json())
  .then(loginResponse => {
    if (loginResponse.error) {
      console.error('❌ Erro no login:', loginResponse.error);
      console.log('\n💡 Certifique-se de que existe um usuário ADMIN/GESTOR com estas credenciais.');
      console.log('   Você pode criar um via Prisma Studio ou diretamente no banco de dados.\n');
      process.exit(1);
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('   Usuário:', loginResponse.user.nome);
    console.log('   Tipo:', loginResponse.user.tipo);
    console.log('   Token:', loginResponse.token.substring(0, 20) + '...\n');

    const TOKEN = loginResponse.token;

    // ===== PASSO 2: CRIAR CORRETOR DE TESTE =====
    console.log('📋 PASSO 2: Criar corretor de teste\n');

    const corretorData = {
      nome: 'João Corretor Teste',
      email: 'joao.corretor@vivoly.com.br',
      telefone: '11987654321',
      creci: 'CRECI-SP 123456',
      especialidade: 'Apartamentos',
      comissao: 3.5
    };

    console.log('Criando corretor:', corretorData.nome);

    return fetch(`${API_URL}/corretores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Host': `${TENANT_SLUG}.integrius.com.br`,
        'X-Tenant-ID': '' // Será preenchido pelo tenant do subdomínio
      },
      body: JSON.stringify(corretorData)
    });
  })
  .then(res => res.json())
  .then(corretorResponse => {
    if (corretorResponse.error) {
      console.error('❌ Erro ao criar corretor:', corretorResponse.error);

      if (corretorResponse.error.includes('email')) {
        console.log('\n💡 Já existe um corretor com este email.');
        console.log('   Tente usar outro email ou deletar o corretor existente.\n');
      }

      process.exit(1);
    }

    console.log('✅ Corretor criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DADOS DO CORRETOR DE TESTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🆔 ID:', corretorResponse.id);
    console.log('👤 Nome:', corretorResponse.user?.nome);
    console.log('📧 Email:', corretorResponse.user?.email);
    console.log('📱 Telefone:', corretorResponse.telefone);
    console.log('🏅 CRECI:', corretorResponse.creci);
    console.log('🎯 Tipo de Usuário:', corretorResponse.user?.tipo);
    console.log('🔑 Primeiro Acesso:', corretorResponse.user?.primeiro_acesso ? 'SIM ✅' : 'NÃO');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 INSTRUÇÕES PARA TESTAR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1️⃣  Acesse: https://vivoly.integrius.com.br/login\n');

    console.log('2️⃣  Faça login com:');
    console.log('    📧 Email: ' + corretorResponse.user?.email);
    console.log('    🔑 Senha: (será definida no primeiro acesso)\n');

    console.log('3️⃣  Você será redirecionado automaticamente para /primeiro-acesso\n');

    console.log('4️⃣  Defina uma senha (mínimo 6 caracteres)\n');

    console.log('5️⃣  Após definir a senha, você será levado ao dashboard\n');

    console.log('6️⃣  No dashboard, você verá apenas:');
    console.log('    ✓ Leads atribuídos a você');
    console.log('    ✓ Imóveis sob sua responsabilidade');
    console.log('    ✓ Estatísticas dos seus leads\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 PERMISSÕES DO CORRETOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ PODE fazer:');
    console.log('   • Ver e editar seus próprios leads');
    console.log('   • Ver e editar imóveis sob sua responsabilidade');
    console.log('   • Ver estatísticas dos seus leads');
    console.log('   • Adicionar eventos na timeline dos seus leads\n');

    console.log('❌ NÃO PODE fazer:');
    console.log('   • Ver leads de outros corretores');
    console.log('   • Ver imóveis de outros corretores');
    console.log('   • Criar novos imóveis (apenas ADMIN/GESTOR)');
    console.log('   • Deletar imóveis (apenas ADMIN/GESTOR)');
    console.log('   • Atribuir leads para outros corretores (apenas ADMIN/GESTOR)');
    console.log('   • Deletar leads (apenas ADMIN/GESTOR)\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Corretor criado e pronto para teste!\n');
  })
  .catch(error => {
    console.error('❌ Erro inesperado:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('   1. A API está rodando (https://imobiflow-saas-1.onrender.com)');
    console.log('   2. O tenant "vivoly" existe');
    console.log('   3. Você tem conexão com a internet\n');
    process.exit(1);
  });
