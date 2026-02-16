/**
 * Script para criar planos de assinatura no Mercado Pago
 *
 * Execucao: npx tsx src/shared/scripts/seed-mp-plans.ts
 *
 * Apos executar, copie os IDs gerados para as env vars:
 *   MERCADOPAGO_PLAN_BASICO=<id>
 *   MERCADOPAGO_PLAN_PRO=<id>
 *   MERCADOPAGO_PLAN_ENTERPRISE=<id>
 */

import 'dotenv/config';
import { mercadoPagoService, MP_PLANS } from '../services/mercadopago.service';

async function seedPlans() {
  if (!mercadoPagoService.isEnabled()) {
    console.error('MERCADOPAGO_ACCESS_TOKEN nao configurado. Defina a variavel de ambiente.');
    process.exit(1);
  }

  console.log('Criando planos no Mercado Pago...\n');

  for (const [key, config] of Object.entries(MP_PLANS)) {
    try {
      const plan = await mercadoPagoService.createPlan(key as keyof typeof MP_PLANS);
      console.log(`[OK] ${config.name}`);
      console.log(`     ID: ${plan.id}`);
      console.log(`     Env var: MERCADOPAGO_PLAN_${key}=${plan.id}\n`);
    } catch (error: any) {
      console.error(`[ERRO] ${config.name}: ${error.message}`);
    }
  }

  console.log('Copie os IDs acima para suas variaveis de ambiente no Render.');
}

seedPlans();
