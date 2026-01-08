import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTrialPeriod() {
  console.log('🔧 Corrigindo período trial de 30 para 14 dias...\n')

  try {
    // Buscar todos os tenants em TRIAL que ainda não expiraram
    const tenants = await prisma.tenant.findMany({
      where: {
        status: 'TRIAL',
        data_expiracao: {
          gt: new Date()
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    })

    console.log(`📊 Encontrados ${tenants.length} tenants em trial ativo\n`)

    if (tenants.length === 0) {
      console.log('✅ Nenhum tenant para atualizar')
      return
    }

    // Atualizar cada tenant
    let updated = 0
    for (const tenant of tenants) {
      const createdAt = new Date(tenant.created_at)
      const newExpiration = new Date(createdAt)
      newExpiration.setDate(newExpiration.getDate() + 14) // 14 dias

      // Calcular dias restantes antes
      const oldExpiration = tenant.data_expiracao ? new Date(tenant.data_expiracao) : null
      const diasRestantesAntes = oldExpiration
        ? Math.ceil((oldExpiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0

      // Calcular dias restantes depois
      const diasRestantesDepois = Math.ceil((newExpiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          data_expiracao: newExpiration
        }
      })

      console.log(`✅ ${tenant.slug}`)
      console.log(`   Nome: ${tenant.nome}`)
      console.log(`   Criado em: ${createdAt.toLocaleDateString('pt-BR')}`)
      console.log(`   Expiração ANTES: ${oldExpiration?.toLocaleDateString('pt-BR')} (${diasRestantesAntes} dias restantes)`)
      console.log(`   Expiração DEPOIS: ${newExpiration.toLocaleDateString('pt-BR')} (${diasRestantesDepois} dias restantes)`)
      console.log('')

      updated++
    }

    console.log(`\n🎉 ${updated} tenants atualizados com sucesso!`)

    // Mostrar resumo final
    console.log('\n📋 RESUMO FINAL:')
    const updatedTenants = await prisma.tenant.findMany({
      where: {
        status: 'TRIAL',
        data_expiracao: {
          gt: new Date()
        }
      },
      orderBy: {
        data_expiracao: 'asc'
      }
    })

    for (const tenant of updatedTenants) {
      const expiration = tenant.data_expiracao ? new Date(tenant.data_expiracao) : null
      const diasRestantes = expiration
        ? Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0

      console.log(`   ${tenant.slug}: ${diasRestantes} dias restantes (expira em ${expiration?.toLocaleDateString('pt-BR')})`)
    }
  } catch (error: any) {
    console.error('❌ Erro ao corrigir período trial:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixTrialPeriod()
