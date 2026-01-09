import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCommonPasswords() {
  console.log('===============================================================')
  console.log('TESTE DE SENHAS COMUNS')
  console.log('===============================================================')
  console.log('')

  const senhasComuns = ['admin123', 'vivoly2025', '123456', 'teste123', 'senha123']

  const usuarios = [
    { email: 'admin@vivoly.com', nome: 'Administrador Vivoly' },
    { email: 'admin@vivoly.com.br', nome: 'Administrador' },
    { email: 'joao.corretor@vivoly.com.br', nome: 'João Corretor' },
    { email: 'teste@vivoly.com.br', nome: 'Usuario Teste' },
    { email: 'pfrias@vimobi.com.br', nome: 'Paula Frias' },
    { email: 'admin@teste-deploy-novo-999.com', nome: 'Admin Deploy' }
  ]

  for (const userData of usuarios) {
    const user = await prisma.user.findFirst({
      where: { email: userData.email }
    })

    if (!user) {
      console.log('❌', userData.nome, '- USUÁRIO NÃO ENCONTRADO')
      console.log('')
      continue
    }

    if (!user.senha_hash) {
      console.log('⏭️ ', userData.nome, '- SEM SENHA (Google OAuth)')
      console.log('   Email:', userData.email)
      console.log('')
      continue
    }

    console.log('👤', userData.nome)
    console.log('   Email:', userData.email)

    let senhaEncontrada = false
    for (const senha of senhasComuns) {
      const match = await bcrypt.compare(senha, user.senha_hash)
      if (match) {
        console.log('   ✅ SENHA:', senha)
        senhaEncontrada = true
        break
      }
    }

    if (!senhaEncontrada) {
      console.log('   ❌ Senha NÃO encontrada nas senhas comuns testadas')
      console.log('   💡 Senhas testadas:', senhasComuns.join(', '))
    }
    console.log('')
  }

  console.log('===============================================================')
  await prisma.$disconnect()
}

testCommonPasswords()
