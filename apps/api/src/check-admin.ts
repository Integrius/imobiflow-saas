import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Verificando usuário admin@imobiflow.com...\n');

    const user = await prisma.user.findFirst({
      where: { email: 'admin@imobiflow.com' },
      select: {
        id: true,
        email: true,
        tipo: true,
        ativo: true,
        created_at: true,
        tenant_id: true,
        senha_hash: true,
        google_id: true
      }
    });

    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Tipo:', user.tipo);
      console.log('Ativo:', user.ativo);
      console.log('Tenant ID:', user.tenant_id);
      console.log('Criado em:', user.created_at);
      console.log('Google ID:', user.google_id || 'null');
      console.log('Tem senha_hash?', user.senha_hash ? 'SIM ✅' : 'NÃO ❌');
      if (user.senha_hash) {
        console.log('Hash (primeiros 20 chars):', user.senha_hash.substring(0, 20) + '...');
      }
    } else {
      console.log('❌ Usuário admin@imobiflow.com NÃO encontrado!');
      console.log('\n📋 Listando todos os usuários:');

      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          tipo: true,
          ativo: true,
        },
        take: 10
      });

      console.table(allUsers);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAdmin();
