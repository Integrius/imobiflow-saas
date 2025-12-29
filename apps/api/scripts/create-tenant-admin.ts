/**
 * Script para criar tenant e usuário ADMIN inicial
 *
 * Uso:
 * DATABASE_URL="..." npx tsx scripts/create-tenant-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function createTenantAndAdmin() {
  console.log('🚀 Criando tenant e usuário ADMIN...\n')

  try {
    // Criar tenant
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
    console.log(`   Subdomínio: ${tenant.subdominio}.integrius.com.br`)
    console.log(`   Status: ${tenant.status}\n`)

    // Criar usuário ADMIN
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
    console.log(`   Senha: admin123`)
    console.log(`   Tipo: ${admin.tipo}\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SETUP CONCLUÍDO COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🔑 ACESSO:')
    console.log('   URL Produção: https://vivoly.integrius.com.br/login')
    console.log('   URL Dev: http://localhost:3000/login')
    console.log('   Email: admin@vivoly.com')
    console.log('   Senha: admin123\n')

    console.log('📝 TESTE VIA API:')
    console.log('   curl -X POST https://vivoly.integrius.com.br/api/v1/auth/login \\')
    console.log('     -H "Content-Type: application/json" \\')
    console.log('     -d \'{"email":"admin@vivoly.com","senha":"admin123"}\'')
    console.log('')

    console.log('💡 PRÓXIMOS PASSOS:')
    console.log('   1. Fazer login com as credenciais acima')
    console.log('   2. Criar usuários GESTORES e CORRETORES via /api/v1/users')
    console.log('   3. Configurar DNS wildcard (*.integrius.com.br) no Cloudflare')
    console.log('')

  } catch (error) {
    console.error('❌ Erro ao criar tenant e admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTenantAndAdmin()
  .then(() => {
    console.log('✅ Script finalizado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Falha na execução:', error)
    process.exit(1)
  })
