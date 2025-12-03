#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateMigration() {
  console.log('🔍 Validando dados migrados para o tenant padrão...\n')

  try {
    // Contar dados no tenant padrão
    const defaultTenantId = 'default-tenant-id'

    const counts = {
      users: await prisma.user.count({ where: { tenant_id: defaultTenantId } }),
      corretores: await prisma.corretor.count({ where: { tenant_id: defaultTenantId } }),
      leads: await prisma.lead.count({ where: { tenant_id: defaultTenantId } }),
      proprietarios: await prisma.proprietario.count({ where: { tenant_id: defaultTenantId } }),
      imoveis: await prisma.imovel.count({ where: { tenant_id: defaultTenantId } }),
      negociacoes: await prisma.negociacao.count({ where: { tenant_id: defaultTenantId } }),
    }

    console.log('📊 Dados no Tenant Padrão:')
    console.log(`   Usuários: ${counts.users}`)
    console.log(`   Corretores: ${counts.corretores}`)
    console.log(`   Leads: ${counts.leads}`)
    console.log(`   Proprietários: ${counts.proprietarios}`)
    console.log(`   Imóveis: ${counts.imoveis}`)
    console.log(`   Negociações: ${counts.negociacoes}`)

    // Verificar total de registros (para comparar com tenant padrão)
    const totalCounts = {
      users: await prisma.user.count(),
      corretores: await prisma.corretor.count(),
      leads: await prisma.lead.count(),
      proprietarios: await prisma.proprietario.count(),
      imoveis: await prisma.imovel.count(),
      negociacoes: await prisma.negociacao.count(),
    }

    console.log('\n📊 Total Geral no Banco:')
    console.log(`   Usuários: ${totalCounts.users}`)
    console.log(`   Corretores: ${totalCounts.corretores}`)
    console.log(`   Leads: ${totalCounts.leads}`)
    console.log(`   Proprietários: ${totalCounts.proprietarios}`)
    console.log(`   Imóveis: ${totalCounts.imoveis}`)
    console.log(`   Negociações: ${totalCounts.negociacoes}`)

    // Comparar se todos os dados estão no tenant padrão
    const allInDefaultTenant =
      counts.users === totalCounts.users &&
      counts.corretores === totalCounts.corretores &&
      counts.leads === totalCounts.leads &&
      counts.proprietarios === totalCounts.proprietarios &&
      counts.imoveis === totalCounts.imoveis &&
      counts.negociacoes === totalCounts.negociacoes

    if (allInDefaultTenant) {
      console.log('\n✅ Todos os dados existentes foram migrados para o tenant padrão')
    } else {
      console.log('\n⚠️  Alguns dados estão em outros tenants (multi-tenant ativo)')
    }

    // Listar todos os tenants
    const tenants = await prisma.tenant.findMany()
    console.log(`\n📋 Total de Tenants: ${tenants.length}`)
    tenants.forEach(t => {
      console.log(`   - ${t.nome} (${t.slug}) - Plano: ${t.plano} - Status: ${t.status}`)
    })

    console.log('\n✅ Validação concluída!')

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateMigration()
