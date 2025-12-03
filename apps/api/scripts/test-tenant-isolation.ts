import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
  }
  const reset = '\x1b[0m'
  console.log(`${colors[type]}${message}${reset}`)
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await log(`\n🧪 Testando: ${name}`, 'info')
    await fn()
    await log(`✅ PASSOU: ${name}`, 'success')
    results.push({ name, passed: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    await log(`❌ FALHOU: ${name}\n   Erro: ${errorMessage}`, 'error')
    results.push({ name, passed: false, error: errorMessage })
  }
}

async function cleanup() {
  await log('\n🧹 Limpando dados de teste...', 'info')

  // Deletar apenas tenants de teste
  await prisma.tenant.deleteMany({
    where: {
      slug: {
        in: ['tenant-teste-1', 'tenant-teste-2']
      }
    }
  })

  await log('✅ Limpeza concluída', 'success')
}

async function main() {
  await log('=' .repeat(60), 'info')
  await log('🚀 INICIANDO TESTES DE ISOLAMENTO MULTI-TENANT', 'info')
  await log('=' .repeat(60), 'info')

  let tenant1Id: string
  let tenant2Id: string
  let user1Id: string
  let user2Id: string

  // ============================================================
  // TESTE 1: Criar Tenants
  // ============================================================
  await test('Criar Tenant 1 (Plano PRO)', async () => {
    const tenant1 = await prisma.tenant.create({
      data: {
        nome: 'Imobiliária Teste 1',
        slug: 'tenant-teste-1',
        email: 'teste1@imobiflow.com',
        plano: 'PRO',
        status: 'ATIVO',
        limite_usuarios: 10,
        limite_imoveis: 500,
      }
    })
    tenant1Id = tenant1.id

    if (!tenant1Id) throw new Error('Tenant 1 não foi criado')
    if (tenant1.plano !== 'PRO') throw new Error('Plano incorreto')
  })

  await test('Criar Tenant 2 (Plano BASICO)', async () => {
    const tenant2 = await prisma.tenant.create({
      data: {
        nome: 'Imobiliária Teste 2',
        slug: 'tenant-teste-2',
        email: 'teste2@imobiflow.com',
        plano: 'BASICO',
        status: 'ATIVO',
        limite_usuarios: 3,
        limite_imoveis: 100,
      }
    })
    tenant2Id = tenant2.id

    if (!tenant2Id) throw new Error('Tenant 2 não foi criado')
    if (tenant2.plano !== 'BASICO') throw new Error('Plano incorreto')
  })

  // ============================================================
  // TESTE 2: Isolamento de Usuários
  // ============================================================
  await test('Criar usuário no Tenant 1', async () => {
    const user1 = await prisma.user.create({
      data: {
        tenant_id: tenant1Id,
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha_hash: 'hash123',
        tipo: 'CORRETOR',
      }
    })
    user1Id = user1.id

    if (!user1Id) throw new Error('Usuário 1 não foi criado')
    if (user1.tenant_id !== tenant1Id) throw new Error('Tenant ID incorreto')
  })

  await test('Criar usuário com mesmo email no Tenant 2 (deve passar)', async () => {
    const user2 = await prisma.user.create({
      data: {
        tenant_id: tenant2Id,
        nome: 'João Silva',
        email: 'joao@teste.com', // Mesmo email, mas tenant diferente
        senha_hash: 'hash456',
        tipo: 'CORRETOR',
      }
    })
    user2Id = user2.id

    if (!user2Id) throw new Error('Usuário 2 não foi criado')
    if (user2.tenant_id !== tenant2Id) throw new Error('Tenant ID incorreto')
  })

  await test('Buscar usuários do Tenant 1 (deve retornar 1)', async () => {
    const users = await prisma.user.findMany({
      where: { tenant_id: tenant1Id }
    })

    if (users.length !== 1) {
      throw new Error(`Esperado 1 usuário, encontrado ${users.length}`)
    }
    if (users[0].email !== 'joao@teste.com') {
      throw new Error('Email incorreto')
    }
  })

  await test('Buscar usuários do Tenant 2 (deve retornar 1)', async () => {
    const users = await prisma.user.findMany({
      where: { tenant_id: tenant2Id }
    })

    if (users.length !== 1) {
      throw new Error(`Esperado 1 usuário, encontrado ${users.length}`)
    }
  })

  // ============================================================
  // TESTE 3: Isolamento de Leads
  // ============================================================
  await test('Criar lead no Tenant 1', async () => {
    const lead1 = await prisma.lead.create({
      data: {
        tenant_id: tenant1Id,
        nome: 'Lead do Tenant 1',
        telefone: '11999999991',
        email: 'lead1@teste.com',
        origem: 'SITE',
        temperatura: 'QUENTE',
        score: 80,
        interesse: {
          tipo_imovel: ['APARTAMENTO'],
          finalidade: 'COMPRA'
        }
      }
    })

    if (lead1.tenant_id !== tenant1Id) {
      throw new Error('Tenant ID incorreto')
    }
  })

  await test('Criar lead no Tenant 2', async () => {
    const lead2 = await prisma.lead.create({
      data: {
        tenant_id: tenant2Id,
        nome: 'Lead do Tenant 2',
        telefone: '11999999992',
        email: 'lead2@teste.com',
        origem: 'WHATSAPP',
        temperatura: 'MORNO',
        score: 60,
        interesse: {
          tipo_imovel: ['CASA'],
          finalidade: 'ALUGUEL'
        }
      }
    })

    if (lead2.tenant_id !== tenant2Id) {
      throw new Error('Tenant ID incorreto')
    }
  })

  await test('Tenant 1 não vê leads do Tenant 2', async () => {
    const leads = await prisma.lead.findMany({
      where: { tenant_id: tenant1Id }
    })

    if (leads.length !== 1) {
      throw new Error(`Tenant 1 deveria ver 1 lead, mas vê ${leads.length}`)
    }

    if (leads[0].nome !== 'Lead do Tenant 1') {
      throw new Error('Lead incorreto retornado')
    }
  })

  await test('Tenant 2 não vê leads do Tenant 1', async () => {
    const leads = await prisma.lead.findMany({
      where: { tenant_id: tenant2Id }
    })

    if (leads.length !== 1) {
      throw new Error(`Tenant 2 deveria ver 1 lead, mas vê ${leads.length}`)
    }

    if (leads[0].nome !== 'Lead do Tenant 2') {
      throw new Error('Lead incorreto retornado')
    }
  })

  // ============================================================
  // TESTE 4: Isolamento de Corretores
  // ============================================================
  await test('Criar corretor no Tenant 1', async () => {
    const corretor1 = await prisma.corretor.create({
      data: {
        tenant_id: tenant1Id,
        user_id: user1Id,
        creci: 'CRECI-12345',
        telefone: '11988888881',
        comissao_padrao: 5.0,
      }
    })

    if (corretor1.tenant_id !== tenant1Id) {
      throw new Error('Tenant ID incorreto')
    }
  })

  await test('Criar corretor com mesmo CRECI no Tenant 2 (deve passar)', async () => {
    const corretor2 = await prisma.corretor.create({
      data: {
        tenant_id: tenant2Id,
        user_id: user2Id,
        creci: 'CRECI-12345', // Mesmo CRECI, mas tenant diferente
        telefone: '11988888882',
        comissao_padrao: 6.0,
      }
    })

    if (corretor2.tenant_id !== tenant2Id) {
      throw new Error('Tenant ID incorreto')
    }
  })

  await test('Tenant 1 não vê corretores do Tenant 2', async () => {
    const corretores = await prisma.corretor.findMany({
      where: { tenant_id: tenant1Id }
    })

    if (corretores.length !== 1) {
      throw new Error(`Esperado 1 corretor, encontrado ${corretores.length}`)
    }
  })

  // ============================================================
  // TESTE 5: Isolamento de Proprietários
  // ============================================================
  await test('Criar proprietário no Tenant 1', async () => {
    const prop1 = await prisma.proprietario.create({
      data: {
        tenant_id: tenant1Id,
        nome: 'Maria Santos',
        cpf_cnpj: '12345678900',
        tipo_pessoa: 'FISICA',
        email: 'maria@teste.com',
        telefone: '11977777771',
        contato: {
          email: 'maria@teste.com',
          telefone_principal: '11977777771',
        },
        forma_pagamento: 'TRANSFERENCIA',
        percentual_comissao: 5.0,
      }
    })

    if (prop1.tenant_id !== tenant1Id) {
      throw new Error('Tenant ID incorreto')
    }
  })

  await test('Criar proprietário com mesmo CPF no Tenant 2 (deve passar)', async () => {
    const prop2 = await prisma.proprietario.create({
      data: {
        tenant_id: tenant2Id,
        nome: 'Maria Santos',
        cpf_cnpj: '12345678900', // Mesmo CPF, mas tenant diferente
        tipo_pessoa: 'FISICA',
        email: 'maria2@teste.com',
        telefone: '11977777772',
        contato: {
          email: 'maria2@teste.com',
          telefone_principal: '11977777772',
        },
        forma_pagamento: 'BOLETO',
        percentual_comissao: 6.0,
      }
    })

    if (prop2.tenant_id !== tenant2Id) {
      throw new Error('Tenant ID incorreto')
    }
  })

  // ============================================================
  // TESTE 6: Verificar Tenant Padrão
  // ============================================================
  await test('Verificar se tenant padrão existe', async () => {
    const defaultTenant = await prisma.tenant.findUnique({
      where: { id: 'default-tenant-id' }
    })

    if (!defaultTenant) {
      throw new Error('Tenant padrão não encontrado. Execute a migration primeiro!')
    }

    if (defaultTenant.slug !== 'default') {
      throw new Error('Slug do tenant padrão está incorreto')
    }
  })

  // ============================================================
  // LIMPEZA
  // ============================================================
  await cleanup()

  // ============================================================
  // RESUMO DOS RESULTADOS
  // ============================================================
  await log('\n' + '='.repeat(60), 'info')
  await log('📊 RESUMO DOS TESTES', 'info')
  await log('='.repeat(60), 'info')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  await log(`\nTotal de testes: ${total}`, 'info')
  await log(`✅ Passou: ${passed}`, 'success')
  await log(`❌ Falhou: ${failed}`, 'error')
  await log(`📈 Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%\n`, 'info')

  if (failed > 0) {
    await log('Testes que falharam:', 'error')
    results.filter(r => !r.passed).forEach(r => {
      log(`  - ${r.name}: ${r.error}`, 'error')
    })
  }

  await log('='.repeat(60), 'info')

  if (failed === 0) {
    await log('\n🎉 TODOS OS TESTES PASSARAM!', 'success')
    await log('✅ O sistema multi-tenant está funcionando corretamente!\n', 'success')
    process.exit(0)
  } else {
    await log('\n⚠️  ALGUNS TESTES FALHARAM', 'error')
    await log('❌ Verifique os erros acima e corrija antes de usar em produção\n', 'error')
    process.exit(1)
  }
}

main()
  .catch(async (error) => {
    await log('\n💥 ERRO FATAL AO EXECUTAR TESTES:', 'error')
    console.error(error)
    await cleanup()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
