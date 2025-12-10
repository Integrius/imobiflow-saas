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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F]"></div>
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
        <h2 className="text-4xl font-bold text-[#2C2C2C] tracking-tight">Dashboard</h2>
        <p className="text-[#8B7F76] mt-2 text-lg">Visão geral do seu negócio imobiliário</p>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card de Leads */}
          <div className="card-warm overflow-hidden border-2 border-[#8FD14F]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-xl shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#7FB344] uppercase tracking-wider">
                    Leads
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">
                  {data.leads.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF006E] rounded-full text-sm font-bold border-2 border-[#FF006E]/50">
                    🔥 {data.leads.quentes} quentes
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#8FD14F] to-[#006D77]"></div>
          </div>

          {/* Card de Imóveis */}
          <div className="card-warm overflow-hidden border-2 border-[#8FD14F]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#A97E6F] to-[#8B6F5C] rounded-xl shadow-lg">
                  <span className="text-3xl">🏘️</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#A97E6F] uppercase tracking-wider">
                    Imóveis
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">
                  {data.imoveis.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#8FD14F]/20 text-[#4A6B29] rounded-full text-sm font-bold border-2 border-[#8FD14F]/50">
                    ✓ {data.imoveis.disponiveis} disponíveis
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#A97E6F] to-[#8B6F5C]"></div>
          </div>

          {/* Card de Negociações */}
          <div className="card-warm overflow-hidden border-2 border-[#FFB627]/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#FFB627] to-[#FF006E] rounded-xl shadow-lg">
                  <span className="text-3xl">💼</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#FFB627] uppercase tracking-wider">
                    Negociações
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">
                  {data.negociacoes.total}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#8FD14F]/20 text-[#4A6B29] rounded-full text-sm font-bold border-2 border-[#8FD14F]/50">
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
    </div>
  );
}
