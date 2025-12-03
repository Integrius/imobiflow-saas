'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getToken } from '@/lib/auth';
import { api } from '@/lib/api';

interface DashboardData {
  leads: { total: number; quentes: number };
  imoveis: { total: number; disponiveis: number };
  negociacoes: { total: number; fechadas: number; taxaConversao: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

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
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ImobiFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.nome}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

          {data && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Leads
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {data.leads.total}
                      </dd>
                      <dd className="mt-1 text-sm text-gray-600">
                        {data.leads.quentes} quentes
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Imóveis
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {data.imoveis.total}
                      </dd>
                      <dd className="mt-1 text-sm text-gray-600">
                        {data.imoveis.disponiveis} disponíveis
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Negociações
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {data.negociacoes.total}
                      </dd>
                      <dd className="mt-1 text-sm text-gray-600">
                        {data.negociacoes.fechadas} fechadas ({data.negociacoes.taxaConversao}% conversão)
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
