'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TenantAdmin {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  ultimo_login: string | null;
}

interface Tenant {
  id: string;
  nome: string;
  slug: string;
  subdominio: string;
  email: string;
  telefone: string | null;
  plano: string;
  status: string;
  data_expiracao: string | null;
  dias_restantes: number | null;
  created_at: string;
  updated_at: string;
  limites: {
    usuarios: number;
    imoveis: number;
    storage_mb: number;
  };
  uso: {
    usuarios: number;
    imoveis: number;
    storage_mb: number;
  };
  admin: TenantAdmin | null;
}

interface Stats {
  total_tenants: number;
  novos_ultimos_30_dias: number;
  trials_expirando_5_dias: number;
  por_status: Record<string, number>;
  por_plano: Record<string, number>;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroPlan, setFiltroPlan] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar tenants e stats em paralelo
      const [tenantsResponse, statsResponse] = await Promise.all([
        api.get('/admin/tenants'),
        api.get('/admin/stats')
      ]);

      setTenants(tenantsResponse.data.tenants);
      setStats(statsResponse.data.stats);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tenants
  const tenantsFiltrados = tenants.filter(tenant => {
    // Filtro de status
    if (filtroStatus !== 'TODOS' && tenant.status !== filtroStatus) {
      return false;
    }

    // Filtro de plano
    if (filtroPlan !== 'TODOS' && tenant.plano !== filtroPlan) {
      return false;
    }

    // Filtro de busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      return (
        tenant.nome.toLowerCase().includes(termo) ||
        tenant.email.toLowerCase().includes(termo) ||
        tenant.slug.toLowerCase().includes(termo) ||
        tenant.admin?.nome.toLowerCase().includes(termo) ||
        tenant.admin?.email.toLowerCase().includes(termo)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      TRIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ATIVO: 'bg-green-100 text-green-800 border-green-200',
      INATIVO: 'bg-gray-100 text-gray-800 border-gray-200',
      SUSPENSO: 'bg-red-100 text-red-800 border-red-200',
      CANCELADO: 'bg-gray-100 text-gray-600 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[status as keyof typeof colors] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const getPlanoBadge = (plano: string) => {
    const colors = {
      BASICO: 'bg-blue-100 text-blue-800 border-blue-200',
      PRO: 'bg-purple-100 text-purple-800 border-purple-200',
      ENTERPRISE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      CUSTOM: 'bg-pink-100 text-pink-800 border-pink-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[plano as keyof typeof colors] || 'bg-gray-100'}`}>
        {plano}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados dos tenants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-6">
        <h2 className="text-red-800 font-bold text-lg mb-2">❌ Erro</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2C2C2C]">
            🏢 Administração de Tenants
          </h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento centralizado de todas as imobiliárias cadastradas
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#8FD14F] text-white rounded-lg hover:bg-[#7FB344] transition-colors font-medium"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#8FD14F]">
            <div className="text-sm text-gray-600 mb-1">Total de Tenants</div>
            <div className="text-3xl font-bold text-[#2C2C2C]">{stats.total_tenants}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Novos (30 dias)</div>
            <div className="text-3xl font-bold text-blue-600">{stats.novos_ultimos_30_dias}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Trials Expirando (5 dias)</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.trials_expirando_5_dias}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Tenants Ativos</div>
            <div className="text-3xl font-bold text-green-600">{stats.por_status.ATIVO || 0}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, email, slug..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            />
          </div>

          {/* Filtro Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            >
              <option value="TODOS">Todos</option>
              <option value="TRIAL">Trial</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="SUSPENSO">Suspenso</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Filtro Plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plano
            </label>
            <select
              value={filtroPlan}
              onChange={(e) => setFiltroPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            >
              <option value="TODOS">Todos</option>
              <option value="BASICO">Básico</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando <strong>{tenantsFiltrados.length}</strong> de <strong>{tenants.length}</strong> tenants
        </div>
      </div>

      {/* Tabela de Tenants */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status / Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenantsFiltrados.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  {/* Tenant Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          <a
                            href={`https://${tenant.subdominio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {tenant.subdominio}
                          </a>
                        </div>
                        <div className="text-xs text-gray-400">
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Admin Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tenant.admin ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.admin.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.admin.email}
                        </div>
                        {tenant.admin.ultimo_login && (
                          <div className="text-xs text-gray-400">
                            Último acesso: {formatDate(tenant.admin.ultimo_login)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sem admin</span>
                    )}
                  </td>

                  {/* Status / Plano */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(tenant.status)}
                      {getPlanoBadge(tenant.plano)}
                    </div>
                  </td>

                  {/* Trial Info */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tenant.status === 'TRIAL' && tenant.dias_restantes !== null ? (
                      <div>
                        {tenant.dias_restantes > 0 ? (
                          <span className={`font-medium ${tenant.dias_restantes <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {tenant.dias_restantes} {tenant.dias_restantes === 1 ? 'dia' : 'dias'}
                          </span>
                        ) : (
                          <span className="font-medium text-red-600">Expirado</span>
                        )}
                        {tenant.data_expiracao && (
                          <div className="text-xs text-gray-400">
                            Expira: {formatDate(tenant.data_expiracao)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Uso */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-1">
                      <div className="text-xs">
                        👥 {tenant.uso.usuarios}/{tenant.limites.usuarios}
                      </div>
                      <div className="text-xs">
                        🏠 {tenant.uso.imoveis}/{tenant.limites.imoveis}
                      </div>
                    </div>
                  </td>

                  {/* Data Cadastro */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tenant.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tenantsFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum tenant encontrado com os filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
}
