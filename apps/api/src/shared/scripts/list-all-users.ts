import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listAllUsers() {
  const users = await prisma.user.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          nome: true,
          slug: true,
          subdominio: true
        }
      }
    },
    orderBy: [
      { tenant: { slug: 'asc' } },
      { created_at: 'desc' }
    ]
  })

  console.log('===============================================================')
  console.log('TODOS OS USUARIOS NO BANCO DE DADOS')
  console.log('===============================================================')
  console.log('Total de usuarios:', users.length)
  console.log('')

  let currentTenant = ''
  users.forEach((user, index) => {
    if (currentTenant !== user.tenant.slug) {
      currentTenant = user.tenant.slug
      console.log('')
      console.log('---------------------------------------------------------------')
      console.log('TENANT:', user.tenant.nome)
      console.log('Slug:', user.tenant.slug)
      console.log('Subdominio:', user.tenant.subdominio || 'N/A')
      console.log('URL:', (user.tenant.subdominio || user.tenant.slug) + '.integrius.com.br')
      console.log('---------------------------------------------------------------')
    }

    console.log('')
    console.log(`Usuario #${index + 1}`)
    console.log('  ID:', user.id)
    console.log('  Nome:', user.nome)
    console.log('  Email:', user.email)
    console.log('  Tipo:', user.tipo)
    console.log('  Ativo:', user.ativo ? 'SIM' : 'NAO')
    console.log('  Tem senha?:', user.senha_hash ? 'SIM' : 'NAO (Google OAuth)')
    console.log('  Google ID:', user.google_id || 'N/A')
    console.log('  Primeiro acesso?:', user.primeiro_acesso ? 'SIM' : 'Nao')
    console.log('  Criado em:', user.created_at.toLocaleString('pt-BR'))
    console.log('  Ultimo login:', user.ultimo_login ? user.ultimo_login.toLocaleString('pt-BR') : 'Nunca')
  })

  console.log('')
  console.log('===============================================================')
  console.log('')

  await prisma.$disconnect()
}

listAllUsers()
