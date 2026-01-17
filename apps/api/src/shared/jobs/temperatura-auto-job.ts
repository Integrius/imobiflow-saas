/**
 * Job para atualização automática de temperatura de leads
 *
 * Este job deve ser executado uma vez por dia (sugerido: 8h da manhã)
 *
 * Regras:
 * - QUENTE sem contato há 5+ dias → MORNO
 * - MORNO sem contato há 10+ dias → FRIO
 * - Notifica corretor via Telegram quando temperatura cai
 *
 * Para executar manualmente:
 * cd apps/api && npx tsx src/shared/jobs/temperatura-auto-job.ts
 *
 * Para executar automaticamente:
 * - Opção 1: Configurar cron no servidor Linux
 *   0 8 * * * cd /path/to/apps/api && npx tsx src/shared/jobs/temperatura-auto-job.ts
 * - Opção 2: Usar serviço externo como EasyCron ou cron-job.org
 * - Opção 3: Usar node-cron no próprio servidor
 */

import { temperaturaAutoService } from '../services/temperatura-auto.service'

async function executarAtualizacaoTemperatura() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('🌡️  JOB: Atualização Automática de Temperatura de Leads')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
  console.log('')

  try {
    const resultados = await temperaturaAutoService.executarParaTodosOsTenants()

    // Resumo final
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('📊 RESUMO FINAL DO JOB')
    console.log('═══════════════════════════════════════════════════════')

    let totalAtualizados = 0
    let totalNotificacoes = 0
    let totalErros = 0

    for (const resultado of resultados) {
      totalAtualizados += resultado.leadsAtualizados.length
      totalNotificacoes += resultado.notificacoesEnviadas
      totalErros += resultado.erros.length

      if (resultado.leadsAtualizados.length > 0) {
        console.log(`\n🏢 ${resultado.tenantNome}:`)
        console.log(`   📊 Leads atualizados: ${resultado.leadsAtualizados.length}`)
        console.log(`   📱 Notificações Telegram: ${resultado.notificacoesEnviadas}`)
        if (resultado.erros.length > 0) {
          console.log(`   ⚠️  Erros: ${resultado.erros.length}`)
          resultado.erros.forEach(erro => console.log(`      - ${erro}`))
        }
      }
    }

    console.log('\n───────────────────────────────────────────────────────')
    console.log(`✅ Tenants processados: ${resultados.length}`)
    console.log(`🌡️  Total leads atualizados: ${totalAtualizados}`)
    console.log(`📱 Total notificações enviadas: ${totalNotificacoes}`)
    if (totalErros > 0) {
      console.log(`⚠️  Total de erros: ${totalErros}`)
    }
    console.log('═══════════════════════════════════════════════════════\n')

    return { success: true, totalAtualizados, totalNotificacoes, totalErros }
  } catch (error: any) {
    console.error('❌ Erro fatal ao executar job:', error.message)
    throw error
  }
}

// Executar o job
executarAtualizacaoTemperatura()
  .then((resultado) => {
    console.log('🎉 Job executado com sucesso!')
    console.log(`   Leads atualizados: ${resultado.totalAtualizados}`)
    console.log(`   Notificações: ${resultado.totalNotificacoes}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Job falhou:', error.message)
    process.exit(1)
  })
