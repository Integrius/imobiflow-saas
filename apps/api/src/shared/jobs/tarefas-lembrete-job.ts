/**
 * Job para processar lembretes de tarefas
 *
 * Executar diariamente (sugestão: a cada 30 minutos)
 * npx tsx src/shared/jobs/tarefas-lembrete-job.ts
 *
 * Cron sugerido: 0,30 * * * * (a cada 30 minutos)
 */

import { tarefasService } from '../../modules/tarefas/tarefas.service'

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔔 JOB: Processamento de Lembretes de Tarefas')
  console.log(`📅 Data: ${new Date().toISOString()}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const resultado = await tarefasService.processarLembretes()

    console.log('')
    console.log('✅ Processamento concluído!')
    console.log(`   📋 Tarefas processadas: ${resultado.processadas}`)
    console.log(`   🔔 Lembretes enviados: ${resultado.enviados}`)
    console.log('')
  } catch (error) {
    console.error('❌ Erro ao processar lembretes:', error)
    process.exit(1)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  process.exit(0)
}

main()
