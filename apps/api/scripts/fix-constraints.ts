#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixConstraints() {
  console.log('🔧 Removendo constraints antigas...\n')

  try {
    // Remover índices únicos antigos que não são baseados em tenant_id
    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS users_email_key')
    console.log('✅ Removido: users_email_key')

    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS corretores_creci_key')
    console.log('✅ Removido: corretores_creci_key')

    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS proprietarios_cpf_cnpj_key')
    console.log('✅ Removido: proprietarios_cpf_cnpj_key')

    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS imoveis_codigo_key')
    console.log('✅ Removido: imoveis_codigo_key')

    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS negociacoes_codigo_key')
    console.log('✅ Removido: negociacoes_codigo_key')

    console.log('\n✅ Todas as constraints antigas foram removidas!')
    console.log('\n🔍 Verificando constraints restantes...\n')

    const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string }>>`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('users', 'corretores', 'proprietarios', 'imoveis', 'negociacoes')
        AND indexdef LIKE '%UNIQUE%'
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE '%_key'
      ORDER BY tablename, indexname
    `

    console.log('📋 Índices únicos com tenant_id:')
    indexes.forEach(i => {
      console.log(`   ✅ ${i.tablename}.${i.indexname}`)
    })

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixConstraints()
