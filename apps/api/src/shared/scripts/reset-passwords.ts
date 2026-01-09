import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPasswords() {
  console.log('===============================================================')
  console.log('RESET DE SENHAS PARA teste123')
  console.log('===============================================================')
  console.log('')

  const novaSenha = 'teste123'
  const senhaHash = await bcrypt.hash(novaSenha, 10)

  const usuarios = [
    { email: 'joao.corretor@vivoly.com.br', nome: 'João Corretor Teste' },
    { email: 'teste@vivoly.com.br', nome: 'Usuario Teste' },
    { email: 'admin@teste-deploy-novo-999.com', nome: 'Admin Deploy' }
  ]

  console.log('📝 Nova senha para todos:', novaSenha)
  console.log('')

  for (const userData of usuarios) {
    const user = await prisma.user.findFirst({
      where: { email: userData.email }
    })

    if (!user) {
      console.log('❌', userData.nome, '- Usuário não encontrado')
      continue
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { senha_hash: senhaHash }
    })

    console.log('✅', userData.nome)
    console.log('   Email:', userData.email)
    console.log('   Senha resetada para:', novaSenha)
    console.log('')
  }

  console.log('===============================================================')
  console.log('✅ TODAS AS SENHAS FORAM RESETADAS!')
  console.log('===============================================================')

  await prisma.$disconnect()
}

resetPasswords()
