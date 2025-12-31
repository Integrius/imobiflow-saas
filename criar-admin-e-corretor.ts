/**
 * Script para criar usuário ADMIN e Corretor de teste
 * Executa direto no banco de dados via Prisma
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando criação de usuários de teste...\n');

  // 1. Buscar tenant Vivoly
  console.log('📋 PASSO 1: Buscar tenant Vivoly');
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'vivoly' }
  });

  if (!tenant) {
    console.error('❌ Tenant "vivoly" não encontrado!');
    console.log('   Crie o tenant primeiro antes de executar este script.\n');
    return;
  }

  console.log(`✅ Tenant encontrado: ${tenant.nome} (${tenant.id})\n`);

  // 2. Criar usuário ADMIN (se não existir)
  console.log('📋 PASSO 2: Criar usuário ADMIN');

  const adminEmail = 'admin@vivoly.com.br';
  const adminSenha = 'admin123';

  let adminUser = await prisma.user.findUnique({
    where: {
      tenant_id_email: {
        tenant_id: tenant.id,
        email: adminEmail
      }
    }
  });

  if (adminUser) {
    console.log(`⚠️  Usuário ADMIN já existe: ${adminUser.nome}\n`);
  } else {
    const senhaHash = await bcrypt.hash(adminSenha, 10);

    adminUser = await prisma.user.create({
      data: {
        tenant_id: tenant.id,
        nome: 'Admin Vivoly',
        email: adminEmail,
        senha_hash: senhaHash,
        tipo: 'ADMIN',
        primeiro_acesso: false, // Admin já tem senha definida
        ativo: true
      }
    });

    console.log(`✅ Usuário ADMIN criado com sucesso!`);
    console.log(`   Nome: ${adminUser.nome}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminSenha}`);
    console.log(`   Tipo: ${adminUser.tipo}\n`);
  }

  // 3. Criar usuário CORRETOR
  console.log('📋 PASSO 3: Criar usuário CORRETOR de teste');

  const corretorEmail = 'joao.corretor@vivoly.com.br';

  // Verificar se já existe
  let corretorUser = await prisma.user.findUnique({
    where: {
      tenant_id_email: {
        tenant_id: tenant.id,
        email: corretorEmail
      }
    }
  });

  if (corretorUser) {
    console.log(`⚠️  Usuário CORRETOR já existe: ${corretorUser.nome}`);

    // Buscar registro Corretor associado
    const corretorRecord = await prisma.corretor.findUnique({
      where: { user_id: corretorUser.id },
      include: { user: true }
    });

    if (corretorRecord) {
      console.log(`   ID Corretor: ${corretorRecord.id}`);
      console.log(`   CRECI: ${corretorRecord.creci}`);
      console.log(`   Telefone: ${corretorRecord.telefone}\n`);
    }
  } else {
    // Criar user SEM senha (primeiro_acesso = true)
    corretorUser = await prisma.user.create({
      data: {
        tenant_id: tenant.id,
        nome: 'João Corretor Teste',
        email: corretorEmail,
        senha_hash: null, // SEM SENHA inicialmente
        tipo: 'CORRETOR',
        primeiro_acesso: true, // Precisa definir senha no primeiro login
        ativo: true
      }
    });

    console.log(`✅ Usuário CORRETOR criado com sucesso!`);
    console.log(`   Nome: ${corretorUser.nome}`);
    console.log(`   Email: ${corretorEmail}`);
    console.log(`   Tipo: ${corretorUser.tipo}`);
    console.log(`   Primeiro Acesso: ${corretorUser.primeiro_acesso}\n`);

    // 4. Criar registro Corretor
    console.log('📋 PASSO 4: Criar registro Corretor');

    const corretor = await prisma.corretor.create({
      data: {
        user_id: corretorUser.id,
        tenant_id: tenant.id,
        telefone: '11987654321',
        creci: 'CRECI-SP 123456',
        especializacoes: ['Apartamentos', 'Casas'],
        comissao_padrao: 3.5
      }
    });

    console.log(`✅ Registro Corretor criado com sucesso!`);
    console.log(`   ID: ${corretor.id}`);
    console.log(`   CRECI: ${corretor.creci}`);
    console.log(`   Telefone: ${corretor.telefone}`);
    console.log(`   Comissão Padrão: ${corretor.comissao_padrao}%\n`);
  }

  // 5. Resumo Final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ USUÁRIOS CRIADOS COM SUCESSO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔑 USUÁRIO ADMIN:');
  console.log('   URL: https://vivoly.integrius.com.br/login');
  console.log('   Email: admin@vivoly.com.br');
  console.log('   Senha: admin123');
  console.log('   Tipo: ADMIN\n');

  console.log('👤 USUÁRIO CORRETOR (para teste):');
  console.log('   URL: https://vivoly.integrius.com.br/login');
  console.log('   Email: joao.corretor@vivoly.com.br');
  console.log('   Senha: (será definida no primeiro acesso)');
  console.log('   Tipo: CORRETOR\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 PASSOS PARA TESTAR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1️⃣  Acesse: https://vivoly.integrius.com.br/login\n');

  console.log('2️⃣  Faça login como CORRETOR:');
  console.log('    📧 Email: joao.corretor@vivoly.com.br');
  console.log('    🔐 (aguarde redirecionamento)\n');

  console.log('    ⚠️  IMPORTANTE: Como o corretor não tem senha,');
  console.log('    você precisará fazer login via Google OAuth OU');
  console.log('    criar uma senha temporária manualmente.\n');

  console.log('3️⃣  Será redirecionado para /primeiro-acesso\n');

  console.log('4️⃣  Defina uma senha (mínimo 6 caracteres)\n');

  console.log('5️⃣  Veja apenas seus leads e imóveis!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
