import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testPassword() {
  const email = 'ia.hcdoh@gmail.com'
  const senhaParaTestar = 'aMBd@1725'

  console.log('===============================================================')
  console.log('TESTE DE SENHA')
  console.log('===============================================================')
  console.log('Email:', email)
  console.log('Senha para testar:', senhaParaTestar)
  console.log('')

  // Buscar usuário
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      tenant: {
        select: {
          id: true,
          nome: true,
          slug: true,
          subdominio: true
        }
      }
    }
  })

  if (!user) {
    console.log('❌ Usuário não encontrado!')
    await prisma.$disconnect()
    return
  }

  console.log('✅ Usuário encontrado:')
  console.log('  ID:', user.id)
  console.log('  Nome:', user.nome)
  console.log('  Email:', user.email)
  console.log('  Tenant:', user.tenant.nome, `(${user.tenant.slug})`)
  console.log('  Ativo:', user.ativo ? 'SIM' : 'NÃO')
  console.log('  Primeiro acesso?:', user.primeiro_acesso ? 'SIM' : 'NÃO')
  console.log('')

  if (!user.senha_hash) {
    console.log('❌ Usuário não tem senha! (Provavelmente Google OAuth)')
    await prisma.$disconnect()
    return
  }

  console.log('🔐 Testando senha...')
  console.log('  Hash armazenado:', user.senha_hash.substring(0, 30) + '...')
  console.log('')

  // Testar senha
  const match = await bcrypt.compare(senhaParaTestar, user.senha_hash)

  if (match) {
    console.log('✅ SENHA CORRETA! A senha', senhaParaTestar, 'corresponde ao hash')
  } else {
    console.log('❌ SENHA INCORRETA! A senha', senhaParaTestar, 'NÃO corresponde ao hash')
    console.log('')
    console.log('⚠️  Possíveis causas:')
    console.log('  1. Senha foi alterada no banco e você está usando senha antiga')
    console.log('  2. Senha tem caracteres especiais que precisam de escape')
    console.log('  3. Hash foi corrompido no banco de dados')
  }

  console.log('')
  console.log('===============================================================')

  await prisma.$disconnect()
}

testPassword()
