#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkConstraints() {
  console.log('🔍 Verificando constraints do banco...\n')

  const constraints = await prisma.$queryRaw<Array<{ table_name: string; constraint_name: string; constraint_type: string }>>`
    SELECT
      tc.table_name,
      tc.constraint_name,
      tc.constraint_type
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name IN ('users', 'corretores', 'proprietarios', 'imoveis', 'negociacoes')
      AND tc.constraint_type = 'UNIQUE'
    ORDER BY tc.table_name, tc.constraint_name
  `

  console.log('📋 Unique Constraints encontradas:\n')
  constraints.forEach(c => {
    console.log(`   ${c.table_name}.${c.constraint_name}`)
  })

  console.log('\n🔍 Verificando índices únicos...\n')

  const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string; indexdef: string }>>`
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'corretores', 'proprietarios', 'imoveis', 'negociacoes')
      AND indexdef LIKE '%UNIQUE%'
    ORDER BY tablename, indexname
  `

  console.log('📋 Índices únicos encontrados:\n')
  indexes.forEach(i => {
    console.log(`   ${i.tablename}.${i.indexname}`)
    console.log(`      ${i.indexdef}\n`)
  })

  await prisma.$disconnect()
}

checkConstraints()
