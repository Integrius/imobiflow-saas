/**
 * Servico de integracao com Mercado Pago
 *
 * Gerencia planos de assinatura, subscriptions e webhooks
 * para o sistema de pagamentos recorrentes do ImobiFlow.
 */

import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago';
import crypto from 'crypto';

// Plan pricing config
export const MP_PLANS = {
  BASICO: {
    name: 'ImobiFlow Basico',
    amount: 97,
    currency_id: 'BRL',
    frequency: 1,
    frequency_type: 'months' as const,
  },
  PRO: {
    name: 'ImobiFlow Pro',
    amount: 197,
    currency_id: 'BRL',
    frequency: 1,
    frequency_type: 'months' as const,
  },
  ENTERPRISE: {
    name: 'ImobiFlow Enterprise',
    amount: 397,
    currency_id: 'BRL',
    frequency: 1,
    frequency_type: 'months' as const,
  },
};

class MercadoPagoService {
  private client: MercadoPagoConfig | null = null;
  private planClient: PreApprovalPlan | null = null;
  private subscriptionClient: PreApproval | null = null;

  /**
   * Lazy init - only creates the MercadoPagoConfig client when needed
   * so the app does not crash if the env var is missing.
   */
  private getClient(): MercadoPagoConfig {
    if (!this.client) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error(
          'MERCADOPAGO_ACCESS_TOKEN nao configurado. Configure a variavel de ambiente para usar o Mercado Pago.',
        );
      }
      this.client = new MercadoPagoConfig({ accessToken });
    }
    return this.client;
  }

  /**
   * Returns a lazily-initialised PreApprovalPlan client.
   */
  private getPlanClient(): PreApprovalPlan {
    if (!this.planClient) {
      this.planClient = new PreApprovalPlan(this.getClient());
    }
    return this.planClient;
  }

  /**
   * Returns a lazily-initialised PreApproval client.
   */
  private getSubscriptionClient(): PreApproval {
    if (!this.subscriptionClient) {
      this.subscriptionClient = new PreApproval(this.getClient());
    }
    return this.subscriptionClient;
  }

  /**
   * Verifica se o servico esta habilitado (access token presente).
   */
  isEnabled(): boolean {
    return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
  }

  /**
   * Cria um plano de assinatura no Mercado Pago.
   * Usado pelo seed script para provisionar os planos iniciais.
   */
  async createPlan(
    planKey: keyof typeof MP_PLANS,
  ): Promise<{ id: string; init_point: string }> {
    const config = MP_PLANS[planKey];

    const plan = await this.getPlanClient().create({
      body: {
        reason: config.name,
        auto_recurring: {
          frequency: config.frequency,
          frequency_type: config.frequency_type,
          transaction_amount: config.amount,
          currency_id: config.currency_id,
        },
        back_url:
          process.env.MERCADOPAGO_BACK_URL ||
          'https://vivoly.integrius.com.br/dashboard/planos',
      },
    });

    return { id: plan.id!, init_point: plan.init_point! };
  }

  /**
   * Cria uma assinatura (subscription) para um tenant.
   * Retorna o ID da assinatura e a URL de checkout.
   */
  async createSubscription(params: {
    planId: string;
    payerEmail: string;
    externalReference: string; // tenant_id
    backUrl: string;
  }): Promise<{ id: string; init_point: string }> {
    const subscription = await this.getSubscriptionClient().create({
      body: {
        preapproval_plan_id: params.planId,
        payer_email: params.payerEmail,
        external_reference: params.externalReference,
        back_url: params.backUrl,
        reason: 'Assinatura ImobiFlow',
        status: 'pending',
      },
    });

    return { id: subscription.id!, init_point: subscription.init_point! };
  }

  /**
   * Cancela uma assinatura existente.
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.getSubscriptionClient().update({
      id: subscriptionId,
      body: { status: 'cancelled' },
    });
  }

  /**
   * Busca os detalhes de uma assinatura pelo ID.
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    return await this.getSubscriptionClient().get({ id: subscriptionId });
  }

  /**
   * Valida a assinatura de webhook usando HMAC-SHA256.
   *
   * O Mercado Pago envia o header x-signature no formato:
   *   "ts=<timestamp>,v1=<hash>"
   *
   * O hash e calculado sobre a string:
   *   "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
   *
   * Retorna true se a assinatura for valida ou se nenhum secret estiver configurado.
   */
  validateWebhookSignature(params: {
    xSignature: string;
    xRequestId: string;
    dataId: string;
  }): boolean {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) return true; // Skip validation if no secret configured

    // Parse ts and v1 from x-signature
    const parts = params.xSignature.split(',');
    const tsEntry = parts.find((p) => p.trim().startsWith('ts='));
    const v1Entry = parts.find((p) => p.trim().startsWith('v1='));

    if (!tsEntry || !v1Entry) return false;

    const ts = tsEntry.split('=')[1];
    const v1 = v1Entry.split('=')[1];

    // Build manifest string
    const manifest = `id:${params.dataId};request-id:${params.xRequestId};ts:${ts};`;

    // Compute HMAC-SHA256
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    return hmac === v1;
  }

  /**
   * Retorna o ID do plano a partir de variavel de ambiente.
   * Formato esperado: MERCADOPAGO_PLAN_BASICO, MERCADOPAGO_PLAN_PRO, etc.
   */
  getPlanId(planKey: string): string | null {
    const envKey = `MERCADOPAGO_PLAN_${planKey}`;
    return process.env[envKey] || null;
  }
}

// Singleton
export const mercadoPagoService = new MercadoPagoService();
