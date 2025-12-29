import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados multi-tenant...\n')

  // ============================================
  // 1. CRIAR TENANT VIVOLY
  // ============================================
  console.log('📦 Criando tenant Vivoly...')
  const tenantVivoly = await prisma.tenant.upsert({
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
      total_usuarios: 0,
      total_imoveis: 0
    }
  })
  console.log(`✅ Tenant criado: ${tenantVivoly.nome} (${tenantVivoly.subdominio}.integrius.com.br)\n`)

  // ============================================
  // 2. CRIAR USUÁRIO ADMIN DO TENANT VIVOLY
  // ============================================
  console.log('👤 Criando usuário ADMIN...')
  const senhaHashAdmin = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: tenantVivoly.id,
        email: 'admin@vivoly.com'
      }
    },
    update: {},
    create: {
      tenant_id: tenantVivoly.id,
      nome: 'Administrador Vivoly',
      email: 'admin@vivoly.com',
      senha_hash: senhaHashAdmin,
      tipo: 'ADMIN',
      ativo: true
    },
  })
  console.log(`✅ ADMIN criado: ${admin.email}`)
  console.log(`   Senha: admin123`)
  console.log(`   Tipo: ${admin.tipo}\n`)

  // ============================================
  // 3. CRIAR USUÁRIO GESTOR
  // ============================================
  console.log('👤 Criando usuário GESTOR...')
  const senhaHashGestor = await hash('gestor123', 10)
  const gestor = await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: tenantVivoly.id,
        email: 'gestor@vivoly.com'
      }
    },
    update: {},
    create: {
      tenant_id: tenantVivoly.id,
      nome: 'Carlos Gestor',
      email: 'gestor@vivoly.com',
      senha_hash: senhaHashGestor,
      tipo: 'GESTOR',
      ativo: true
    },
  })
  console.log(`✅ GESTOR criado: ${gestor.email}`)
  console.log(`   Senha: gestor123`)
  console.log(`   Tipo: ${gestor.tipo}\n`)

  // ============================================
  // 4. CRIAR CORRETORES
  // ============================================
  console.log('👥 Criando corretores...')

  // Corretor 1
  const senhaHashCorretor1 = await hash('corretor123', 10)
  const userCorretor1 = await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: tenantVivoly.id,
        email: 'joao@vivoly.com'
      }
    },
    update: {},
    create: {
      tenant_id: tenantVivoly.id,
      nome: 'João Silva',
      email: 'joao@vivoly.com',
      senha_hash: senhaHashCorretor1,
      tipo: 'CORRETOR',
      ativo: true
    },
  })

  await prisma.corretor.upsert({
    where: { user_id: userCorretor1.id },
    update: {},
    create: {
      tenant_id: tenantVivoly.id,
      user_id: userCorretor1.id,
      creci: 'CRECI-12345',
      telefone: '11999999999',
      especializacoes: ['APARTAMENTO', 'CASA'],
      meta_mensal: 50000,
      comissao_padrao: 3.5,
    }
  })
  console.log(`✅ CORRETOR 1 criado: ${userCorretor1.email} (senha: corretor123)`)

  // Corretor 2
  const senhaHashCorretor2 = await hash('corretor123', 10)
  const userCorretor2 = await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: tenantVivoly.id,
        email: 'maria@vivoly.com'
      }
    },
    update: {},
    create: {
      tenant_id: tenantVivoly.id,
      nome: 'Maria Santos',
      email: 'maria@vivoly.com',
      senha_hash: senhaHashCorretor2,
      tipo: 'CORRETOR',
      ativo: true
    },
  })

  await prisma.corretor.upsert({
    where: { user_id: userCorretor2.id },
    update: {},
    create: {
      tenant_id: tenantVivoly.id,
      user_id: userCorretor2.id,
      creci: 'CRECI-67890',
      telefone: '11988888888',
      especializacoes: ['COMERCIAL', 'TERRENO'],
      meta_mensal: 75000,
      comissao_padrao: 4.0,
    }
  })
  console.log(`✅ CORRETOR 2 criado: ${userCorretor2.email} (senha: corretor123)\n`)

  // ============================================
  // 5. CRIAR PROPRIETÁRIOS
  // ============================================
  console.log('🏢 Criando proprietários...')

  const proprietario1 = await prisma.proprietario.create({
    data: {
      tenant_id: tenantVivoly.id,
      nome: 'Proprietário Silva',
      cpf_cnpj: '12345678901',
      tipo_pessoa: 'FISICA',
      telefone: '11987654321',
      email: 'proprietario@example.com',
      forma_pagamento: 'PIX',
      percentual_comissao: 5.0
    }
  })
  console.log(`✅ Proprietário criado: ${proprietario1.nome}\n`)

  // ============================================
  // 6. CRIAR IMÓVEIS DE EXEMPLO
  // ============================================
  console.log('🏠 Criando imóveis...')
  const imoveis = []
  const tipos = ['APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO']
  const categorias = ['VENDA', 'LOCACAO']
  const statusList = ['VENDIDO', 'ALUGADO', 'RESERVADO']

  for (let i = 1; i <= 10; i++) {
    const tipo = tipos[i % 4] as any
    const categoria = categorias[i % 2] as any
    const status = (i <= 6 ? 'DISPONIVEL' : statusList[i % 3]) as any
    const preco = 150000 + (i * 50000)

    const imovel = await prisma.imovel.create({
      data: {
        tenant_id: tenantVivoly.id,
        codigo: `IMV-${String(i).padStart(4, '0')}`,
        tipo,
        categoria,
        status,
        endereco: {
          rua: `Rua Exemplo ${i}`,
          numero: String(100 + i),
          bairro: ['Centro', 'Jardins', 'Vila Nova', 'Boa Vista'][i % 4],
          cidade: 'São Paulo',
          estado: 'SP',
          cep: `01000-${String(i).padStart(3, '0')}`,
        },
        caracteristicas: {
          area_total: 50 + (i * 10),
          area_construida: 40 + (i * 8),
          quartos: 1 + (i % 4),
          banheiros: 1 + (i % 3),
          vagas_garagem: i % 3,
        },
        titulo: `${tipo} ${categoria === 'VENDA' ? 'à venda' : 'para locação'} - ${i}`,
        descricao: `Excelente ${tipo.toLowerCase()} localizado em ${['Centro', 'Jardins', 'Vila Nova', 'Boa Vista'][i % 4]}`,
        diferenciais: ['Localização privilegiada', 'Bem conservado'],
        fotos: [],
        documentos: [],
        preco,
        proprietario_id: proprietario1.id,
      }
    })
    imoveis.push(imovel)
  }
  console.log(`✅ ${imoveis.length} imóveis criados\n`)

  // ============================================
  // 7. CRIAR LEADS DE EXEMPLO
  // ============================================
  console.log('📞 Criando leads...')

  // Buscar corretores criados
  const corretor1 = await prisma.corretor.findFirst({
    where: { user_id: userCorretor1.id }
  })
  const corretor2 = await prisma.corretor.findFirst({
    where: { user_id: userCorretor2.id }
  })

  if (!corretor1 || !corretor2) {
    throw new Error('Corretores não encontrados')
  }

  const leads = []
  const origens = ['SITE', 'INDICACAO', 'PORTAL', 'WHATSAPP']
  const temperaturas = ['FRIO', 'MORNO', 'QUENTE']

  for (let i = 1; i <= 15; i++) {
    const origem = origens[i % 4] as any
    const temperatura = temperaturas[i % 3] as any

    const lead = await prisma.lead.create({
      data: {
        tenant_id: tenantVivoly.id,
        nome: `Lead ${i}`,
        email: `lead${i}@example.com`,
        telefone: `11${String(900000000 + i)}`,
        origem,
        temperatura,
        interesse: {
          tipo_imovel: tipos[i % 4],
          categoria: categorias[i % 2],
          valor_min: 100000,
          valor_max: 500000,
          bairros: [['Centro', 'Jardins', 'Vila Nova', 'Boa Vista'][i % 4]],
        },
        timeline: [],
        corretor_id: i % 2 === 0 ? corretor1.id : corretor2.id,
      }
    })
    leads.push(lead)
  }
  console.log(`✅ ${leads.length} leads criados\n`)

  // ============================================
  // 8. CRIAR NEGOCIAÇÕES DE EXEMPLO
  // ============================================
  console.log('💼 Criando negociações...')
  const negociacoes = []
  const statusNegociacoes = ['CONTATO', 'VISITA_AGENDADA', 'PROPOSTA', 'CONTRATO', 'FECHADO']

  for (let i = 0; i < 8; i++) {
    const statusNeg = statusNegociacoes[i % 5] as any
    const valorProposta = Number(imoveis[i].preco) * 0.95

    const negociacao = await prisma.negociacao.create({
      data: {
        tenant_id: tenantVivoly.id,
        codigo: `NEG-${String(i + 1).padStart(4, '0')}`,
        lead_id: leads[i].id,
        imovel_id: imoveis[i].id,
        corretor_id: i % 2 === 0 ? corretor1.id : corretor2.id,
        status: statusNeg,
        valor_proposta: valorProposta,
        comissoes: [],
        timeline: [],
        documentos: []
      }
    })
    negociacoes.push(negociacao)
  }
  console.log(`✅ ${negociacoes.length} negociações criadas\n`)

  // ============================================
  // 9. ATUALIZAR CONTADORES DO TENANT
  // ============================================
  console.log('📊 Atualizando contadores do tenant...')
  await prisma.tenant.update({
    where: { id: tenantVivoly.id },
    data: {
      total_usuarios: 4, // 1 admin + 1 gestor + 2 corretores
      total_imoveis: imoveis.length
    }
  })
  console.log('✅ Contadores atualizados\n')

  // ============================================
  // RESUMO
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 SEED CONCLUÍDO COM SUCESSO!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📦 TENANT CRIADO:')
  console.log(`   Nome: ${tenantVivoly.nome}`)
  console.log(`   Subdomínio: ${tenantVivoly.subdominio}.integrius.com.br`)
  console.log(`   Status: ${tenantVivoly.status}`)
  console.log(`   Plano: ${tenantVivoly.plano}\n`)

  console.log('👥 USUÁRIOS CRIADOS:')
  console.log(`   ✅ 1 ADMIN: admin@vivoly.com (senha: admin123)`)
  console.log(`   ✅ 1 GESTOR: gestor@vivoly.com (senha: gestor123)`)
  console.log(`   ✅ 2 CORRETORES: joao@vivoly.com, maria@vivoly.com (senha: corretor123)\n`)

  console.log('📊 DADOS DE EXEMPLO:')
  console.log(`   ✅ ${imoveis.length} imóveis`)
  console.log(`   ✅ ${leads.length} leads`)
  console.log(`   ✅ ${negociacoes.length} negociações\n`)

  console.log('🔑 ACESSO:')
  console.log('   URL: https://vivoly.integrius.com.br')
  console.log('   Dev: http://localhost:3000?tenant_id=' + tenantVivoly.id)
  console.log('   API: POST /api/v1/auth/login')
  console.log('   Body: { "email": "admin@vivoly.com", "senha": "admin123" }\n')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
