'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api/auth'
import { useDashboard } from '@/hooks/use-dashboard'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { EvolutionChart } from '@/components/dashboard/evolution-chart'
import { TopCorretores } from '@/components/dashboard/top-corretores'
import { LeadsPieChart } from '@/components/dashboard/leads-pie-chart'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Home, Users, Briefcase, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { stats, isLoading } = useDashboard()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
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
            <p className="text-sm text-gray-600 mt-1">Visão geral do seu negócio</p>
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
