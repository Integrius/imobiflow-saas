import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetPrimeiroAcesso() {
  const email = 'ia.hcdoh@gmail.com'

  console.log('===============================================================')
  console.log('RESET DE PRIMEIRO ACESSO')
  console.log('===============================================================')
  console.log('Email:', email)
  console.log('')

  // Buscar usuário
  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) {
    console.log('❌ Usuário não encontrado!')
    await prisma.$disconnect()
    return
  }

  console.log('✅ Usuário encontrado:')
  console.log('  Nome:', user.nome)
  console.log('  Email:', user.email)
  console.log('  Primeiro acesso ANTES:', user.primeiro_acesso ? 'SIM' : 'NÃO')
  console.log('')

  // Atualizar para primeiro_acesso = false
  await prisma.user.update({
    where: { id: user.id },
    data: {
      primeiro_acesso: false
    }
  })

  console.log('✅ Atualizado!')
  console.log('  Primeiro acesso DEPOIS: NÃO')
  console.log('')
  console.log('O usuário agora pode fazer login normalmente.')
  console.log('===============================================================')

  await prisma.$disconnect()
}

resetPrimeiroAcesso()
