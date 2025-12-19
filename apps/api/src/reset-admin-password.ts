import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const newPassword = 'Admin@123'; // Senha temporária

    console.log('🔄 Resetando senha do admin@imobiflow.com...\n');

    const hashedPassword = await hash(newPassword, 10);

    const user = await prisma.user.update({
      where: {
        tenant_id_email: {
          tenant_id: 'default-tenant-id',
          email: 'admin@imobiflow.com'
        }
      },
      data: {
        senha_hash: hashedPassword
      },
      select: {
        id: true,
        email: true,
        ativo: true
      }
    });

    console.log('✅ Senha resetada com sucesso!');
    console.log('Email:', user.email);
    console.log('Nova senha:', newPassword);
    console.log('\n⚠️  IMPORTANTE: Altere essa senha após o primeiro login!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();
