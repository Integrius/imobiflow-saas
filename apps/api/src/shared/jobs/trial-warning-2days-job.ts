/**
 * Job automático para enviar email de aviso URGENTE 2 dias antes do trial expirar
 *
 * Executar diariamente via cron:
 * 0 9 * * * cd /opt/render/project/src/apps/api && npx tsx src/shared/jobs/trial-warning-2days-job.ts
 */

import { PrismaClient } from '@prisma/client';
import { sendGridService } from '../services/sendgrid.service';

const prisma = new PrismaClient();

async function sendTrialWarning2Days() {
  console.log('🚀 Iniciando job: envio de emails de aviso 2 dias antes do trial expirar...');

  try {
    // Buscar tenants em trial que expiram em ~2 dias e ainda não receberam email
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const tenants = await prisma.tenant.findMany({
      where: {
        status: 'TRIAL',
        data_expiracao: {
          gte: twoDaysFromNow,
          lte: threeDaysFromNow
        },
        email_2dias_enviado: false
      },
      include: {
        users: {
          where: {
            tipo: 'ADMIN',
            ativo: true
          },
          take: 1
        }
      }
    });

    console.log(`📊 Encontrados ${tenants.length} tenants que expiram em ~2 dias`);

    let emailsEnviados = 0;
    let erros = 0;

    for (const tenant of tenants) {
      const admin = tenant.users[0];

      if (!admin) {
        console.warn(`⚠️  Tenant ${tenant.nome} (${tenant.id}) não tem admin ativo`);
        erros++;
        continue;
      }

      // Calcular dias restantes exatos
      const dataExpiracao = tenant.data_expiracao ? new Date(tenant.data_expiracao) : null;
      if (!dataExpiracao) {
        console.warn(`⚠️  Tenant ${tenant.nome} (${tenant.id}) sem data de expiração`);
        erros++;
        continue;
      }

      const diffTime = dataExpiracao.getTime() - now.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      try {
        // Enviar email urgente
        await sendGridService.sendTrialUrgentWarningEmail(
          admin.email,
          admin.nome,
          tenant.nome,
          diasRestantes
        );

        // Marcar como enviado
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { email_2dias_enviado: true }
        });

        console.log(`✅ Email urgente enviado para ${admin.email} (Tenant: ${tenant.nome}, ${diasRestantes} dias restantes)`);
        emailsEnviados++;
      } catch (error: any) {
        console.error(`❌ Erro ao enviar email para ${admin.email} (Tenant: ${tenant.nome}):`, error.message);
        erros++;
      }
    }

    console.log('');
    console.log('📈 RESUMO:');
    console.log(`  ✅ Emails enviados: ${emailsEnviados}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log(`  📊 Total processado: ${tenants.length}`);
    console.log('');
    console.log('✅ Job concluído com sucesso!');

  } catch (error: any) {
    console.error('❌ Erro ao executar job de aviso 2 dias antes:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar job
sendTrialWarning2Days()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
