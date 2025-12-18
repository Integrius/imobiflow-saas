import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;
  private requestCount = 0;
  private dailyCost = 0;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(
    prompt: string,
    context?: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    try {
      const maxTokens = options?.maxTokens || 2000;
      const temperature = options?.temperature || 0.7;

      const message = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          {
            role: 'user',
            content: context ? `${context}\n\n${prompt}` : prompt
          }
        ]
      });

      // Tracking de uso
      this.requestCount++;
      const inputTokens = message.usage?.input_tokens || 0;
      const outputTokens = message.usage?.output_tokens || 0;
      this.dailyCost += this.calculateCost(inputTokens, outputTokens);

      console.log(`📊 Claude Request #${this.requestCount}`, {
        inputTokens,
        outputTokens,
        dailyCost: `$${this.dailyCost.toFixed(4)}`
      });

      return message.content[0].type === 'text'
        ? message.content[0].text
        : '';

    } catch (error: any) {
      console.error('❌ Erro ao chamar Claude:', error);

      // Se atingiu limite de rate, espera e tenta novamente
      if (error.status === 429) {
        console.log('⏳ Rate limit atingido, aguardando 60s...');
        await this.sleep(60000);
        return this.generateResponse(prompt, context, options);
      }

      throw error;
    }
  }

  async analyze(prompt: string): Promise<any> {
    const response = await this.generateResponse(prompt);
    try {
      // Remove markdown code blocks se houver
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { response };
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Preços Claude 3.5 Sonnet (por milhão de tokens)
    const INPUT_COST_PER_M = 3.00;
    const OUTPUT_COST_PER_M = 15.00;

    const inputCost = (inputTokens / 1000000) * INPUT_COST_PER_M;
    const outputCost = (outputTokens / 1000000) * OUTPUT_COST_PER_M;

    return inputCost + outputCost;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      dailyCost: this.dailyCost
    };
  }

  resetDailyStats() {
    this.requestCount = 0;
    this.dailyCost = 0;
  }
}
