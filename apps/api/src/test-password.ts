import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('🔐 Testando senha "senha123" para admin@imobiflow.com...\n');

    const user = await prisma.user.findFirst({
      where: { email: 'admin@imobiflow.com' },
      select: {
        email: true,
        senha_hash: true
      }
    });

    if (!user || !user.senha_hash) {
      console.log('❌ Usuário não encontrado ou sem senha');
      await prisma.$disconnect();
      return;
    }

    const passwordToTest = 'senha123';
    const isValid = await compare(passwordToTest, user.senha_hash);

    console.log('Email:', user.email);
    console.log('Senha testada:', passwordToTest);
    console.log('Hash no banco:', user.senha_hash.substring(0, 30) + '...');
    console.log('\n' + '='.repeat(50));

    if (isValid) {
      console.log('✅ SENHA CORRETA! O hash está válido.');
      console.log('O problema NÃO é a senha.');
    } else {
      console.log('❌ SENHA INCORRETA!');
      console.log('A senha "senha123" NÃO corresponde ao hash.');
      console.log('\nPrecisa resetar a senha? (Execute reset-admin-password.ts)');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPassword();
