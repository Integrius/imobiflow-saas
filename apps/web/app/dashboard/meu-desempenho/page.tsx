'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface DashboardData {
  corretor: {
    id: string;
    nome: string;
    email: string;
    creci: string;
    telefone: string;
    metaMensal: number;
    metaAnual: number;
    comissaoPadrao: number;
  };
  leads: {
    total: number;
    novosMes: number;
    quentes: number;
    mornos: number;
    frios: number;
  };
  negociacoes: {
    total: number;
    ativas: number;
    fechadas: number;
    fechadasMes: number;
    fechadasAno: number;
    perdidas: number;
  };
  vendas: {
    totalGeral: number;
    totalMes: number;
    totalAno: number;
  };
  comissoes: {
    totalMes: number;
    totalAno: number;
  };
  agendamentos: {
    pendentes: number;
    hoje: number;
    semana: number;
  };
  imoveis: {
    total: number;
  };
  metricas: {
    taxaConversao: number;
  };
  ultimasNegociacoes: Array<{
    id: string;
    codigo: string;
    leadNome: string;
    imovelTitulo: string;
    imovelCodigo: string;
    status: string;
    valorProposta: number;
    updatedAt: string;
  }>;
  proximosAgendamentos: Array<{
    id: string;
    leadNome: string;
    leadTelefone: string;
    imovelTitulo: string;
    imovelCodigo: string;
    dataVisita: string;
    tipoVisita: string;
    status: string;
  }>;
  evolucaoMensal: Array<{
    mes: string;
    leads: number;
    fechados: number;
    valor: number;
  }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  CONTATO: { bg: 'bg-gray-100', text: 'text-gray-800' },
  VISITA_AGENDADA: { bg: 'bg-blue-100', text: 'text-blue-800' },
  VISITA_REALIZADA: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  PROPOSTA: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  ANALISE_CREDITO: { bg: 'bg-orange-100', text: 'text-orange-800' },
  CONTRATO: { bg: 'bg-purple-100', text: 'text-purple-800' },
  FECHADO: { bg: 'bg-green-100', text: 'text-green-800' },
  PERDIDO: { bg: 'bg-red-100', text: 'text-red-800' },
  CANCELADO: { bg: 'bg-gray-200', text: 'text-gray-600' },
};

const statusLabels: Record<string, string> = {
  CONTATO: 'Contato',
  VISITA_AGENDADA: 'Visita Agendada',
  VISITA_REALIZADA: 'Visita Realizada',
  PROPOSTA: 'Proposta',
  ANALISE_CREDITO: 'Análise Crédito',
  CONTRATO: 'Contrato',
  FECHADO: 'Fechado',
  PERDIDO: 'Perdido',
  CANCELADO: 'Cancelado',
};

export default function MeuDesempenhoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/corretores/meu-dashboard');
      setData(response.data.data);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      if (err.response?.status === 403) {
        setError('Você não tem permissão para acessar esta página.');
      } else if (err.response?.status === 404) {
        setError('Corretor não encontrado. Verifique se você está vinculado como corretor.');
      } else {
        setError('Erro ao carregar dados do dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-[#00C48C] text-white rounded-lg hover:bg-[#00A074] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calcular progresso da meta
  const progressoMetaMensal = data.corretor.metaMensal > 0
    ? Math.min(100, (data.vendas.totalMes / data.corretor.metaMensal) * 100)
    : 0;
  const progressoMetaAnual = data.corretor.metaAnual > 0
    ? Math.min(100, (data.vendas.totalAno / data.corretor.metaAnual) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Desempenho</h1>
          <p className="text-gray-600">{data.corretor.nome} • CRECI: {data.corretor.creci}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Atualizar
        </button>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas do Mês */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Vendas do Mês</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.vendas.totalMes)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          {data.corretor.metaMensal > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Meta: {formatCurrency(data.corretor.metaMensal)}</span>
                <span>{progressoMetaMensal.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressoMetaMensal}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Comissões do Mês */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Comissões do Mês</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.comissoes.totalMes)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">💎</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Comissão padrão: {data.corretor.comissaoPadrao}%
          </p>
        </div>

        {/* Negociações Ativas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Negociações Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{data.negociacoes.ativas}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {data.negociacoes.fechadasMes} fechadas este mês
          </p>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{data.metricas.taxaConversao}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {data.negociacoes.fechadas} de {data.leads.total} leads
          </p>
        </div>
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Meus Leads</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{data.leads.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Novos este mês</span>
              <span className="font-semibold text-blue-600">{data.leads.novosMes}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Quentes
              </span>
              <span className="font-semibold text-red-600">{data.leads.quentes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Mornos
              </span>
              <span className="font-semibold text-yellow-600">{data.leads.mornos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Frios
              </span>
              <span className="font-semibold text-blue-600">{data.leads.frios}</span>
            </div>
          </div>
        </div>

        {/* Agendamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Agenda</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Visitas Hoje</span>
              <span className={`font-semibold ${data.agendamentos.hoje > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {data.agendamentos.hoje}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Esta Semana</span>
              <span className="font-semibold text-blue-600">{data.agendamentos.semana}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendentes</span>
              <span className="font-semibold text-yellow-600">{data.agendamentos.pendentes}</span>
            </div>
          </div>
        </div>

        {/* Resumo Anual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Ano Atual</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vendas</span>
              <span className="font-semibold">{formatCurrency(data.vendas.totalAno)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Comissões</span>
              <span className="font-semibold text-green-600">{formatCurrency(data.comissoes.totalAno)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Negócios Fechados</span>
              <span className="font-semibold">{data.negociacoes.fechadasAno}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Imóveis sob gestão</span>
              <span className="font-semibold">{data.imoveis.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evolução Mensal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Evolução nos Últimos 6 Meses</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Mês</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Leads</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Fechados</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.evolucaoMensal.map((mes) => (
                <tr key={mes.mes} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm font-medium text-gray-900">{mes.mes}</td>
                  <td className="text-center py-2 px-3 text-sm text-gray-600">{mes.leads}</td>
                  <td className="text-center py-2 px-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      mes.fechados > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {mes.fechados}
                    </span>
                  </td>
                  <td className="text-right py-2 px-3 text-sm font-medium text-gray-900">
                    {formatCurrency(mes.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabelas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Negociações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Últimas Negociações</h3>
          {data.ultimasNegociacoes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma negociação encontrada</p>
          ) : (
            <div className="space-y-3">
              {data.ultimasNegociacoes.map((neg) => (
                <div key={neg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{neg.leadNome}</p>
                    <p className="text-xs text-gray-500">{neg.imovelTitulo}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      statusColors[neg.status]?.bg || 'bg-gray-100'
                    } ${statusColors[neg.status]?.text || 'text-gray-800'}`}>
                      {statusLabels[neg.status] || neg.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(neg.valorProposta)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos Agendamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Próximas Visitas</h3>
          {data.proximosAgendamentos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma visita agendada</p>
          ) : (
            <div className="space-y-3">
              {data.proximosAgendamentos.map((ag) => (
                <div key={ag.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ag.leadNome}</p>
                      <p className="text-xs text-gray-500">{ag.imovelTitulo}</p>
                      <p className="text-xs text-gray-400 mt-1">📞 {ag.leadTelefone}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-[#00C48C]">
                        {new Date(ag.dataVisita).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ag.dataVisita).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <span className="inline-flex px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {ag.tipoVisita === 'PRESENCIAL' ? '🏠 Presencial' : '💻 Virtual'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
