'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardData {
  leads: { total: number; quentes: number };
  imoveis: { total: number; disponiveis: number };
  negociacoes: { total: number; fechadas: number; taxaConversao: number };
}

interface ChartData {
  last3Months: { mes: string; leads: number; imoveis: number; negociacoes: number }[];
  last6Months: { mes: string; leads: number; imoveis: number; negociacoes: number }[];
  last12Months: { mes: string; leads: number; imoveis: number; negociacoes: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardData, chartsData] = await Promise.all([
          api.get('/dashboard/overview').then(res => res.data),
          api.get('/dashboard/charts').then(res => res.data)
        ]);
        setData(dashboardData);
        setChartData(chartsData);
      } catch (err: any) {
        setError('Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Dashboard</h2>
        <p className="text-[#4B5563] mt-2 text-lg">Visão geral do seu negócio imobiliário</p>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card de Leads */}
          <div className="card-clean overflow-hidden border-2 border-[#00C48C]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#00C48C] to-[#059669] rounded-xl shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#00C48C] uppercase tracking-wider">
                    Leads
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#064E3B] mb-2">
                  {data.leads.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF006E] rounded-full text-sm font-bold border-2 border-[#FF006E]/50">
                    🔥 {data.leads.quentes} quentes
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#00C48C] to-[#059669]"></div>
          </div>

          {/* Card de Imóveis */}
          <div className="card-clean overflow-hidden border-2 border-[#00C48C]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#059669] to-[#059669] rounded-xl shadow-lg">
                  <img src="/ico-imoveis.png" alt="Imóveis" className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#059669] uppercase tracking-wider">
                    Imóveis
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#064E3B] mb-2">
                  {data.imoveis.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#00C48C]/20 text-[#4A6B29] rounded-full text-sm font-bold border-2 border-[#00C48C]/50">
                    ✓ {data.imoveis.disponiveis} disponíveis
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#059669] to-[#059669]"></div>
          </div>

          {/* Card de Negociações */}
          <div className="card-clean overflow-hidden border-2 border-[#FFB627]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#FFB627] to-[#FF006E] rounded-xl shadow-lg">
                  <img src="/ico-negociacoes.png" alt="Negociações" className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#FFB627] uppercase tracking-wider">
                    Negociações
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#064E3B] mb-2">
                  {data.negociacoes.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#00C48C]/20 text-[#4A6B29] rounded-full text-sm font-bold border-2 border-[#00C48C]/50">
                    ✓ {data.negociacoes.fechadas} fechadas
                  </span>
                  <span className="px-3 py-1 bg-[#FFB627]/20 text-[#FFB627] rounded-full text-sm font-bold border-2 border-[#FFB627]/50">
                    {data.negociacoes.taxaConversao}%
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#FFB627] to-[#FF006E]"></div>
          </div>
        </div>
      )}

      {/* Gráficos Históricos */}
      {chartData && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-[#064E3B] mb-6">Evolução nos Últimos Meses</h3>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Gráfico 3 Meses */}
            <div className="card-clean p-6">
              <h4 className="text-lg font-semibold text-[#064E3B] mb-4 text-center">Últimos 3 Meses</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.last3Months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="mes" stroke="#4B5563" fontSize={12} />
                  <YAxis stroke="#4B5563" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFAF5',
                      border: '2px solid #00C48C',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    iconType="rect"
                  />
                  <Bar dataKey="leads" fill="#00C48C" name="Leads" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="imoveis" fill="#059669" name="Imóveis" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="negociacoes" fill="#FFB627" name="Negociações" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-[#4B5563]">
                  Total: {chartData.last3Months.reduce((acc, m) => acc + m.leads + m.imoveis + m.negociacoes, 0)}
                </p>
              </div>
            </div>

            {/* Gráfico 6 Meses */}
            <div className="card-clean p-6">
              <h4 className="text-lg font-semibold text-[#064E3B] mb-4 text-center">Últimos 6 Meses</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.last6Months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="mes" stroke="#4B5563" fontSize={12} />
                  <YAxis stroke="#4B5563" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFAF5',
                      border: '2px solid #00C48C',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    iconType="rect"
                  />
                  <Bar dataKey="leads" fill="#00C48C" name="Leads" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="imoveis" fill="#059669" name="Imóveis" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="negociacoes" fill="#FFB627" name="Negociações" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-[#4B5563]">
                  Total: {chartData.last6Months.reduce((acc, m) => acc + m.leads + m.imoveis + m.negociacoes, 0)}
                </p>
              </div>
            </div>

            {/* Gráfico 12 Meses */}
            <div className="card-clean p-6">
              <h4 className="text-lg font-semibold text-[#064E3B] mb-4 text-center">Últimos 12 Meses</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.last12Months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="mes" stroke="#4B5563" fontSize={12} />
                  <YAxis stroke="#4B5563" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFAF5',
                      border: '2px solid #00C48C',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    iconType="rect"
                  />
                  <Bar dataKey="leads" fill="#00C48C" name="Leads" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="imoveis" fill="#059669" name="Imóveis" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="negociacoes" fill="#FFB627" name="Negociações" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-[#4B5563]">
                  Total: {chartData.last12Months.reduce((acc, m) => acc + m.leads + m.imoveis + m.negociacoes, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
