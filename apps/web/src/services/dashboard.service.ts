import { api } from '@/lib/api'

export interface DashboardOverview {
  leads: {
    total: number
    quentes: number
  }
  imoveis: {
    total: number
    disponiveis: number
  }
  negociacoes: {
    total: number
    fechadas: number
    taxaConversao: number
  }
}

export interface LeadsByOrigem {
  origem: string
  total: number
}

export interface LeadsByTemperatura {
  temperatura: string
  total: number
}

export interface NegociacoesByStatus {
  status: string
  total: number
}

export interface ImoveisByTipo {
  tipo: string
  total: number
}

export interface ImoveisByCategoria {
  categoria: string
  total: number
}

export interface PerformanceCorretor {
  id: string
  nome: string
  email: string
  creci: string
  totalLeads: number
  totalNegociacoes: number
  negociacoesFechadas: number
  performanceScore: number
}

export interface FunilVendas {
  status: string
  total: number
}

export interface RecentActivity {
  recentLeads: Array<{
    id: string
    nome: string
    telefone: string
    origem: string
    temperatura: string
    created_at: string
  }>
  recentNegociacoes: Array<{
    id: string
    status: string
    updated_at: string
    lead: {
      nome: string
    }
    imovel: {
      codigo: string
      tipo: string
    }
    corretor: {
      user: {
        nome: string
      }
    }
  }>
}

export interface ValorMedioNegociacoes {
  valorMedio: number
  valorMedioFechadas: number
  totalComValor: number
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get('/dashboard/overview')
    return response.data
  },

  async getLeadsByOrigem(): Promise<LeadsByOrigem[]> {
    const response = await api.get('/dashboard/leads/origem')
    return response.data
  },

  async getLeadsByTemperatura(): Promise<LeadsByTemperatura[]> {
    const response = await api.get('/dashboard/leads/temperatura')
    return response.data
  },

  async getNegociacoesByStatus(): Promise<NegociacoesByStatus[]> {
    const response = await api.get('/dashboard/negociacoes/status')
    return response.data
  },

  async getImoveisByTipo(): Promise<ImoveisByTipo[]> {
    const response = await api.get('/dashboard/imoveis/tipo')
    return response.data
  },

  async getImoveisByCategoria(): Promise<ImoveisByCategoria[]> {
    const response = await api.get('/dashboard/imoveis/categoria')
    return response.data
  },

  async getPerformanceCorretores(): Promise<PerformanceCorretor[]> {
    const response = await api.get('/dashboard/corretores/performance')
    return response.data
  },

  async getFunilVendas(): Promise<FunilVendas[]> {
    const response = await api.get('/dashboard/funil')
    return response.data
  },

  async getRecentActivity(limit?: number): Promise<RecentActivity> {
    const response = await api.get('/dashboard/activity', {
      params: limit ? { limit } : undefined
    })
    return response.data
  },

  async getValorMedioNegociacoes(): Promise<ValorMedioNegociacoes> {
    const response = await api.get('/dashboard/valores')
    return response.data
  },
}
