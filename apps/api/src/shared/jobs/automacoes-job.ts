/**
 * Job para executar automações do sistema
 *
 * Este job deve ser executado periodicamente (sugerido: a cada hora)
 *
 * Automações implementadas:
 * 1. Follow-up automático - Lead sem resposta há 3 dias → WhatsApp
 * 2. Temperatura decrescente - QUENTE→MORNO (5 dias), MORNO→FRIO (10 dias)
 * 3. Lembrete de visita - 24h antes da visita → WhatsApp + Telegram
 * 4. Lead abandonado - 7 dias sem resposta → marcar como FRIO
 * 5. Atribuição por área - Lead sem corretor → atribuir por especialização
 *
 * Para executar manualmente:
 * cd apps/api && npx tsx src/shared/jobs/automacoes-job.ts
 *
 * Para executar automaticamente:
 * - Opção 1: Configurar cron no servidor Linux
 *   0 * * * * cd /path/to/apps/api && npx tsx src/shared/jobs/automacoes-job.ts
 * - Opção 2: Usar serviço externo como EasyCron ou cron-job.org
 * - Opção 3: Usar node-cron no próprio servidor (implementar)
 */

import { automacoesService } from '../services/automacoes.service'

async function executarAutomacoes() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('🤖 JOB: Automações do Sistema')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
  console.log('')

  try {
    const resultados = await automacoesService.executarTodasAutomacoes()

    // Resumo por automação
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('📊 RESUMO POR AUTOMAÇÃO')
    console.log('═══════════════════════════════════════════════════════')

    const resumoPorAutomacao = resultados.reduce((acc, r) => {
      if (!acc[r.automacao]) {
        acc[r.automacao] = { executadas: 0, erros: 0 }
      }
      acc[r.automacao].executadas += r.executadas
      acc[r.automacao].erros += r.erros.length
      return acc
    }, {} as Record<string, { executadas: number, erros: number }>)

    for (const [automacao, stats] of Object.entries(resumoPorAutomacao)) {
      console.log(`\n🔸 ${automacao}:`)
      console.log(`   ✅ Executadas: ${stats.executadas}`)
      if (stats.erros > 0) {
        console.log(`   ⚠️  Erros: ${stats.erros}`)
      }
    }

    // Resumo geral
    const totalExecutadas = resultados.reduce((sum, r) => sum + r.executadas, 0)
    const totalErros = resultados.reduce((sum, r) => sum + r.erros.length, 0)
    const tenantsProcessados = new Set(resultados.map(r => r.tenantId)).size

    console.log('\n───────────────────────────────────────────────────────')
    console.log(`🏢 Tenants processados: ${tenantsProcessados}`)
    console.log(`✅ Total de automações executadas: ${totalExecutadas}`)
    if (totalErros > 0) {
      console.log(`⚠️  Total de erros: ${totalErros}`)
    }
    console.log('═══════════════════════════════════════════════════════\n')

    return { success: true, totalExecutadas, totalErros, tenantsProcessados }
  } catch (error: any) {
    console.error('❌ Erro fatal ao executar job:', error.message)
    throw error
  }
}

// Executar o job
executarAutomacoes()
  .then((resultado) => {
    console.log('🎉 Job executado com sucesso!')
    console.log(`   Tenants: ${resultado.tenantsProcessados}`)
    console.log(`   Automações: ${resultado.totalExecutadas}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Job falhou:', error.message)
    process.exit(1)
  })
