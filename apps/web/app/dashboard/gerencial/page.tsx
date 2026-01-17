'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface MetricasTime {
  totalCorretores: number;
  corretoresAtivos: number;
  totalLeads: number;
  leadsNovos30Dias: number;
  totalNegociacoes: number;
  negociacoesFechadas30Dias: number;
  valorTotalFechado: number;
  taxaConversaoGeral: number;
  mediaPorCorretor: {
    leads: number;
    negociacoes: number;
    valorFechado: number;
  };
}

interface CorretorRanking {
  id: string;
  nome: string;
  email: string;
  creci: string;
  foto_url?: string;
  metricas: {
    totalLeads: number;
    leadsQuentes: number;
    leadsMornos: number;
    leadsFrios: number;
    totalNegociacoes: number;
    negociacoesFechadas: number;
    negociacoesEmAndamento: number;
    taxaConversao: number;
    valorTotalFechado: number;
    valorMedioFechado: number;
    totalVisitas: number;
    visitasRealizadas: number;
  };
  tempoMedio: {
    primeiroContato: number | null;
    fechamento: number | null;
  };
  ultimaAtividade: string | null;
  ranking: {
    posicao: number;
    pontuacao: number;
  };
}

interface ComparativoPeriodo {
  periodo: string;
  leads: number;
  negociacoes: number;
  fechamentos: number;
  valorFechado: number;
}

interface DistribuicaoTemperatura {
  total: number;
  distribuicao: {
    temperatura: string;
    quantidade: number;
    percentual: number;
  }[];
}

interface Alerta {
  tipo: 'URGENTE' | 'ATENCAO' | 'INFO';
  icone: string;
  titulo: string;
  mensagem: string;
  quantidade: number;
}

interface DashboardGerencialData {
  metricas: MetricasTime;
  ranking: CorretorRanking[];
  comparativo: ComparativoPeriodo[];
  distribuicaoTemperatura: DistribuicaoTemperatura;
  alertas: Alerta[];
  tops: {
    fechamentos: { posicao: number; id: string; nome: string; foto_url?: string; valor: number }[];
    valor: { posicao: number; id: string; nome: string; foto_url?: string; valor: number }[];
  };
}

const CORES_TEMPERATURA = {
  QUENTE: '#EF4444',
  MORNO: '#F59E0B',
  FRIO: '#3B82F6'
};

const CORES_PIE = ['#EF4444', '#F59E0B', '#3B82F6'];

export default function DashboardGerencialPage() {
  const [data, setData] = useState<DashboardGerencialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabAtiva, setTabAtiva] = useState<'ranking' | 'comparativo'>('ranking');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await api.get('/dashboard-gerencial');
      setData(response.data.data);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard gerencial:', err);
      if (err.response?.status === 403) {
        setError('Acesso negado. Apenas ADMIN ou GESTOR podem acessar esta página.');
      } else {
        setError('Erro ao carregar dados do dashboard gerencial.');
      }
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[#FF6B6B] mb-4 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#00C48C] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Dashboard Gerencial</h2>
        <p className="text-[#4B5563] mt-2 text-lg">Visão consolidada do desempenho do time</p>
      </div>

      {/* Alertas */}
      {data.alertas.length > 0 && (
        <div className="space-y-3">
          {data.alertas.map((alerta, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alerta.tipo === 'URGENTE'
                  ? 'bg-red-50 border-red-500 text-red-800'
                  : alerta.tipo === 'ATENCAO'
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                  : 'bg-blue-50 border-blue-500 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{alerta.icone}</span>
                <div>
                  <p className="font-bold">{alerta.titulo}</p>
                  <p className="text-sm opacity-80">{alerta.mensagem}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Corretores */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#00C48C]/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#00C48C] to-[#059669] rounded-xl">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-xs font-bold text-[#00C48C] uppercase">Corretores</span>
          </div>
          <div className="text-3xl font-bold text-[#064E3B]">{data.metricas.totalCorretores}</div>
          <p className="text-sm text-[#4B5563] mt-1">
            <span className="text-[#00C48C] font-semibold">{data.metricas.corretoresAtivos}</span> ativos
          </p>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#059669]/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#059669] to-[#047857] rounded-xl">
              <span className="text-2xl">📋</span>
            </div>
            <span className="text-xs font-bold text-[#059669] uppercase">Leads</span>
          </div>
          <div className="text-3xl font-bold text-[#064E3B]">{data.metricas.totalLeads}</div>
          <p className="text-sm text-[#4B5563] mt-1">
            <span className="text-[#00C48C] font-semibold">+{data.metricas.leadsNovos30Dias}</span> nos últimos 30 dias
          </p>
        </div>

        {/* Valor Fechado */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#FFB627]/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#FFB627] to-[#F59E0B] rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-xs font-bold text-[#FFB627] uppercase">Valor Total</span>
          </div>
          <div className="text-2xl font-bold text-[#064E3B]">{formatCurrency(data.metricas.valorTotalFechado)}</div>
          <p className="text-sm text-[#4B5563] mt-1">em negócios fechados</p>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#8B5CF6]/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
              <span className="text-2xl">📈</span>
            </div>
            <span className="text-xs font-bold text-[#8B5CF6] uppercase">Conversão</span>
          </div>
          <div className="text-3xl font-bold text-[#064E3B]">{data.metricas.taxaConversaoGeral}%</div>
          <p className="text-sm text-[#4B5563] mt-1">
            <span className="text-[#00C48C] font-semibold">{data.metricas.negociacoesFechadas30Dias}</span> fechamentos (30d)
          </p>
        </div>
      </div>

      {/* Média por Corretor */}
      <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Média por Corretor</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold">{data.metricas.mediaPorCorretor.leads}</div>
            <p className="text-sm opacity-80">Leads</p>
          </div>
          <div>
            <div className="text-3xl font-bold">{data.metricas.mediaPorCorretor.negociacoes}</div>
            <p className="text-sm opacity-80">Negociações</p>
          </div>
          <div>
            <div className="text-3xl font-bold">{formatCurrency(data.metricas.mediaPorCorretor.valorFechado)}</div>
            <p className="text-sm opacity-80">Valor Fechado</p>
          </div>
        </div>
      </div>

      {/* Distribuição de Temperatura + Top Corretores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de Temperatura */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
          <h3 className="text-lg font-bold text-[#064E3B] mb-4">Distribuição de Leads</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.distribuicaoTemperatura.distribuicao.map(d => ({
                  name: d.temperatura,
                  value: d.quantidade
                }))}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.distribuicaoTemperatura.distribuicao.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CORES_TEMPERATURA[entry.temperatura as keyof typeof CORES_TEMPERATURA] || CORES_PIE[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {data.distribuicaoTemperatura.distribuicao.map(d => (
              <div key={d.temperatura} className="text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: CORES_TEMPERATURA[d.temperatura as keyof typeof CORES_TEMPERATURA] }}
                />
                <p className="text-xs font-semibold text-[#4B5563]">{d.temperatura}</p>
                <p className="text-sm font-bold">{d.quantidade} ({d.percentual}%)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Fechamentos */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
          <h3 className="text-lg font-bold text-[#064E3B] mb-4">🏆 Top Fechamentos</h3>
          <div className="space-y-3">
            {data.tops.fechamentos.map((corretor, index) => (
              <div key={corretor.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {corretor.posicao}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#064E3B]">{corretor.nome}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#00C48C]">{corretor.valor}</span>
                  <p className="text-xs text-[#4B5563]">fechamentos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Valor */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
          <h3 className="text-lg font-bold text-[#064E3B] mb-4">💰 Top Valor Fechado</h3>
          <div className="space-y-3">
            {data.tops.valor.map((corretor, index) => (
              <div key={corretor.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {corretor.posicao}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#064E3B]">{corretor.nome}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#FFB627]">{formatCurrency(corretor.valor)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Ranking Completo / Comparativo */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setTabAtiva('ranking')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              tabAtiva === 'ranking'
                ? 'bg-[#00C48C] text-white'
                : 'bg-gray-50 text-[#4B5563] hover:bg-gray-100'
            }`}
          >
            📊 Ranking de Corretores
          </button>
          <button
            onClick={() => setTabAtiva('comparativo')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              tabAtiva === 'comparativo'
                ? 'bg-[#00C48C] text-white'
                : 'bg-gray-50 text-[#4B5563] hover:bg-gray-100'
            }`}
          >
            📈 Comparativo Mensal
          </button>
        </div>

        <div className="p-6">
          {tabAtiva === 'ranking' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#4B5563] border-b">
                    <th className="pb-3 font-semibold">#</th>
                    <th className="pb-3 font-semibold">Corretor</th>
                    <th className="pb-3 font-semibold text-center">Leads</th>
                    <th className="pb-3 font-semibold text-center">Negociações</th>
                    <th className="pb-3 font-semibold text-center">Fechamentos</th>
                    <th className="pb-3 font-semibold text-center">Conversão</th>
                    <th className="pb-3 font-semibold text-right">Valor Total</th>
                    <th className="pb-3 font-semibold text-center">Visitas</th>
                    <th className="pb-3 font-semibold text-center">Pontuação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ranking.map((corretor) => (
                    <tr key={corretor.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          corretor.ranking.posicao === 1 ? 'bg-yellow-500' :
                          corretor.ranking.posicao === 2 ? 'bg-gray-400' :
                          corretor.ranking.posicao === 3 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {corretor.ranking.posicao}
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-[#064E3B]">{corretor.nome}</p>
                          <p className="text-xs text-[#4B5563]">CRECI: {corretor.creci}</p>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div>
                          <span className="font-bold">{corretor.metricas.totalLeads}</span>
                          <div className="flex justify-center gap-1 mt-1">
                            <span className="text-xs px-1 bg-red-100 text-red-600 rounded">🔥{corretor.metricas.leadsQuentes}</span>
                            <span className="text-xs px-1 bg-yellow-100 text-yellow-600 rounded">⚡{corretor.metricas.leadsMornos}</span>
                            <span className="text-xs px-1 bg-blue-100 text-blue-600 rounded">❄️{corretor.metricas.leadsFrios}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-bold">{corretor.metricas.totalNegociacoes}</span>
                        <p className="text-xs text-[#4B5563]">{corretor.metricas.negociacoesEmAndamento} em andamento</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-bold text-[#00C48C]">{corretor.metricas.negociacoesFechadas}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`font-bold ${
                          corretor.metricas.taxaConversao >= 30 ? 'text-[#00C48C]' :
                          corretor.metricas.taxaConversao >= 15 ? 'text-[#FFB627]' : 'text-[#FF6B6B]'
                        }`}>
                          {corretor.metricas.taxaConversao}%
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-bold text-[#FFB627]">{formatCurrency(corretor.metricas.valorTotalFechado)}</span>
                        <p className="text-xs text-[#4B5563]">média: {formatCurrency(corretor.metricas.valorMedioFechado)}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-bold">{corretor.metricas.visitasRealizadas}</span>
                        <span className="text-[#4B5563]">/{corretor.metricas.totalVisitas}</span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#00C48C] to-[#059669] text-white rounded-full font-bold">
                          ⭐ {corretor.ranking.pontuacao}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tabAtiva === 'comparativo' && (
            <div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.comparativo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="periodo" stroke="#4B5563" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#4B5563" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#FFB627" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFAF5',
                      border: '2px solid #00C48C',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Valor Fechado') return formatCurrency(value);
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="leads" fill="#00C48C" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="negociacoes" fill="#059669" name="Negociações" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="fechamentos" fill="#8B5CF6" name="Fechamentos" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="valorFechado" fill="#FFB627" name="Valor Fechado" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {data.comparativo.map((periodo) => (
                  <div key={periodo.periodo} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-[#064E3B] mb-3">{periodo.periodo}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#4B5563]">Leads:</span>
                        <span className="font-bold">{periodo.leads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4B5563]">Negociações:</span>
                        <span className="font-bold">{periodo.negociacoes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4B5563]">Fechamentos:</span>
                        <span className="font-bold text-[#00C48C]">{periodo.fechamentos}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-[#4B5563]">Valor:</span>
                        <span className="font-bold text-[#FFB627]">{formatCurrency(periodo.valorFechado)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
