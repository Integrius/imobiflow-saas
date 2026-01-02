const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenant() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'vivoly' }
  });

  if (tenant) {
    console.log('✅ Tenant encontrado:');
    console.log('ID:', tenant.id);
    console.log('Nome:', tenant.nome);
    console.log('Slug:', tenant.slug);
    console.log('Subdomínio:', tenant.subdominio);
  } else {
    console.log('❌ Tenant com slug "vivoly" NÃO encontrado');

    // Buscar todos os tenants para verificar
    const allTenants = await prisma.tenant.findMany({
      select: { id: true, nome: true, slug: true, subdominio: true }
    });

    console.log('\n📋 Todos os tenants:');
    allTenants.forEach(t => {
      console.log(`  - Nome: ${t.nome}, Slug: ${t.slug}, Subdomínio: ${t.subdominio || 'null'}`);
    });
  }

  await prisma.$disconnect();
}

checkTenant();
