'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { Users, Building2, Handshake, Sparkles, ListChecks, AlertTriangle, UserPlus, Plus } from 'lucide-react';

interface DashboardData {
  leads: { total: number; quentes: number; mornos: number; frios: number };
  imoveis: { total: number; disponiveis: number };
  negociacoes: { total: number; fechadas: number; taxaConversao: number };
}

interface ChartData {
  last3Months: { mes: string; leads: number; imoveis: number; negociacoes: number }[];
  last6Months: { mes: string; leads: number; imoveis: number; negociacoes: number }[];
  last12Months: { mes: string; leads: number; imoveis: number; negociacoes: number }[];
}

interface Tarefa {
  id: string;
  titulo: string;
  tipo: string;
  prioridade: string;
  data_vencimento?: string;
  lead?: { nome: string };
}

interface Meta {
  id: string;
  mes: number;
  ano: number;
  meta_leads?: number;
  meta_fechamentos?: number;
  meta_valor?: number;
  progresso_leads: number;
  progresso_fechamentos: number;
  progresso_valor: number;
}

interface SofiaInsight {
  tipo: string;
  mensagem: string;
  lead?: { id: string; nome: string };
  acao?: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [sofiaInsight, setSofiaInsight] = useState<SofiaInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'3' | '6' | '12'>('3');

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardData, chartsData, tarefasData, metaData] = await Promise.all([
          api.get('/dashboard/overview').then(res => res.data),
          api.get('/dashboard/charts').then(res => res.data),
          api.get('/tarefas/pendentes?limit=5').then(res => res.data).catch(() => ({ tarefas: [] })),
          api.get('/metas/minha-meta').then(res => res.data).catch(() => null)
        ]);

        setData(dashboardData);
        setChartData(chartsData);
        setTarefas(tarefasData.tarefas || []);
        setMeta(metaData);

        // Gerar insight da Sofia baseado nos dados
        generateSofiaInsight(dashboardData);
      } catch (err: any) {
        setError('Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const generateSofiaInsight = (dashboardData: DashboardData) => {
    // Gerar insight baseado nos dados
    if (dashboardData.leads.quentes > 0) {
      setSofiaInsight({
        tipo: 'leads_quentes',
        mensagem: `Você tem ${dashboardData.leads.quentes} lead${dashboardData.leads.quentes > 1 ? 's' : ''} quente${dashboardData.leads.quentes > 1 ? 's' : ''} aguardando contato. Priorize-os para aumentar sua conversão!`,
        acao: 'Ver Leads Quentes'
      });
    } else if (dashboardData.negociacoes.taxaConversao < 15) {
      setSofiaInsight({
        tipo: 'conversao',
        mensagem: `Sua taxa de conversão está em ${dashboardData.negociacoes.taxaConversao}%. Que tal revisar suas negociações em andamento?`,
        acao: 'Ver Negociações'
      });
    } else {
      setSofiaInsight({
        tipo: 'geral',
        mensagem: 'Ótimo trabalho! Continue acompanhando seus leads e mantenha o ritmo de conversões.',
        acao: 'Ver Dashboard'
      });
    }
  };

  const getChartDataByPeriod = () => {
    if (!chartData) return [];
    switch (chartPeriod) {
      case '3': return chartData.last3Months;
      case '6': return chartData.last6Months;
      case '12': return chartData.last12Months;
      default: return chartData.last3Months;
    }
  };

  const calcularProgressoMeta = () => {
    if (!meta) return 0;
    const progressos = [];
    if (meta.meta_leads && meta.meta_leads > 0) {
      progressos.push((meta.progresso_leads / meta.meta_leads) * 100);
    }
    if (meta.meta_fechamentos && meta.meta_fechamentos > 0) {
      progressos.push((meta.progresso_fechamentos / meta.meta_fechamentos) * 100);
    }
    if (progressos.length === 0) return 0;
    return Math.round(progressos.reduce((a, b) => a + b, 0) / progressos.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-content">Visão Geral</h1>
        <Link
          href="/dashboard/leads?new=true"
          className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <span>+</span>
          <span>Novo Lead</span>
        </Link>
      </div>

      {/* Layout Assimétrico: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* KPI Cards */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Leads Total */}
              <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
                <span className="text-xs font-bold text-content-secondary uppercase">Leads</span>
                <div className="text-3xl font-bold text-content mt-1">{data.leads.total}</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-red-500 font-semibold">{data.leads.quentes} quentes</span>
                </div>
              </div>

              {/* Conversão */}
              <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
                <span className="text-xs font-bold text-content-secondary uppercase">Conversão</span>
                <div className="text-3xl font-bold text-content mt-1">{data.negociacoes.taxaConversao}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(data.negociacoes.taxaConversao, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Imóveis */}
              <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
                <span className="text-xs font-bold text-content-secondary uppercase">Imóveis</span>
                <div className="text-3xl font-bold text-content mt-1">{data.imoveis.total}</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-green-600 font-semibold">✓ {data.imoveis.disponiveis} disp.</span>
                </div>
              </div>

              {/* Negociações */}
              <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
                <span className="text-xs font-bold text-content-secondary uppercase">Negociações</span>
                <div className="text-3xl font-bold text-content mt-1">{data.negociacoes.total}</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-green-600 font-semibold">✓ {data.negociacoes.fechadas} fechadas</span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de Performance */}
          {chartData && (
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-edge-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                <div className="flex gap-1">
                  {(['3', '6', '12'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        chartPeriod === period
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period}M
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getChartDataByPeriod()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mes" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="leads" fill="#22c55e" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="negociacoes" fill="#4f46e5" name="Negociações" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leads por Temperatura */}
            {data && (
              <div className="bg-surface p-5 rounded-xl shadow-sm border border-edge-light">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Leads por Temperatura</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      Quentes
                    </span>
                    <span className="font-bold text-gray-900">{data.leads.quentes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      Mornos
                    </span>
                    <span className="font-bold text-gray-900">{data.leads.mornos || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      Frios
                    </span>
                    <span className="font-bold text-gray-900">{data.leads.frios || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Meta do Mês */}
            {meta && (
              <div className="bg-surface p-5 rounded-xl shadow-sm border border-edge-light">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Meta do Mês</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Progresso Geral</span>
                    <span className="font-bold text-green-600">{calcularProgressoMeta()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        calcularProgressoMeta() >= 100 ? 'bg-green-500' :
                        calcularProgressoMeta() >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(calcularProgressoMeta(), 100)}%` }}
                    ></div>
                  </div>
                  {meta.meta_leads && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Leads</span>
                      <span className="text-gray-800 font-semibold">{meta.progresso_leads}/{meta.meta_leads}</span>
                    </div>
                  )}
                  {meta.meta_fechamentos && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Fechamentos</span>
                      <span className="text-gray-800 font-semibold">{meta.progresso_fechamentos}/{meta.meta_fechamentos}</span>
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/meu-desempenho"
                  className="mt-4 block w-full text-center py-2.5 text-xs font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Ver Detalhes
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">

          {/* Widget Sofia */}
          {sofiaInsight && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-1 shadow-lg">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-md">Sofia Insights</h3>
                </div>
                <p className="text-sm opacity-90 mb-4 leading-relaxed">
                  "{sofiaInsight.mensagem}"
                </p>
                <Link
                  href={
                    sofiaInsight.tipo === 'leads_quentes' ? '/dashboard/leads?temperatura=QUENTE' :
                    sofiaInsight.tipo === 'conversao' ? '/dashboard/negociacoes' :
                    '/dashboard'
                  }
                  className="w-full py-2 bg-white text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  {sofiaInsight.acao}
                </Link>
              </div>
            </div>
          )}

          {/* Tarefas de Hoje */}
          <div className="bg-surface p-5 rounded-xl shadow-sm border border-edge-light">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Agenda Hoje</h3>
              <Link
                href="/dashboard/tarefas"
                className="text-xs text-green-600 hover:text-green-700 font-semibold"
              >
                Ver todas
              </Link>
            </div>
            {tarefas.length > 0 ? (
              <div className="space-y-3">
                {tarefas.slice(0, 4).map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      tarefa.prioridade === 'URGENTE' ? 'bg-red-500' :
                      tarefa.prioridade === 'ALTA' ? 'bg-orange-500' :
                      tarefa.prioridade === 'MEDIA' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-semibold truncate">{tarefa.titulo}</p>
                      {tarefa.lead && (
                        <p className="text-xs text-gray-600 font-medium truncate">{tarefa.lead.nome}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 font-medium">Nenhuma tarefa pendente</p>
                <Link
                  href="/dashboard/tarefas?new=true"
                  className="mt-2 inline-block text-xs text-green-600 hover:text-green-700 font-semibold"
                >
                  + Criar tarefa
                </Link>
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="bg-surface p-5 rounded-xl shadow-sm border border-edge-light">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/leads?new=true"
                className="flex items-center gap-2.5 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Novo Lead</span>
              </Link>
              <Link
                href="/dashboard/imoveis?new=true"
                className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Novo Imóvel</span>
              </Link>
              <Link
                href="/dashboard/negociacoes"
                className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Handshake className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Ver Negociações</span>
              </Link>
              <Link
                href="/dashboard/tarefas?new=true"
                className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <ListChecks className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Nova Tarefa</span>
              </Link>
            </div>
          </div>

          {/* Indicadores de Atenção */}
          {data && (data.leads.quentes > 0 || (meta && calcularProgressoMeta() < 50)) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Atenção
              </h3>
              <div className="space-y-2">
                {data.leads.quentes > 0 && (
                  <p className="text-xs text-amber-800 font-medium">
                    {data.leads.quentes} lead{data.leads.quentes > 1 ? 's' : ''} quente{data.leads.quentes > 1 ? 's' : ''} aguardando contato
                  </p>
                )}
                {meta && calcularProgressoMeta() < 50 && (
                  <p className="text-xs text-amber-800 font-medium">
                    Meta do mês abaixo de 50%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
