'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { dashboardService } from '@/services/dashboard.service'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { EvolutionChart } from '@/components/dashboard/evolution-chart'
import { TopCorretores } from '@/components/dashboard/top-corretores'
import { LeadsPieChart } from '@/components/dashboard/leads-pie-chart'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Home, Users, Briefcase, RefreshCw } from 'lucide-react'

interface ConversaoFunil {
  leads: number
  visitasAgendadas: number
  visitasRealizadas: number
  propostas: number
  fechados: number
}

interface EvolucaoMensal {
  mes: string
  leads: number
  negociacoes: number
  fechamentos: number
}

interface TopCorretor {
  id: string
  nome: string
  totalNegociacoes: number
  totalFechados: number
  valorTotal: number
}

interface DashboardStats {
  totalLeads: number
  totalImoveis: number
  totalCorretores: number
  negociacoesEmAndamento: number
  negociacoesFechadas: number
  imoveisDisponiveis: number
  leadsQuentes: number
  conversaoFunil?: ConversaoFunil
  evolucaoMensal?: EvolucaoMensal[]
  topCorretores?: TopCorretor[]
  leadsPorOrigem?: Record<string, number>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    async function loadDashboardData() {
      if (!isAuthenticated) return

      try {
        setIsLoading(true)
        setError(null)
        const [overview, leadsByOrigem, performanceCorretores] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getLeadsByOrigem(),
          dashboardService.getPerformanceCorretores(),
        ])

        // Converter leadsByOrigem de array para objeto
        const leadsPorOrigem = leadsByOrigem.reduce((acc: Record<string, number>, item) => {
          acc[item.origem] = item.total
          return acc
        }, {})

        // Calcular negociações em andamento (total - fechadas)
        const negociacoesEmAndamento = overview.negociacoes.total - overview.negociacoes.fechadas

        setStats({
          totalLeads: overview.leads.total,
          totalImoveis: overview.imoveis.total,
          totalCorretores: performanceCorretores.length,
          negociacoesEmAndamento,
          negociacoesFechadas: overview.negociacoes.fechadas,
          imoveisDisponiveis: overview.imoveis.disponiveis,
          leadsQuentes: overview.leads.quentes,
          leadsPorOrigem,
          topCorretores: performanceCorretores.slice(0, 5).map(c => ({
            id: c.id,
            nome: c.nome,
            totalNegociacoes: c.totalNegociacoes,
            totalFechados: c.negociacoesFechadas,
            valorTotal: 0, // TODO: adicionar valor total quando disponível
          })),
        })
      } catch (error: any) {
        console.error('Erro ao carregar dados do dashboard:', error)
        setError(error?.response?.data?.error || 'Erro ao carregar dados do dashboard. Verifique se a API está rodando.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao Carregar Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Imóveis Cadastrados',
      value: stats.totalImoveis || 0,
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Corretores Ativos',
      value: stats.totalCorretores || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Negociações Ativas',
      value: stats.negociacoesEmAndamento || 0,
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  // Dados mockados para desenvolvimento (serão substituídos pelos dados reais da API)
  const mockConversaoFunil = stats.conversaoFunil || {
    leads: stats.totalLeads || 150,
    visitasAgendadas: Math.floor((stats.totalLeads || 150) * 0.6),
    visitasRealizadas: Math.floor((stats.totalLeads || 150) * 0.45),
    propostas: Math.floor((stats.totalLeads || 150) * 0.25),
    fechados: Math.floor((stats.totalLeads || 150) * 0.15),
  }

  const mockEvolucaoMensal = stats.evolucaoMensal || [
    { mes: 'Jan', leads: 45, negociacoes: 32, fechamentos: 12 },
    { mes: 'Fev', leads: 52, negociacoes: 38, fechamentos: 15 },
    { mes: 'Mar', leads: 68, negociacoes: 45, fechamentos: 18 },
    { mes: 'Abr', leads: 71, negociacoes: 52, fechamentos: 22 },
    { mes: 'Mai', leads: 85, negociacoes: 58, fechamentos: 25 },
    { mes: 'Jun', leads: 92, negociacoes: 65, fechamentos: 28 },
  ]

  const mockTopCorretores = stats.topCorretores || [
    { id: '1', nome: 'João Silva', totalNegociacoes: 45, totalFechados: 28, valorTotal: 2850000 },
    { id: '2', nome: 'Maria Santos', totalNegociacoes: 38, totalFechados: 22, valorTotal: 2100000 },
    { id: '3', nome: 'Pedro Costa', totalNegociacoes: 32, totalFechados: 18, valorTotal: 1650000 },
    { id: '4', nome: 'Ana Oliveira', totalNegociacoes: 28, totalFechados: 15, valorTotal: 1200000 },
    { id: '5', nome: 'Carlos Souza', totalNegociacoes: 25, totalFechados: 12, valorTotal: 980000 },
  ]

  const mockLeadsPorOrigem = stats.leadsPorOrigem || {
    SITE: 45,
    PORTAL: 38,
    WHATSAPP: 32,
    INDICACAO: 28,
    TELEFONE: 15,
    REDES_SOCIAIS: 12,
    EVENTO: 8,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ImobiFlow Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bem-vindo, {user?.nome || 'Usuário'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FunnelChart data={mockConversaoFunil} />
          <LeadsPieChart data={mockLeadsPorOrigem} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <EvolutionChart data={mockEvolucaoMensal} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <a
                href="/leads"
                className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Ver Leads</span>
                <p className="text-sm text-gray-600">Gerenciar todos os leads</p>
              </a>
              <a
                href="/imoveis"
                className="block px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Ver Imóveis</span>
                <p className="text-sm text-gray-600">Catálogo de imóveis</p>
              </a>
              <a
                href="/negociacoes"
                className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Ver Negociações</span>
                <p className="text-sm text-gray-600">Pipeline de vendas</p>
              </a>
              <a
                href="/corretores"
                className="block px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Ver Corretores</span>
                <p className="text-sm text-gray-600">Equipe de vendas</p>
              </a>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <TopCorretores corretores={mockTopCorretores} />
        </div>
      </main>
    </div>
  )
}
