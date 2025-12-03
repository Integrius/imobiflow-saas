#!/usr/bin/env tsx

/**
 * Script para testar conexão com o banco de dados
 *
 * Uso:
 *   npx tsx scripts/test-db-connection.ts
 *
 * Ou com URL específica:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔌 Testando conexão com o banco de dados...\n')

  try {
    // Tentar conectar
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!\n')

    // Obter informações do banco
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`
    console.log('📊 Informações do banco:')
    console.log(`   Versão: ${result[0].version}\n`)

    // Verificar tabelas existentes
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    console.log('📋 Tabelas existentes no banco:')
    if (tables.length === 0) {
      console.log('   ⚠️  Nenhuma tabela encontrada (banco vazio)\n')
    } else {
      tables.forEach(t => console.log(`   - ${t.tablename}`))
      console.log('')
    }

    // Verificar se migration foi aplicada
    const tenantTable = tables.find(t => t.tablename === 'tenants')

    if (tenantTable) {
      console.log('✅ Tabela "tenants" encontrada - Migration multi-tenant já aplicada!')

      // Contar tenants
      const tenantCount = await prisma.tenant.count()
      console.log(`   Total de tenants: ${tenantCount}\n`)

      if (tenantCount > 0) {
        const tenants = await prisma.tenant.findMany({ take: 5 })
        console.log('   Primeiros tenants:')
        tenants.forEach(t => {
          console.log(`   - ${t.nome} (${t.slug}) - Plano: ${t.plano}`)
        })
      }
    } else {
      console.log('⚠️  Tabela "tenants" não encontrada')
      console.log('   A migration multi-tenant ainda não foi aplicada.\n')
      console.log('   Execute: npx prisma migrate deploy')
    }

    console.log('\n🎉 Teste de conexão concluído com sucesso!')

  } catch (error: any) {
    console.error('❌ Erro ao conectar com o banco de dados:\n')

    if (error.code === 'P1001') {
      console.error('   Código: P1001 - Não foi possível alcançar o servidor')
      console.error('   Possíveis causas:')
      console.error('   1. URL do banco está usando hostname interno (dpg-xxx)')
      console.error('   2. Firewall bloqueando porta 5432')
      console.error('   3. Banco de dados não está rodando')
      console.error('\n   💡 Solução: Obtenha a External Database URL no dashboard do Render')
    } else if (error.code === 'P1002') {
      console.error('   Código: P1002 - Timeout ao conectar')
      console.error('   O banco demorou muito para responder')
    } else if (error.code === 'P1003') {
      console.error('   Código: P1003 - Banco de dados não existe')
      console.error('   Verifique o nome do banco na URL')
    } else if (error.code === 'P1000') {
      console.error('   Código: P1000 - Falha na autenticação')
      console.error('   Usuário ou senha incorretos')
    } else {
      console.error('   Erro:', error.message)
      console.error('\n   Stack:', error.stack)
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Mostrar DATABASE_URL configurada (sem a senha)
const databaseUrl = process.env.DATABASE_URL || 'NÃO CONFIGURADA'
const safeUrl = databaseUrl.replace(/:([^@:]+)@/, ':***@')
console.log(`🔧 DATABASE_URL: ${safeUrl}\n`)

testConnection()
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
