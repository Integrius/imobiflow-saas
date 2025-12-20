import OpenAI from 'openai'

/**
 * Serviço para integração com OpenAI (fallback)
 *
 * Este serviço serve como backup caso o Claude AI esteja indisponível.
 * Usa o modelo GPT-4o-mini para manter custos baixos.
 */
export class OpenAIService {
  private client: OpenAI | null = null
  private requestCount = 0
  private dailyCost = 0
  private model = 'gpt-4o-mini' // Mais barato

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY não configurada - fallback desabilitado')
      return
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    })

    console.log('✅ OpenAI Service (fallback) inicializado')
  }

  /**
   * Verifica se o serviço está disponível
   */
  isAvailable(): boolean {
    return !!this.client
  }

  /**
   * Gera resposta usando GPT
   *
   * @param prompt Prompt para a IA
   * @param context Contexto adicional
   * @param options Opções de geração
   * @returns Resposta gerada
   */
  async generateResponse(
    prompt: string,
    context?: string,
    options?: {
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI não está disponível. Configure OPENAI_API_KEY.')
    }

    try {
      const maxTokens = options?.maxTokens || 1024
      const temperature = options?.temperature || 0.7

      const completion = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: context ? `${context}\n\n${prompt}` : prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      })

      // Tracking de uso
      this.requestCount++
      const inputTokens = completion.usage?.prompt_tokens || 0
      const outputTokens = completion.usage?.completion_tokens || 0
      this.dailyCost += this.calculateCost(inputTokens, outputTokens)

      console.log(`📊 OpenAI Request #${this.requestCount}`, {
        inputTokens,
        outputTokens,
        dailyCost: `$${this.dailyCost.toFixed(4)}`
      })

      return completion.choices[0]?.message?.content || ''

    } catch (error: any) {
      console.error('❌ Erro ao chamar OpenAI:', error.message)

      // Rate limiting
      if (error.status === 429) {
        console.log('⏳ Rate limit atingido, aguardando 60s...')
        await this.sleep(60000)
        return this.generateResponse(prompt, context, options)
      }

      throw error
    }
  }

  /**
   * Analisa e retorna JSON estruturado
   */
  async analyze(prompt: string): Promise<any> {
    const response = await this.generateResponse(prompt)

    try {
      // Remove markdown code blocks
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleaned)
    } catch {
      return { response }
    }
  }

  /**
   * Calcula custo baseado em tokens
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Preços GPT-4o-mini (por milhão de tokens)
    // Fonte: https://openai.com/pricing (Dec 2024)
    const INPUT_COST_PER_M = 0.15  // $0.15 / 1M tokens
    const OUTPUT_COST_PER_M = 0.60 // $0.60 / 1M tokens

    const inputCost = (inputTokens / 1000000) * INPUT_COST_PER_M
    const outputCost = (outputTokens / 1000000) * OUTPUT_COST_PER_M

    return inputCost + outputCost
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Retorna estatísticas de uso
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      dailyCost: this.dailyCost,
      model: this.model
    }
  }

  /**
   * Reseta estatísticas diárias
   */
  resetDailyStats() {
    this.requestCount = 0
    this.dailyCost = 0
  }
}

// Exporta instância singleton
export const openaiService = new OpenAIService()
