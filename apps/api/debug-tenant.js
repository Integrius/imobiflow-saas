const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTenant() {
  console.log('🔍 Buscando tenant Vivoly...\n');

  // 1. Buscar por slug
  const bySlug = await prisma.tenant.findUnique({
    where: { slug: 'vivoly' }
  });

  // 2. Buscar por subdominio
  const bySubdominio = await prisma.tenant.findUnique({
    where: { subdominio: 'vivoly' }
  });

  // 3. Listar todos
  const all = await prisma.tenant.findMany({
    select: { id: true, nome: true, slug: true, subdominio: true }
  });

  console.log('📋 Busca por slug="vivoly":', bySlug ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
  if (bySlug) {
    console.log('   ID:', bySlug.id);
    console.log('   Nome:', bySlug.nome);
    console.log('   Slug:', bySlug.slug);
    console.log('   Subdomínio:', bySlug.subdominio);
  }

  console.log('\n📋 Busca por subdominio="vivoly":', bySubdominio ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
  if (bySubdominio) {
    console.log('   ID:', bySubdominio.id);
    console.log('   Nome:', bySubdominio.nome);
    console.log('   Slug:', bySubdominio.slug);
    console.log('   Subdomínio:', bySubdominio.subdominio);
  }

  console.log('\n📋 Todos os tenants:');
  all.forEach(t => {
    console.log(`   - ${t.nome}`);
    console.log(`     Slug: "${t.slug}"`);
    console.log(`     Subdomínio: "${t.subdominio || 'null'}"`);
    console.log('');
  });

  await prisma.$disconnect();
}

debugTenant();
