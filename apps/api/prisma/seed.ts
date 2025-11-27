import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const senhaHashAdmin = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imobiflow.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@imobiflow.com',
      senha_hash: senhaHashAdmin,
      tipo: 'ADMIN',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Criar corretor 1
  const senhaHashCorretor1 = await hash('corretor123', 10)
  const userCorretor1 = await prisma.user.upsert({
    where: { email: 'joao@imobiflow.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao@imobiflow.com',
      senha_hash: senhaHashCorretor1,
      tipo: 'CORRETOR',
      corretor: {
        create: {
          creci: 'CRECI-12345',
          telefone: '11999999999',
          especializacoes: ['APARTAMENTO', 'CASA'],
          meta_mensal: 50000,
          comissao_padrao: 3.5,
        },
      },
    },
  })
  console.log('✅ Corretor 1 criado:', userCorretor1.email)

  // Criar corretor 2
  const senhaHashCorretor2 = await hash('corretor123', 10)
  const userCorretor2 = await prisma.user.upsert({
    where: { email: 'maria@imobiflow.com' },
    update: {},
    create: {
      nome: 'Maria Santos',
      email: 'maria@imobiflow.com',
      senha_hash: senhaHashCorretor2,
      tipo: 'CORRETOR',
      corretor: {
        create: {
          creci: 'CRECI-67890',
          telefone: '11988888888',
          especializacoes: ['COMERCIAL', 'TERRENO'],
          meta_mensal: 75000,
          comissao_padrao: 4.0,
        },
      },
    },
  })
  console.log('✅ Corretor 2 criado:', userCorretor2.email)

  // Buscar os corretores criados
  const corretor1 = await prisma.corretor.findFirst({
    where: { user_id: userCorretor1.id }
  })
  const corretor2 = await prisma.corretor.findFirst({
    where: { user_id: userCorretor2.id }
  })

  if (!corretor1 || !corretor2) {
    throw new Error('Corretores não encontrados')
  }

  // Criar imóveis de exemplo
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
        proprietario_id: admin.id,
      }
    })
    imoveis.push(imovel)
  }
  console.log(`✅ ${imoveis.length} imóveis criados`)

  // Criar leads de exemplo
  const leads = []
  const origens = ['SITE', 'INDICACAO', 'PORTAL', 'WHATSAPP']
  const temperaturas = ['FRIO', 'MORNO', 'QUENTE']

  for (let i = 1; i <= 15; i++) {
    const origem = origens[i % 4] as any
    const temperatura = temperaturas[i % 3] as any

    const lead = await prisma.lead.create({
      data: {
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
  console.log(`✅ ${leads.length} leads criados`)

  // Criar negociações de exemplo
  const negociacoes = []
  const statusNegociacoes = ['CONTATO', 'VISITA_AGENDADA', 'PROPOSTA', 'CONTRATO', 'FECHADO']

  for (let i = 0; i < 8; i++) {
    const statusNeg = statusNegociacoes[i % 5] as any
    const valorProposta = Number(imoveis[i].preco) * 0.95

    const negociacao = await prisma.negociacao.create({
      data: {
        codigo: `NEG-${String(i + 1).padStart(4, '0')}`,
        lead_id: leads[i].id,
        imovel_id: imoveis[i].id,
        corretor_id: i % 2 === 0 ? corretor1.id : corretor2.id,
        status: statusNeg,
        valor_proposta: valorProposta,
        comissoes: [],
      }
    })
    negociacoes.push(negociacao)
  }
  console.log(`✅ ${negociacoes.length} negociações criadas`)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
