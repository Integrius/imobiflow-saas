import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetAllPrimeiroAcesso() {
  console.log('===============================================================')
  console.log('RESET DE PRIMEIRO ACESSO - TODOS OS USUÁRIOS')
  console.log('===============================================================')
  console.log('')

  // Buscar todos os usuários com primeiro_acesso = true
  const users = await prisma.user.findMany({
    where: { primeiro_acesso: true },
    include: {
      tenant: {
        select: {
          nome: true,
          slug: true
        }
      }
    }
  })

  console.log('✅ Encontrados', users.length, 'usuários com primeiro_acesso = true')
  console.log('')

  if (users.length === 0) {
    console.log('✅ Nenhum usuário para resetar!')
    await prisma.$disconnect()
    return
  }

  // Atualizar todos em uma única transação
  const result = await prisma.user.updateMany({
    where: { primeiro_acesso: true },
    data: { primeiro_acesso: false }
  })

  console.log('✅ Atualizados', result.count, 'usuários:')
  console.log('')

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.nome}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Tenant: ${user.tenant.nome} (${user.tenant.slug})`)
    console.log(`   Status: primeiro_acesso = false ✅`)
    console.log('')
  })

  console.log('===============================================================')
  console.log('✅ TODOS OS USUÁRIOS FORAM RESETADOS!')
  console.log('Agora todos podem fazer login normalmente sem serem')
  console.log('redirecionados para a página de primeiro acesso.')
  console.log('===============================================================')

  await prisma.$disconnect()
}

resetAllPrimeiroAcesso()
