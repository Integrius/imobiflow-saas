'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Tipos de atividades com labels em português
const TIPOS_ATIVIDADE = {
  LOGIN: '🔐 Login',
  LOGOUT: '🚪 Logout',
  LOGIN_FALHOU: '❌ Login Falhou',
  SENHA_ALTERADA: '🔑 Senha Alterada',
  SENHA_RESETADA: '🔄 Senha Resetada',
  EMAIL_ALTERADO: '📧 Email Alterado',
  TENANT_CRIADO: '🏢 Conta Criada',
  TENANT_CANCELADO: '🚫 Conta Cancelada',
  TENANT_REATIVADO: '✅ Conta Reativada',
  TENANT_EXPORTACAO_DADOS: '📦 Exportação de Dados',
  ASSINATURA_ATIVADA: '💳 Assinatura Ativada',
  ASSINATURA_CANCELADA: '❌ Assinatura Cancelada',
  PAGAMENTO_REALIZADO: '💰 Pagamento Realizado',
  PAGAMENTO_FALHOU: '⚠️ Pagamento Falhou',
  USUARIO_CRIADO: '👤 Usuário Criado',
  USUARIO_EDITADO: '✏️ Usuário Editado',
  USUARIO_DESATIVADO: '🔴 Usuário Desativado',
  USUARIO_REATIVADO: '🟢 Usuário Reativado',
  CONFIGURACAO_ALTERADA: '⚙️ Configuração Alterada',
  ACESSO_NEGADO: '🛑 Acesso Negado',
};

interface ActivityLog {
  id: string;
  tipo: keyof typeof TIPOS_ATIVIDADE;
  acao: string;
  detalhes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
}

export default function TenantLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(50);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // Estatísticas
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [page, filtroTipo, filtroDataInicio, filtroDataFim]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const params: any = {
        limit,
        offset: page * limit,
      };

      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroDataInicio) params.data_inicio = new Date(filtroDataInicio).toISOString();
      if (filtroDataFim) params.data_fim = new Date(filtroDataFim).toISOString();

      const response = await api.get('/activity-logs', { params });

      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error);
      alert('Erro ao carregar logs: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params: any = {};
      if (filtroDataInicio) params.data_inicio = new Date(filtroDataInicio).toISOString();
      if (filtroDataFim) params.data_fim = new Date(filtroDataFim).toISOString();

      const response = await api.get('/activity-logs/stats', { params });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setPage(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          📋 Logs de Atividades
        </h1>
        <p className="text-gray-600 mt-2">
          Histórico de todas as atividades da sua conta
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total de Logs</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg shadow p-4">
            <div className="text-sm text-emerald-600">Últimas 24h</div>
            <div className="text-2xl font-bold text-emerald-900">{stats.ultimas24h}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-600">Últimos 7 dias</div>
            <div className="text-2xl font-bold text-green-900">{stats.ultimos7dias}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-sm text-purple-600">Tipos de Eventos</div>
            <div className="text-2xl font-bold text-purple-900">
              {Object.keys(stats.porTipo || {}).length}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">🔍 Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Atividade
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            >
              <option value="">Todos</option>
              {Object.entries(TIPOS_ATIVIDADE).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => {
                setFiltroDataInicio(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => {
                setFiltroDataFim(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={limparFiltros}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Carregando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                        {TIPOS_ATIVIDADE[log.tipo]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {log.acao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.user.nome}
                          </div>
                          <div className="text-xs text-gray-500">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sistema</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={logs.length < limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{page * limit + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(page * limit + limit, total)}
                </span>{' '}
                de <span className="font-medium">{total}</span> logs
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Página {page + 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={logs.length < limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
