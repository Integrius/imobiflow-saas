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
import ReportDownloadButton from '@/components/ReportDownloadButton';
import {
  DollarSign, Gem, ClipboardList, Target, BarChart3, TrendingUp, Trophy,
  AlertTriangle, Clock, CalendarDays, FileText, RefreshCw, CheckCircle2,
  Flame, Zap, Snowflake, Medal, Bot
} from 'lucide-react';

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

interface RankingData {
  posicao: {
    fechamentos: number;
    valor: number;
    leads: number;
    conversao: number;
  };
  totalCorretores: number;
  meuDesempenho: {
    id: string;
    nome: string;
    fechamentosMes: number;
    valorMes: number;
    leadsMes: number;
    visitasMes: number;
    taxaConversao: number;
  } | null;
  mediaEquipe: {
    fechamentos: number;
    valor: number;
    leads: number;
    conversao: number;
  };
  comparativoMesAnterior: {
    fechamentos: number;
    valor: number;
    leads: number;
  };
  top3: {
    fechamentos: Array<{ nome: string; valor: number }>;
    valor: Array<{ nome: string; valor: number }>;
  };
}

interface MetricasData {
  leadsSemContato: Array<{
    id: string;
    nome: string;
    telefone: string;
    temperatura: string;
    diasSemContato: number;
  }>;
  tempoMedioFechamento: number;
  tempoMedioPrimeiroContato: number;
  funilDetalhado: Array<{ status: string; quantidade: number }>;
  visitas: {
    agendadas: number;
    realizadas: number;
    taxaRealizacao: number;
  };
  leadsPorOrigem: Array<{ origem: string; quantidade: number }>;
  propostasMes: number;
  tarefas: {
    pendentes: number;
    atrasadas: number;
  };
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
        {insight.tipo === 'ALERTA' ? <AlertTriangle className="w-4 h-4" /> :
         insight.tipo === 'SUCESSO' ? <CheckCircle2 className="w-4 h-4" /> :
         insight.tipo === 'DICA' ? <Zap className="w-4 h-4" /> :
         <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-bold ${style.titleColor}`}>{insight.titulo}</h3>
        <p className={`text-sm ${style.textColor} mt-1`}>{insight.texto}</p>
        {insight.dados?.leads && insight.dados.leads.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {insight.dados.leads.slice(0, 3).map((lead, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface/70 text-content-secondary border border-edge">
                {lead.nome.split(' ')[0]}
                {lead.dias_sem_contato && <span className="ml-1 text-red-500">({lead.dias_sem_contato}d)</span>}
              </span>
            ))}
            {insight.dados.leads.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface/70 text-content-tertiary">
                +{insight.dados.leads.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      {insight.acao && onAction && (
        <button
          onClick={() => onAction(insight.acao!)}
          className={`shrink-0 bg-surface ${style.textColor} text-xs font-bold px-3 py-2 rounded-lg border ${style.border} hover:bg-surface-secondary transition-colors shadow-sm`}
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
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-green-900">Sofia está satisfeita!</h3>
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
        <Bot className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-bold text-content-secondary uppercase tracking-wide">Insights da Sofia</h2>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
          {insights.length} {insights.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>
      {insights.slice(0, 3).map((insight, idx) => (
        <SofiaInsightCard key={idx} insight={insight} onAction={onAction} />
      ))}
      {insights.length > 3 && (
        <p className="text-xs text-content-tertiary text-center">
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
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [metricas, setMetricas] = useState<MetricasData | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loadingMetricas, setLoadingMetricas] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/corretores/meu-dashboard');
      setData(response.data.data);

      // Carregar insights da Sofia, ranking e métricas em paralelo
      loadInsights();
      loadRanking();
      loadMetricas();
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

  const loadRanking = async () => {
    try {
      setLoadingRanking(true);
      const response = await api.get('/corretores/meu-ranking');
      setRanking(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setRanking(null);
    } finally {
      setLoadingRanking(false);
    }
  };

  const loadMetricas = async () => {
    try {
      setLoadingMetricas(true);
      const response = await api.get('/corretores/minhas-metricas');
      setMetricas(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
      setMetricas(null);
    } finally {
      setLoadingMetricas(false);
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
    router.push(`/leads?status=${filter}`);
  };

  const handleNewVisit = () => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-content-secondary">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-content mb-2">Erro ao carregar</h2>
          <p className="text-content-secondary mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
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
    { name: 'Clientes Totais', value: data.leads.total, color: '#94a3b8' },
    { name: 'Em Negociação', value: data.negociacoes.ativas + data.negociacoes.fechadas, color: '#60a5fa' },
    { name: 'Fechados', value: data.negociacoes.fechadas, color: '#00C48C' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content">Meu Desempenho</h1>
          <p className="text-content-secondary font-medium">{data.corretor.nome} • CRECI: {data.corretor.creci}</p>
        </div>
        <div className="flex gap-3">
          <ReportDownloadButton
            reportType="corretor"
            params={{
              corretor_id: data.corretor.id,
              mes: new Date().getMonth() + 1,
              ano: new Date().getFullYear()
            }}
            label="Exportar PDF"
          />
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-surface border border-edge text-content rounded-lg hover:bg-surface-secondary transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
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
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-content-secondary">Vendas do Mês</p>
              <p className="text-3xl font-bold text-content">{formatCurrency(data.vendas.totalMes)}</p>
            </div>
            <div className="p-2.5 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          {data.corretor.metaMensal > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-content-tertiary mb-1">
                <span>Meta: {formatCurrency(data.corretor.metaMensal)}</span>
                <span>{progressoMetaMensal.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-surface-tertiary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressoMetaMensal}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Comissões */}
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-content-secondary">Comissões do Mês</p>
              <p className="text-3xl font-bold text-content">{formatCurrency(data.comissoes.totalMes)}</p>
            </div>
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Gem className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-content-tertiary">
            Comissão padrão: {data.corretor.comissaoPadrao}%
          </p>
        </div>

        {/* Negociações Ativas */}
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-content-secondary">Negociações Ativas</p>
              <p className="text-3xl font-bold text-content">{data.negociacoes.ativas}</p>
            </div>
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-content-tertiary">
            {data.negociacoes.fechadasMes} fechadas este mês
          </p>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-content-secondary">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-content">{data.metricas.taxaConversao}%</p>
            </div>
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-content-tertiary">
            {data.negociacoes.fechadas} de {data.leads.total} leads totais
          </p>
        </div>
      </div>

      {/* Seção Operacional e Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna 1: Status dos Leads */}
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-content flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-content-tertiary" /> Status da Carteira
            </h3>
            <button
              onClick={() => router.push('/leads')}
              className="text-xs text-brand hover:text-brand/80 font-medium"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-surface-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-content-secondary font-medium">Novos este mês</span>
                <span className="text-lg font-bold text-blue-600">{data.leads.novosMes}</span>
              </div>
              <div className="w-full bg-surface-tertiary h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Leads Quentes */}
              <div
                onClick={() => handleNavigateToLeads('QUENTE')}
                className="group flex justify-between items-center p-2 hover:bg-red-50 rounded transition-all cursor-pointer border-l-4 border-red-500 shadow-sm hover:shadow-md"
              >
                <span className="text-content-secondary flex items-center gap-2">
                  Quentes (Prioridade)
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-red-500 font-semibold transition-opacity">Ver →</span>
                </span>
                <span className="font-bold text-red-600 text-lg">{data.leads.quentes}</span>
              </div>

              {/* Leads Mornos */}
              <div
                onClick={() => handleNavigateToLeads('MORNO')}
                className="group flex justify-between items-center p-2 hover:bg-yellow-50 rounded transition-all cursor-pointer border-l-4 border-yellow-500 hover:shadow-sm"
              >
                <span className="text-content-secondary flex items-center gap-2">
                  Mornos
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-yellow-600 font-semibold transition-opacity">Ver →</span>
                </span>
                <span className="font-bold text-yellow-600 text-lg">{data.leads.mornos}</span>
              </div>

              {/* Leads Frios */}
              <div
                onClick={() => handleNavigateToLeads('FRIO')}
                className="group flex justify-between items-center p-2 hover:bg-blue-50 rounded transition-all cursor-pointer border-l-4 border-blue-500 hover:shadow-sm"
              >
                <span className="text-content-secondary flex items-center gap-2">
                   Frios
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
          <div className="bg-surface border border-edge-light rounded-xl p-6">
            <h3 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-content-tertiary" /> Evolução de Vendas
            </h3>
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
                  <Line yAxisId="right" type="monotone" dataKey="leads" name="Total Clientes" stroke="#3b82f6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Funil de Vendas Visual */}
          <div className="bg-surface border border-edge-light rounded-xl p-6">
            <h3 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-content-tertiary" /> Funil de Conversão
            </h3>
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

      {/* Seção de Ranking e Comparativo */}
      {ranking && (
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-content flex items-center gap-2">
              <Trophy className="w-4 h-4 text-content-tertiary" /> Seu Ranking na Equipe
            </h3>
            <span className="text-sm text-content-tertiary">{ranking.totalCorretores} corretores ativos</span>
          </div>

          {/* Posições nos Rankings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">
                {ranking.posicao.fechamentos}º
              </div>
              <p className="text-xs text-yellow-700 font-medium">Fechamentos</p>
              <p className="text-xs text-content-tertiary mt-1">
                {ranking.meuDesempenho?.fechamentosMes || 0} este mês
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {ranking.posicao.valor}º
              </div>
              <p className="text-xs text-green-700 font-medium">Valor Fechado</p>
              <p className="text-xs text-content-tertiary mt-1">
                {formatCurrency(ranking.meuDesempenho?.valorMes || 0)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {ranking.posicao.leads}º
              </div>
              <p className="text-xs text-blue-700 font-medium">Clientes Captados</p>
              <p className="text-xs text-content-tertiary mt-1">
                {ranking.meuDesempenho?.leadsMes || 0} este mês
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {ranking.posicao.conversao}º
              </div>
              <p className="text-xs text-purple-700 font-medium">Taxa Conversão</p>
              <p className="text-xs text-content-tertiary mt-1">
                {ranking.meuDesempenho?.taxaConversao.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Comparativo com Média da Equipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-content-secondary mb-3">Você vs Média da Equipe</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-content-secondary">Fechamentos</span>
                    <span className="font-medium text-content">
                      {ranking.meuDesempenho?.fechamentosMes || 0} / {ranking.mediaEquipe.fechamentos} (média)
                    </span>
                  </div>
                  <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (ranking.meuDesempenho?.fechamentosMes || 0) >= ranking.mediaEquipe.fechamentos
                          ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ranking.mediaEquipe.fechamentos > 0
                          ? ((ranking.meuDesempenho?.fechamentosMes || 0) / ranking.mediaEquipe.fechamentos) * 100
                          : 0)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-content-secondary">Clientes Captados</span>
                    <span className="font-medium text-content">
                      {ranking.meuDesempenho?.leadsMes || 0} / {ranking.mediaEquipe.leads} (média)
                    </span>
                  </div>
                  <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (ranking.meuDesempenho?.leadsMes || 0) >= ranking.mediaEquipe.leads
                          ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ranking.mediaEquipe.leads > 0
                          ? ((ranking.meuDesempenho?.leadsMes || 0) / ranking.mediaEquipe.leads) * 100
                          : 0)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-content-secondary">Taxa de Conversão</span>
                    <span className="font-medium text-content">
                      {ranking.meuDesempenho?.taxaConversao.toFixed(1)}% / {ranking.mediaEquipe.conversao}% (média)
                    </span>
                  </div>
                  <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (ranking.meuDesempenho?.taxaConversao || 0) >= ranking.mediaEquipe.conversao
                          ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ranking.mediaEquipe.conversao > 0
                          ? ((ranking.meuDesempenho?.taxaConversao || 0) / ranking.mediaEquipe.conversao) * 100
                          : 0)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 e Comparativo Mês Anterior */}
            <div>
              <h4 className="text-sm font-bold text-content-secondary mb-3">Top 3 Fechamentos do Mês</h4>
              <div className="space-y-2 mb-4">
                {ranking.top3.fechamentos.map((corretor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-surface-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-400' : 'text-amber-700'}`}>
                        {idx + 1}º
                      </span>
                      <span className="text-sm font-medium text-content-secondary">{corretor.nome}</span>
                    </div>
                    <span className="text-sm font-bold text-content">{corretor.valor}</span>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-bold text-content-secondary mb-3">Comparativo Mês Anterior</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-surface-secondary rounded-lg">
                  <p className="text-lg font-bold text-content">{ranking.comparativoMesAnterior.fechamentos}</p>
                  <p className="text-[10px] text-content-tertiary">Fechamentos</p>
                  {ranking.meuDesempenho && (
                    <span className={`text-[10px] font-medium ${
                      (ranking.meuDesempenho.fechamentosMes || 0) >= ranking.comparativoMesAnterior.fechamentos
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(ranking.meuDesempenho.fechamentosMes || 0) >= ranking.comparativoMesAnterior.fechamentos ? '↑' : '↓'}
                    </span>
                  )}
                </div>
                <div className="text-center p-2 bg-surface-secondary rounded-lg">
                  <p className="text-lg font-bold text-content">{ranking.comparativoMesAnterior.leads}</p>
                  <p className="text-[10px] text-content-tertiary">Clientes</p>
                  {ranking.meuDesempenho && (
                    <span className={`text-[10px] font-medium ${
                      (ranking.meuDesempenho.leadsMes || 0) >= ranking.comparativoMesAnterior.leads
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(ranking.meuDesempenho.leadsMes || 0) >= ranking.comparativoMesAnterior.leads ? '↑' : '↓'}
                    </span>
                  )}
                </div>
                <div className="text-center p-2 bg-surface-secondary rounded-lg">
                  <p className="text-sm font-bold text-content">{formatCurrency(ranking.comparativoMesAnterior.valor).replace('R$', '').trim()}</p>
                  <p className="text-[10px] text-content-tertiary">Valor</p>
                  {ranking.meuDesempenho && (
                    <span className={`text-[10px] font-medium ${
                      (ranking.meuDesempenho.valorMes || 0) >= ranking.comparativoMesAnterior.valor
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(ranking.meuDesempenho.valorMes || 0) >= ranking.comparativoMesAnterior.valor ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Métricas Detalhadas */}
      {metricas && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clientes Sem Contato - Alerta */}
          <div className="bg-surface border border-edge-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-content flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Clientes Sem Contato
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                metricas.leadsSemContato.length > 5
                  ? 'bg-red-100 text-red-800'
                  : metricas.leadsSemContato.length > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {metricas.leadsSemContato.length} leads
              </span>
            </div>

            {metricas.leadsSemContato.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm text-content-tertiary mt-2">Todos os leads estão em dia!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {metricas.leadsSemContato.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-surface-secondary transition-colors ${
                      lead.temperatura === 'QUENTE' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-yellow-50 border-l-4 border-yellow-500'
                    }`}
                    onClick={() => router.push(`/dashboard/leads?id=${lead.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-content">{lead.nome}</p>
                        <p className="text-xs text-content-tertiary">{lead.telefone}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {lead.diasSemContato}d
                      </span>
                    </div>
                  </div>
                ))}
                {metricas.leadsSemContato.length > 5 && (
                  <button
                    onClick={() => router.push('/dashboard/leads')}
                    className="w-full text-center text-xs text-brand hover:underline py-2"
                  >
                    Ver todos ({metricas.leadsSemContato.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Métricas de Tempo */}
          <div className="bg-surface border border-edge-light rounded-xl p-6">
            <h3 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-content-tertiary" /> Métricas de Tempo
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-secondary">Tempo Médio de Fechamento</span>
                  <span className="text-2xl font-bold text-blue-600">{metricas.tempoMedioFechamento}d</span>
                </div>
                <p className="text-xs text-content-tertiary mt-1">Dias entre criação e fechamento</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-secondary">Tempo Médio 1º Contato</span>
                  <span className="text-2xl font-bold text-green-600">{metricas.tempoMedioPrimeiroContato}h</span>
                </div>
                <p className="text-xs text-content-tertiary mt-1">Horas entre lead e primeiro contato</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-secondary">Taxa de Visitas Realizadas</span>
                  <span className="text-2xl font-bold text-purple-600">{metricas.visitas.taxaRealizacao}%</span>
                </div>
                <p className="text-xs text-content-tertiary mt-1">
                  {metricas.visitas.realizadas} de {metricas.visitas.agendadas} visitas
                </p>
              </div>
            </div>
          </div>

          {/* Tarefas e Propostas */}
          <div className="bg-surface border border-edge-light rounded-xl p-6">
            <h3 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-content-tertiary" /> Atividades Pendentes
            </h3>

            <div className="space-y-4">
              <div
                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push('/dashboard/tarefas')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-secondary">Tarefas Pendentes</span>
                  <span className="text-2xl font-bold text-orange-600">{metricas.tarefas.pendentes}</span>
                </div>
                {metricas.tarefas.atrasadas > 0 && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {metricas.tarefas.atrasadas} atrasada{metricas.tarefas.atrasadas > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-secondary">Propostas este Mês</span>
                  <span className="text-2xl font-bold text-cyan-600">{metricas.propostasMes}</span>
                </div>
              </div>

              {/* Clientes por Origem */}
              <div className="pt-2">
                <p className="text-xs font-bold text-content-secondary uppercase mb-2">Clientes por Origem</p>
                <div className="space-y-1">
                  {metricas.leadsPorOrigem.slice(0, 4).map((origem) => (
                    <div key={origem.origem} className="flex items-center justify-between text-xs">
                      <span className="text-content-secondary">{origem.origem}</span>
                      <span className="font-medium text-content">{origem.quantidade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabelas Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-content flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-content-tertiary" /> Agenda (Próximos)
              </h3>
              <button
                onClick={handleNewVisit}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-light text-brand hover:bg-brand/20 border border-brand/30 transition-colors"
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
              <p className="text-content-tertiary mb-2">Nenhuma visita agendada</p>
              <button
                onClick={handleNewVisit}
                className="text-sm text-brand font-medium hover:underline"
              >
                + Agendar visita
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.proximosAgendamentos.map((ag) => (
                <div key={ag.id} className="p-3 bg-surface-secondary rounded-lg border-l-4 border-brand">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">{ag.leadNome}</p>
                      <p className="text-xs text-content-tertiary">{ag.imovelTitulo}</p>
                      <p className="text-xs text-content-tertiary mt-1">{ag.leadTelefone}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-content">
                        {new Date(ag.dataVisita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-content-tertiary">
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
        <div className="bg-surface border border-edge-light rounded-xl p-6">
          <h3 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-content-tertiary" /> Últimas Movimentações
          </h3>
          {data.ultimasNegociacoes.length === 0 ? (
            <p className="text-content-tertiary text-center py-4">Nenhuma negociação encontrada</p>
          ) : (
            <div className="space-y-3">
              {data.ultimasNegociacoes.slice(0, 5).map((neg) => (
                <div key={neg.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content truncate">{neg.leadNome}</p>
                    <p className="text-xs text-content-tertiary">{neg.imovelTitulo}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      statusColors[neg.status]?.bg || 'bg-gray-100'
                    } ${statusColors[neg.status]?.text || 'text-gray-800'}`}>
                      {statusLabels[neg.status] || neg.status}
                    </span>
                    <p className="text-xs text-content-secondary mt-1 font-medium">
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
