import { ClaudeService } from './claude.service'
import { OpenAIService } from './openai.service'

/**
 * AI Router Service
 *
 * Orquestra chamadas entre Claude (principal) e OpenAI (fallback)
 * com retry automático e tracking de custos.
 */
export class AIRouterService {
  private claude: ClaudeService
  private openai: OpenAIService
  private preferredProvider: 'claude' | 'openai' = 'claude'
  private fallbackEnabled: boolean

  constructor() {
    this.claude = new ClaudeService()
    this.openai = new OpenAIService()

    // Ativa fallback apenas se ambos estiverem configurados
    this.fallbackEnabled =
      process.env.AI_FALLBACK_TO_OPENAI === 'true' &&
      this.openai.isAvailable()

    console.log('🤖 AI Router inicializado:', {
      claudeAvailable: this.claude.getStats !== undefined,
      openaiAvailable: this.openai.isAvailable(),
      fallbackEnabled: this.fallbackEnabled
    })
  }

  /**
   * Gera resposta usando o provider preferido com fallback automático
   */
  async generateResponse(
    prompt: string,
    context?: string,
    options?: {
      maxTokens?: number
      temperature?: number
      forceProvider?: 'claude' | 'openai'
    }
  ): Promise<{
    response: string
    provider: 'claude' | 'openai'
    cost: number
  }> {
    const provider = options?.forceProvider || this.preferredProvider

    // Tenta provider preferido
    try {
      if (provider === 'claude') {
        const response = await this.claude.generateResponse(prompt, context, options)
        const stats = this.claude.getStats()

        return {
          response,
          provider: 'claude',
          cost: stats.dailyCost
        }
      } else {
        const response = await this.openai.generateResponse(prompt, context, options)
        const stats = this.openai.getStats()

        return {
          response,
          provider: 'openai',
          cost: stats.dailyCost
        }
      }

    } catch (error: any) {
      console.error(`❌ Erro no provider ${provider}:`, error.message)

      // Tenta fallback se habilitado
      if (this.fallbackEnabled && provider === 'claude') {
        console.log('🔄 Tentando fallback para OpenAI...')

        try {
          const response = await this.openai.generateResponse(prompt, context, options)
          const stats = this.openai.getStats()

          return {
            response,
            provider: 'openai',
            cost: stats.dailyCost
          }

        } catch (fallbackError: any) {
          console.error('❌ Fallback também falhou:', fallbackError.message)
          throw new Error('Ambos provedores de IA falharam')
        }
      }

      // Se fallback não está habilitado ou falhou, propaga erro
      throw error
    }
  }

  /**
   * Analisa e retorna JSON estruturado
   */
  async analyze(prompt: string): Promise<any> {
    try {
      return await this.claude.analyze(prompt)
    } catch (error: any) {
      console.error('❌ Claude analyze falhou:', error.message)

      if (this.fallbackEnabled) {
        console.log('🔄 Tentando fallback OpenAI para análise...')
        return await this.openai.analyze(prompt)
      }

      throw error
    }
  }

  /**
   * Retorna estatísticas combinadas de ambos providers
   */
  getCombinedStats() {
    const claudeStats = this.claude.getStats()
    const openaiStats = this.openai.getStats()

    return {
      claude: {
        requests: claudeStats.requestCount,
        cost: claudeStats.dailyCost,
        available: true
      },
      openai: {
        requests: openaiStats.requestCount,
        cost: openaiStats.dailyCost,
        available: this.openai.isAvailable()
      },
      total: {
        requests: claudeStats.requestCount + openaiStats.requestCount,
        cost: claudeStats.dailyCost + openaiStats.dailyCost
      },
      fallbackEnabled: this.fallbackEnabled,
      preferredProvider: this.preferredProvider
    }
  }

  /**
   * Reseta estatísticas diárias de ambos providers
   */
  resetAllStats() {
    this.claude.resetDailyStats()
    this.openai.resetDailyStats()
    console.log('📊 Estatísticas resetadas para ambos providers')
  }

  /**
   * Muda provider preferido
   */
  setPreferredProvider(provider: 'claude' | 'openai') {
    this.preferredProvider = provider
    console.log(`🔄 Provider preferido alterado para: ${provider}`)
  }
}

// Exporta instância singleton
export const aiRouter = new AIRouterService()
