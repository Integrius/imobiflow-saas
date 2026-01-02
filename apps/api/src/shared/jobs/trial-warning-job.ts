/**
 * Job para enviar email de aviso 5 dias antes do término do trial
 *
 * Este job deve ser executado uma vez por dia (ex: todo dia às 9h)
 *
 * Para executar manualmente:
 * cd apps/api && npx tsx src/shared/jobs/trial-warning-job.ts
 *
 * Para executar automaticamente:
 * - Opção 1: Configurar cron no servidor Linux
 * - Opção 2: Usar serviço como node-cron ou agenda
 * - Opção 3: Usar serviço externo como EasyCron ou cron-job.org
 */

import { prisma } from '../database/prisma.service'
import { sendGridService } from '../services/sendgrid.service'

async function sendTrialWarningEmails() {
  console.log('🔔 Iniciando job de aviso de trial...')

  try {
    const now = new Date()
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    const fiveDaysAndOneHourFromNow = new Date(fiveDaysFromNow.getTime() + 60 * 60 * 1000)

    // Buscar tenants em trial que expiram em aproximadamente 5 dias
    // E que ainda não receberam o email de aviso
    const tenantsToNotify = await prisma.tenant.findMany({
      where: {
        status: 'TRIAL',
        data_expiracao: {
          gte: fiveDaysFromNow, // Expira em 5 dias ou mais
          lte: fiveDaysAndOneHourFromNow // Mas não mais que 5 dias + 1 hora
        },
        email_5dias_enviado: false // Ainda não enviou email
      },
      select: {
        id: true,
        nome: true,
        email: true,
        data_expiracao: true,
        users: {
          where: {
            tipo: 'ADMIN', // Enviar para o admin do tenant
            ativo: true
          },
          select: {
            nome: true,
            email: true
          },
          take: 1
        }
      }
    })

    console.log(`📧 Encontrados ${tenantsToNotify.length} tenants para notificar`)

    let successCount = 0
    let errorCount = 0

    for (const tenant of tenantsToNotify) {
      try {
        // Enviar para o email do admin (se houver) ou para o email do tenant
        const adminUser = tenant.users[0]
        const emailDestino = adminUser?.email || tenant.email
        const nomeDestino = adminUser?.nome || 'Administrador'

        // Calcular dias restantes
        const diasRestantes = tenant.data_expiracao
          ? Math.ceil((new Date(tenant.data_expiracao).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 5

        console.log(`  📤 Enviando email para ${tenant.nome} (${emailDestino})...`)

        await sendGridService.sendTrialWarningEmail(
          emailDestino,
          nomeDestino,
          tenant.nome,
          diasRestantes
        )

        // Marcar como enviado
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { email_5dias_enviado: true }
        })

        successCount++
        console.log(`  ✅ Email enviado para ${tenant.nome}`)
      } catch (error) {
        errorCount++
        console.error(`  ❌ Erro ao enviar email para ${tenant.nome}:`, error)
      }
    }

    console.log('\n📊 Resumo:')
    console.log(`  ✅ Emails enviados: ${successCount}`)
    console.log(`  ❌ Erros: ${errorCount}`)
    console.log(`  📧 Total: ${tenantsToNotify.length}`)
    console.log('\n✅ Job concluído!')
  } catch (error) {
    console.error('❌ Erro ao executar job:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o job
sendTrialWarningEmails()
  .then(() => {
    console.log('🎉 Job executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Job falhou:', error)
    process.exit(1)
  })
