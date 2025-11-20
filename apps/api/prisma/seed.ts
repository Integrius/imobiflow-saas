import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const senhaHashAdmin = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imobiflow.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@imobiflow.com',
      senha_hash: senhaHashAdmin,
      tipo: 'ADMIN',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Criar corretor 1
  const senhaHashCorretor1 = await hash('corretor123', 10)
  const userCorretor1 = await prisma.user.upsert({
    where: { email: 'joao@imobiflow.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao@imobiflow.com',
      senha_hash: senhaHashCorretor1,
      tipo: 'CORRETOR',
      corretor: {
        create: {
          creci: 'CRECI-12345',
          telefone: '11999999999',
          especializacoes: ['APARTAMENTO', 'CASA'],
          meta_mensal: 50000,
          comissao_padrao: 3.5,
        },
      },
    },
  })
  console.log('✅ Corretor 1 criado:', userCorretor1.email)

  // Criar corretor 2
  const senhaHashCorretor2 = await hash('corretor123', 10)
  const userCorretor2 = await prisma.user.upsert({
    where: { email: 'maria@imobiflow.com' },
    update: {},
    create: {
      nome: 'Maria Santos',
      email: 'maria@imobiflow.com',
      senha_hash: senhaHashCorretor2,
      tipo: 'CORRETOR',
      corretor: {
        create: {
          creci: 'CRECI-67890',
          telefone: '11988888888',
          especializacoes: ['COMERCIAL', 'TERRENO'],
          meta_mensal: 75000,
          comissao_padrao: 4.0,
        },
      },
    },
  })
  console.log('✅ Corretor 2 criado:', userCorretor2.email)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
