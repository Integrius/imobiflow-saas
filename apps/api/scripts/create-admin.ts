import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2] || 'admin@vivoly.com.br';
  const senha = process.argv[3] || 'Admin@2025';
  const tenantSlug = process.argv[4] || 'vivoly';

  console.log(`\n🔧 Criando usuário administrativo...\n`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Senha: ${senha}`);
  console.log(`🏢 Tenant: ${tenantSlug}\n`);

  // Buscar tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug }
  });

  if (!tenant) {
    console.error(`❌ Tenant "${tenantSlug}" não encontrado!`);
    process.exit(1);
  }

  // Verificar se usuário já existe
  const existing = await prisma.user.findFirst({
    where: { email }
  });

  if (existing) {
    console.log(`⚠️  Usuário ${email} já existe`);
    console.log(`   Atualizando senha...`);

    const senhaHash = await bcrypt.hash(senha, 10);

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        senha_hash: senhaHash,
        tipo: 'ADMIN',
        ativo: true
      }
    });

    console.log(`✅ Senha atualizada com sucesso!\n`);
  } else {
    console.log(`🔧 Criando novo usuário...`);

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        email,
        nome: 'Administrador',
        senha_hash: senhaHash,
        tipo: 'ADMIN',
        ativo: true,
        tenant_id: tenant.id
      }
    });

    console.log(`✅ Usuário criado com sucesso!\n`);
  }

  console.log(`📋 Credenciais de acesso:`);
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${senha}`);
  console.log(`   URL: https://${tenant.subdominio}.integrius.com.br/login\n`);

  await prisma.$disconnect();
}

createAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
