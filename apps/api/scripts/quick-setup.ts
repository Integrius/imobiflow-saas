/**
 * Script rápido para criar tenant Vivoly e admin
 * Executa direto no banco sem passar pelo middleware
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function quickSetup() {
  console.log('🚀 Criando tenant Vivoly e usuário ADMIN...\n')

  try {
    // 1. Criar ou atualizar tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'vivoly' },
      update: {},
      create: {
        nome: 'Vivoly Imobiliária',
        slug: 'vivoly',
        subdominio: 'vivoly',
        email: 'contato@vivoly.com.br',
        telefone: '11999999999',
        plano: 'PRO',
        status: 'ATIVO',
        limite_usuarios: 10,
        limite_imoveis: 500,
        total_usuarios: 1,
        total_imoveis: 0
      }
    })

    console.log('✅ Tenant criado:')
    console.log(`   ID: ${tenant.id}`)
    console.log(`   Nome: ${tenant.nome}`)
    console.log(`   Slug: ${tenant.slug}\n`)

    // 2. Criar ou atualizar admin
    const senhaHash = await hash('admin123', 10)

    const admin = await prisma.user.upsert({
      where: {
        tenant_id_email: {
          tenant_id: tenant.id,
          email: 'admin@vivoly.com'
        }
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        nome: 'Administrador Vivoly',
        email: 'admin@vivoly.com',
        senha_hash: senhaHash,
        tipo: 'ADMIN',
        ativo: true
      }
    })

    console.log('✅ Usuário ADMIN criado:')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Senha: admin123\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SETUP CONCLUÍDO!\n')
    console.log('📝 Para testar o login:')
    console.log(`   URL: http://localhost:3000/login?tenant_id=${tenant.id}`)
    console.log(`   Email: admin@vivoly.com`)
    console.log(`   Senha: admin123\n`)
    console.log(`🔑 Tenant ID: ${tenant.id}`)
    console.log(`   (Guarde este ID para usar em desenvolvimento)\n`)

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

quickSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
