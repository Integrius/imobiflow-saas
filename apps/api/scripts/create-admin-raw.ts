/**
 * Script para criar tenant e admin usando SQL raw
 * Bypassa o Prisma em caso de problemas de permissões
 *
 * Executar: npx tsx scripts/create-admin-raw.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminRaw() {
  try {
    console.log('🔧 Criando tenant e admin usando SQL raw...\n');

    // 1. Verificar conexão
    console.log('📡 Testando conexão com banco...');
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Conexão OK\n');

    // 2. Verificar se tenant já existe
    console.log('🔍 Verificando se tenant Vivoly já existe...');
    const existingTenant = await prisma.$queryRaw<any[]>`
      SELECT id, nome, subdominio FROM "Tenant" WHERE slug = 'vivoly' LIMIT 1
    `;

    let tenantId: string;

    if (existingTenant.length > 0) {
      console.log('⚠️  Tenant Vivoly já existe!');
      console.log(`   ID: ${existingTenant[0].id}`);
      console.log(`   Nome: ${existingTenant[0].nome}`);
      console.log(`   Subdomínio: ${existingTenant[0].subdominio}\n`);
      tenantId = existingTenant[0].id;
    } else {
      // 3. Criar tenant
      console.log('📦 Criando tenant Vivoly...');
      const newTenant = await prisma.$queryRaw<any[]>`
        INSERT INTO "Tenant" (
          id, nome, slug, subdominio, email, telefone,
          plano, status, limite_usuarios, limite_imoveis,
          total_usuarios, total_imoveis, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          'Vivoly Imobiliária',
          'vivoly',
          'vivoly',
          'contato@vivoly.com.br',
          '11999999999',
          'PRO',
          'ATIVO',
          10,
          500,
          1,
          0,
          NOW(),
          NOW()
        )
        RETURNING id, nome, subdominio
      ` as any[];

      tenantId = newTenant[0].id;
      console.log('✅ Tenant criado!');
      console.log(`   ID: ${tenantId}`);
      console.log(`   Nome: ${newTenant[0].nome}`);
      console.log(`   Subdomínio: ${newTenant[0].subdominio}\n`);
    }

    // 4. Verificar se admin já existe
    console.log('🔍 Verificando se admin já existe...');
    const existingAdmin = await prisma.$queryRaw<any[]>`
      SELECT id, email FROM "User"
      WHERE tenant_id = ${tenantId}::uuid
      AND email = 'admin@vivoly.com'
      LIMIT 1
    `;

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin já existe!');
      console.log(`   Email: ${existingAdmin[0].email}\n`);
    } else {
      // 5. Criar usuário admin
      console.log('👤 Criando usuário ADMIN...');
      const senhaHash = await bcrypt.hash('admin123', 10);

      await prisma.$executeRaw`
        INSERT INTO "User" (
          id, tenant_id, nome, email, senha_hash, tipo, ativo,
          status_conta, primeiro_acesso, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${tenantId}::uuid,
          'Administrador Vivoly',
          'admin@vivoly.com',
          ${senhaHash},
          'ADMIN',
          true,
          'ATIVO',
          false,
          NOW(),
          NOW()
        )
      `;

      console.log('✅ ADMIN criado com sucesso!\n');
    }

    // 6. Verificar resultado
    console.log('📊 Resumo final:');
    const users = await prisma.$queryRaw<any[]>`
      SELECT u.nome, u.email, u.tipo
      FROM "User" u
      WHERE u.tenant_id = ${tenantId}::uuid
    `;

    console.log(`   Tenant ID: ${tenantId}`);
    console.log(`   Usuários criados: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.tipo})`);
    });

    console.log('\n🎉 Setup concluído com sucesso!\n');
    console.log('🔑 Credenciais de acesso:');
    console.log('   URL: https://vivoly.integrius.com.br');
    console.log('   Email: admin@vivoly.com');
    console.log('   Senha: admin123\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminRaw()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
