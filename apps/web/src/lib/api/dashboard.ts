import { apiClient } from './client'

export interface DashboardStats {
  totalLeads: number
  totalImoveis: number
  totalCorretores: number
  negociacoesEmAndamento: number
  leadsPorOrigem: Record<string, number>
  negociacoesPorStatus: Record<string, number>
  conversaoFunil: {
    leads: number
    visitasAgendadas: number
    visitasRealizadas: number
    propostas: number
    fechados: number
  }
  evolucaoMensal: Array<{
    mes: string
    leads: number
    negociacoes: number
    fechamentos: number
  }>
  topCorretores: Array<{
    id: string
    nome: string
    totalNegociacoes: number
    totalFechados: number
    valorTotal: number
  }>
}

export const dashboardService = {
  async getStats() {
    const { data } = await apiClient.get<DashboardStats>('/api/v1/dashboard')
    return data
  },
}
