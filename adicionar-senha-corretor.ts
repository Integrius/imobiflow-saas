/**
 * Script para adicionar senha temporária ao corretor de teste
 * Para permitir login via email/senha (não apenas Google OAuth)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔑 Adicionando senha temporária ao corretor...\n');

  const email = 'joao.corretor@vivoly.com.br';
  const senhaTemporaria = 'corretor123'; // Senha temporária para o primeiro login

  // Buscar usuário
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    console.error('❌ Usuário não encontrado!');
    return;
  }

  console.log(`✅ Usuário encontrado: ${user.nome}`);
  console.log(`   Email: ${email}`);
  console.log(`   Tipo: ${user.tipo}`);
  console.log(`   Primeiro Acesso: ${user.primeiro_acesso}\n`);

  // Criar hash da senha
  const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

  // Atualizar usuário com senha, mas manter primeiro_acesso = true
  await prisma.user.update({
    where: { id: user.id },
    data: {
      senha_hash: senhaHash,
      primeiro_acesso: true // Mantém true para forçar redefinição
    }
  });

  console.log('✅ Senha temporária adicionada com sucesso!\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 CREDENCIAIS PARA TESTE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🌐 URL: https://vivoly.integrius.com.br/login\n');

  console.log('📧 Email: ' + email);
  console.log('🔑 Senha Temporária: ' + senhaTemporaria + '\n');

  console.log('⚠️  IMPORTANTE:');
  console.log('   • Esta senha é TEMPORÁRIA');
  console.log('   • Ao fazer login, você será redirecionado para /primeiro-acesso');
  console.log('   • Defina uma senha permanente (mínimo 6 caracteres)');
  console.log('   • Após definir, primeiro_acesso será alterado para false\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 O QUE VOCÊ VERÁ APÓS LOGIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Dashboard com APENAS seus dados:');
  console.log('   • Leads atribuídos a você');
  console.log('   • Imóveis sob sua responsabilidade');
  console.log('   • Estatísticas dos seus leads\n');

  console.log('❌ Você NÃO verá:');
  console.log('   • Leads de outros corretores');
  console.log('   • Imóveis de outros corretores');
  console.log('   • Opções de criar/deletar imóveis');
  console.log('   • Opções de atribuir leads\n');

  // Verificar se existe registro Corretor
  const corretor = await prisma.corretor.findUnique({
    where: { user_id: user.id }
  });

  if (!corretor) {
    console.log('⚠️  ATENÇÃO: Registro Corretor não encontrado!');
    console.log('   Criando registro agora...\n');

    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'vivoly' }
    });

    if (tenant) {
      const novoCorretor = await prisma.corretor.create({
        data: {
          user_id: user.id,
          tenant_id: tenant.id,
          telefone: '11987654321',
          creci: 'CRECI-SP 123456',
          especializacoes: ['Apartamentos', 'Casas'],
          comissao_padrao: 3.5
        }
      });

      console.log('✅ Registro Corretor criado!');
      console.log(`   ID: ${novoCorretor.id}`);
      console.log(`   CRECI: ${novoCorretor.creci}\n`);
    }
  } else {
    console.log('✅ Registro Corretor existente:');
    console.log(`   ID: ${corretor.id}`);
    console.log(`   CRECI: ${corretor.creci}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 Pronto para testar!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
