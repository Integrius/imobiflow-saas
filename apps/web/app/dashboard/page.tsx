'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  leads: { total: number; quentes: number };
  imoveis: { total: number; disponiveis: number };
  negociacoes: { total: number; fechadas: number; taxaConversao: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await api.get('/dashboard/overview').then(res => res.data);
        setData(dashboardData);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Dashboard</h2>
        <p className="text-slate-300 mt-2">Visão geral do seu negócio imobiliário</p>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card de Leads */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-600 overflow-hidden rounded-2xl border-2 border-blue-500/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                    Leads
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-slate-100 mb-2">
                  {data.leads.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-900/60 text-red-200 rounded-full text-sm font-bold border-2 border-red-500/50">
                    🔥 {data.leads.quentes} quentes
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          </div>

          {/* Card de Imóveis */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-600 overflow-hidden rounded-2xl border-2 border-emerald-500/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <span className="text-3xl">🏘️</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">
                    Imóveis
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-slate-100 mb-2">
                  {data.imoveis.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-900/60 text-emerald-200 rounded-full text-sm font-bold border-2 border-emerald-500/50">
                    ✓ {data.imoveis.disponiveis} disponíveis
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          </div>

          {/* Card de Negociações */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-600 overflow-hidden rounded-2xl border-2 border-amber-500/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <span className="text-3xl">💼</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
                    Negociações
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-slate-100 mb-2">
                  {data.negociacoes.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-900/60 text-green-200 rounded-full text-sm font-bold border-2 border-green-500/50">
                    ✓ {data.negociacoes.fechadas} fechadas
                  </span>
                  <span className="px-3 py-1 bg-amber-900/60 text-amber-200 rounded-full text-sm font-bold border-2 border-amber-500/50">
                    {data.negociacoes.taxaConversao}%
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>
          </div>
        </div>
      )}
    </div>
  );
}
