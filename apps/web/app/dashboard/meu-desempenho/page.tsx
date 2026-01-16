'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
// Importação dos Gráficos (Recharts)
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Cell
} from 'recharts';

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

// Interface para Insights
interface Insight {
  tipo: 'ALERTA' | 'DICA' | 'INFO' | 'SUCESSO';
  icone: string;
  titulo: string;
  texto: string;
  acao?: string;
  prioridade: number;
  dados?: {
    count?: number;
    leads?: { id: string; nome: string; telefone: string; dias_sem_contato?: number }[];
  };
}

// Cores e estilos por tipo de insight
const insightStyles: Record<string, { bg: string; border: string; iconBg: string; iconText: string; titleColor: string; textColor: string }> = {
  ALERTA: {
    bg: 'from-red-50 to-orange-50',
    border: 'border-red-200',
    iconBg: 'bg-red-500',
    iconText: 'text-white',
    titleColor: 'text-red-900',
    textColor: 'text-red-700'
  },
  DICA: {
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-500',
    iconText: 'text-white',
    titleColor: 'text-yellow-900',
    textColor: 'text-yellow-700'
  },
  INFO: {
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-500',
    iconText: 'text-white',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-700'
  },
  SUCESSO: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-500',
    iconText: 'text-white',
    titleColor: 'text-green-900',
    textColor: 'text-green-700'
  }
};

// Componente para um único Insight da Sofia
const SofiaInsightCard = ({ insight, onAction }: { insight: Insight; onAction?: (acao: string) => void }) => {
  const style = insightStyles[insight.tipo] || insightStyles.INFO;

  return (
    <div className={`bg-gradient-to-r ${style.bg} border ${style.border} rounded-xl p-4 flex items-start gap-3`}>
      <div className={`${style.iconBg} ${style.iconText} p-2 rounded-full shrink-0`}>
        <span className="text-xl">{insight.icone}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-bold ${style.titleColor}`}>{insight.titulo}</h3>
        <p className={`text-sm ${style.textColor} mt-1`}>{insight.texto}</p>
        {insight.dados?.leads && insight.dados.leads.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {insight.dados.leads.slice(0, 3).map((lead, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/70 text-gray-700 border">
                {lead.nome.split(' ')[0]}
                {lead.dias_sem_contato && <span className="ml-1 text-red-500">({lead.dias_sem_contato}d)</span>}
              </span>
            ))}
            {insight.dados.leads.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/70 text-gray-500">
                +{insight.dados.leads.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      {insight.acao && onAction && (
        <button
          onClick={() => onAction(insight.acao!)}
          className={`shrink-0 bg-white ${style.textColor} text-xs font-bold px-3 py-2 rounded-lg border ${style.border} hover:bg-gray-50 transition-colors shadow-sm`}
        >
          Ver
        </button>
      )}
    </div>
  );
};

// Widget completo de Insights da Sofia
const SofiaInsightsWidget = ({ insights, onAction }: { insights: Insight[]; onAction: (acao: string) => void }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <div className="bg-green-500 text-white p-2 rounded-full shrink-0">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-green-900">Sofia está satisfeita! ✨</h3>
          <p className="text-sm text-green-700 mt-1">
            Parabéns! Você está em dia com seus leads. Continue assim!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🤖</span>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Insights da Sofia</h2>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
          {insights.length} {insights.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>
      {insights.slice(0, 3).map((insight, idx) => (
        <SofiaInsightCard key={idx} insight={insight} onAction={onAction} />
      ))}
      {insights.length > 3 && (
        <p className="text-xs text-gray-500 text-center">
          + {insights.length - 3} outros insights...
        </p>
      )}
    </div>
  );
};

export default function MeuDesempenhoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/corretores/meu-dashboard');
      setData(response.data.data);

      // Carregar insights da Sofia em paralelo
      loadInsights();
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

  const loadInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await api.get('/insights/meus');
      setInsights(response.data.insights || []);
    } catch (err) {
      console.error('Erro ao carregar insights:', err);
      setInsights([]);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleNavigateToLeads = (filter: string) => {
    // Redireciona para a página de leads com o filtro aplicado
    router.push(`/leads?status=${filter}`);
  };

  const handleNewVisit = () => {
    // Redireciona para o formulário de novo agendamento
    router.push('/agenda/novo');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  // Cálculos auxiliares
  const progressoMetaMensal = data.corretor.metaMensal > 0
    ? Math.min(100, (data.vendas.totalMes / data.corretor.metaMensal) * 100)
    : 0;

  // Dados para o Funil de Vendas
  const funnelData = [
    { name: 'Leads Totais', value: data.leads.total, color: '#94a3b8' },
    { name: 'Em Negociação', value: data.negociacoes.ativas + data.negociacoes.fechadas, color: '#60a5fa' },
    { name: 'Fechados', value: data.negociacoes.fechadas, color: '#00C48C' },
  ];

  return (
    <div className="space-y-6 pb-10">
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

      {/* Widget IA Sofia - Insights Dinâmicos */}
      {loadingInsights ? (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="text-sm text-indigo-700">Sofia está analisando seus leads...</span>
        </div>
      ) : (
        <SofiaInsightsWidget
          insights={insights}
          onAction={(acao) => {
            // Mapear ações para navegação
            switch (acao) {
              case 'FILTRAR_QUENTES_ESQUECIDOS':
              case 'FILTRAR_MORNOS_ESQUECIDOS':
                handleNavigateToLeads('QUENTE');
                break;
              case 'FILTRAR_NOVOS':
              case 'FILTRAR_ONTEM_SEM_CONTATO':
                handleNavigateToLeads('');
                break;
              case 'VER_AGENDA':
                router.push('/dashboard/agendamentos');
                break;
              case 'VER_NEGOCIACOES':
                router.push('/dashboard/negociacoes');
                break;
              default:
                router.push('/dashboard/leads');
            }
          }}
        />
      )}

      {/* Cards principais (KPIs) */}
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

        {/* Comissões */}
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
            {data.negociacoes.fechadas} de {data.leads.total} leads totais
          </p>
        </div>
      </div>

      {/* Seção Operacional e Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Status dos Leads (Com Interatividade) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📊 Status da Carteira</h3>
            <button 
              onClick={() => router.push('/leads')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Novos este mês</span>
                <span className="text-lg font-bold text-blue-600">{data.leads.novosMes}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Botão Leads Quentes */}
              <div 
                onClick={() => handleNavigateToLeads('QUENTE')}
                className="group flex justify-between items-center p-2 hover:bg-red-50 rounded transition-all cursor-pointer border-l-4 border-red-500 shadow-sm hover:shadow-md"
              >
                <span className="text-gray-700 flex items-center gap-2">
                  🔥 Quentes (Prioridade)
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-red-500 font-semibold transition-opacity">Ver →</span>
                </span>
                <span className="font-bold text-red-600 text-lg">{data.leads.quentes}</span>
              </div>

              {/* Botão Leads Mornos */}
              <div 
                onClick={() => handleNavigateToLeads('MORNO')}
                className="group flex justify-between items-center p-2 hover:bg-yellow-50 rounded transition-all cursor-pointer border-l-4 border-yellow-500 hover:shadow-sm"
              >
                <span className="text-gray-700 flex items-center gap-2">
                  ⚡ Mornos
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-yellow-600 font-semibold transition-opacity">Ver →</span>
                </span>
                <span className="font-bold text-yellow-600 text-lg">{data.leads.mornos}</span>
              </div>

              {/* Botão Leads Frios */}
              <div 
                onClick={() => handleNavigateToLeads('FRIO')}
                className="group flex justify-between items-center p-2 hover:bg-blue-50 rounded transition-all cursor-pointer border-l-4 border-blue-500 hover:shadow-sm"
              >
                <span className="text-gray-700 flex items-center gap-2">
                   ❄️ Frios
                   <span className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 font-semibold transition-opacity">Ver →</span>
                </span>
                <span className="font-bold text-blue-600 text-lg">{data.leads.frios}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2 e 3: Gráficos de BI */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gráfico 1: Evolução Financeira */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evolução de Vendas</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.evolucaoMensal}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === 'valor' ? formatCurrency(value) : value,
                        name === 'valor' ? 'Vendas' : 'Leads'
                      ]}
                      labelStyle={{ color: '#333' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="valor" name="Vendas (R$)" fill="#00C48C" radius={[4, 4, 0, 0]} barSize={30} />
                    <Line yAxisId="right" type="monotone" dataKey="leads" name="Total Leads" stroke="#3b82f6" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Funil de Vendas Visual */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌪️ Funil de Conversão</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={funnelData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>
      </div>

      {/* Tabelas Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">📅 Agenda (Próximos)</h3>
              {/* Action Button: Nova Visita */}
              <button 
                onClick={handleNewVisit}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200 transition-colors"
                title="Nova Visita"
              >
                <span className="text-xl font-bold leading-none mb-0.5">+</span>
              </button>
            </div>
            
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {data.agendamentos.hoje} Visitas Hoje
            </span>
          </div>
          
          {data.proximosAgendamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
               <p className="text-gray-500 mb-2">Nenhuma visita agendada</p>
               <button 
                 onClick={handleNewVisit}
                 className="text-sm text-green-600 font-medium hover:underline"
               >
                 + Agendar visita
               </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.proximosAgendamentos.map((ag) => (
                <div key={ag.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#00C48C]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ag.leadNome}</p>
                      <p className="text-xs text-gray-500">{ag.imovelTitulo}</p>
                      <p className="text-xs text-gray-400 mt-1">📞 {ag.leadTelefone}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-gray-800">
                        {new Date(ag.dataVisita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ag.dataVisita).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                      <span className="inline-flex px-2 py-0.5 mt-1 text-[10px] font-medium rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                        {ag.tipoVisita}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas Negociações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Últimas Movimentações</h3>
          {data.ultimasNegociacoes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma negociação encontrada</p>
          ) : (
            <div className="space-y-3">
              {data.ultimasNegociacoes.slice(0, 5).map((neg) => (
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
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {formatCurrency(neg.valorProposta)}
                    </p>
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