/**
 * Script para criar tenant via SQL direto
 * Usa conexão nativa do PostgreSQL
 */

import { Client } from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a.ohio-postgres.render.com/imobiflow'

async function createTenant() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    statement_timeout: 10000
  })

  try {
    console.log('🔌 Conectando no banco do Render...')
    await client.connect()
    console.log('✅ Conectado!\n')

    // Teste de conexão
    await client.query('SELECT NOW()')
    console.log('✅ Conexão ativa!\n')

    // 1. Criar Tenant
    console.log('📦 Criando tenant Vivoly...')
    const tenantResult = await client.query(`
      INSERT INTO tenants (
        id, nome, slug, subdominio, email, telefone,
        plano, status, limite_usuarios, limite_imoveis,
        total_usuarios, total_imoveis, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        'Vivoly Imobiliária',
        'vivoly',
        'vivoly',
        'contato@vivoly.com.br',
        '11999999999',
        'PRO',
        'ATIVO',
        10,
        500,
        1,
        0,
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome
      RETURNING id, nome, slug
    `)

    const tenant = tenantResult.rows[0]
    console.log('✅ Tenant criado:')
    console.log(`   ID: ${tenant.id}`)
    console.log(`   Nome: ${tenant.nome}`)
    console.log(`   Slug: ${tenant.slug}\n`)

    // 2. Criar Admin
    console.log('👤 Criando usuário ADMIN...')
    const userResult = await client.query(`
      INSERT INTO users (
        id, tenant_id, nome, email, senha_hash, tipo, ativo, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        'Administrador Vivoly',
        'admin@vivoly.com',
        '$2b$10$5xFDMH4JIs0NWs8lb53i6eTMRMJCD61ekEIqiv3Py.4QqVRS27Ce2',
        'ADMIN',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (tenant_id, email) DO UPDATE SET nome = EXCLUDED.nome
      RETURNING id, email
    `, [tenant.id])

    const admin = userResult.rows[0]
    console.log('✅ Admin criado:')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SETUP CONCLUÍDO!\n')
    console.log('🔑 Credenciais:')
    console.log('   Email: admin@vivoly.com')
    console.log('   Senha: admin123\n')
    console.log('📝 Para testar:')
    console.log(`   http://localhost:3000/login`)
    console.log(`   (O middleware vai detectar o tenant automaticamente)\n`)

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    throw error
  } finally {
    await client.end()
    console.log('🔌 Conexão fechada')
  }
}

createTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
