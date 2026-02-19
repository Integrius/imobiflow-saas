'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  ClipboardList,
  Search,
  Lock,
  DoorOpen,
  XCircle,
  KeyRound,
  RefreshCw,
  Mail,
  Building2,
  Ban,
  CheckCircle2,
  Package,
  CreditCard,
  DollarSign,
  AlertTriangle,
  UserRound,
  Pencil,
  CircleDot,
  CircleCheck,
  Settings,
  ShieldAlert,
} from 'lucide-react';

// Tipos de atividades com labels em português (text-only for <option> elements)
const TIPOS_ATIVIDADE_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  LOGIN_FALHOU: 'Login Falhou',
  SENHA_ALTERADA: 'Senha Alterada',
  SENHA_RESETADA: 'Senha Resetada',
  EMAIL_ALTERADO: 'Email Alterado',
  TENANT_CRIADO: 'Conta Criada',
  TENANT_CANCELADO: 'Conta Cancelada',
  TENANT_REATIVADO: 'Conta Reativada',
  TENANT_EXPORTACAO_DADOS: 'Exportação de Dados',
  ASSINATURA_ATIVADA: 'Assinatura Ativada',
  ASSINATURA_CANCELADA: 'Assinatura Cancelada',
  PAGAMENTO_REALIZADO: 'Pagamento Realizado',
  PAGAMENTO_FALHOU: 'Pagamento Falhou',
  USUARIO_CRIADO: 'Usuário Criado',
  USUARIO_EDITADO: 'Usuário Editado',
  USUARIO_DESATIVADO: 'Usuário Desativado',
  USUARIO_REATIVADO: 'Usuário Reativado',
  CONFIGURACAO_ALTERADA: 'Configuração Alterada',
  ACESSO_NEGADO: 'Acesso Negado',
};

// Icon + color mapping for each activity type
const TIPOS_ATIVIDADE_ICONS: Record<string, { icon: React.ElementType; className: string }> = {
  LOGIN: { icon: Lock, className: 'text-blue-500' },
  LOGOUT: { icon: DoorOpen, className: 'text-gray-400' },
  LOGIN_FALHOU: { icon: XCircle, className: 'text-red-500' },
  SENHA_ALTERADA: { icon: KeyRound, className: 'text-amber-500' },
  SENHA_RESETADA: { icon: RefreshCw, className: 'text-amber-500' },
  EMAIL_ALTERADO: { icon: Mail, className: 'text-blue-500' },
  TENANT_CRIADO: { icon: Building2, className: 'text-green-600' },
  TENANT_CANCELADO: { icon: Ban, className: 'text-red-500' },
  TENANT_REATIVADO: { icon: CheckCircle2, className: 'text-green-500' },
  TENANT_EXPORTACAO_DADOS: { icon: Package, className: 'text-purple-500' },
  ASSINATURA_ATIVADA: { icon: CreditCard, className: 'text-green-500' },
  ASSINATURA_CANCELADA: { icon: XCircle, className: 'text-red-500' },
  PAGAMENTO_REALIZADO: { icon: DollarSign, className: 'text-green-500' },
  PAGAMENTO_FALHOU: { icon: AlertTriangle, className: 'text-amber-500' },
  USUARIO_CRIADO: { icon: UserRound, className: 'text-blue-500' },
  USUARIO_EDITADO: { icon: Pencil, className: 'text-gray-500' },
  USUARIO_DESATIVADO: { icon: CircleDot, className: 'text-red-500' },
  USUARIO_REATIVADO: { icon: CircleCheck, className: 'text-green-500' },
  CONFIGURACAO_ALTERADA: { icon: Settings, className: 'text-gray-500' },
  ACESSO_NEGADO: { icon: ShieldAlert, className: 'text-red-600' },
};

// Combined type for backward compatibility with ActivityLog interface
const TIPOS_ATIVIDADE = TIPOS_ATIVIDADE_LABELS;

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
        <h1 className="text-3xl font-bold text-content">
          Logs de Atividades
        </h1>
        <p className="text-content-secondary mt-2">
          Histórico de todas as atividades da sua conta
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg shadow p-4">
            <div className="text-sm text-content-secondary">Total de Logs</div>
            <div className="text-2xl font-bold text-content">{stats.total}</div>
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
      <div className="bg-surface rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-content mb-1">
              Tipo de Atividade
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
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
            <label className="block text-sm font-medium text-content mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => {
                setFiltroDataInicio(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => {
                setFiltroDataFim(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={limparFiltros}
              className="w-full px-4 py-2 bg-surface-tertiary hover:bg-surface-secondary text-content rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-edge-light">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
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
            <tbody className="bg-surface divide-y divide-edge-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-content-secondary">
                    Carregando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-content-secondary">
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-secondary">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                        {TIPOS_ATIVIDADE[log.tipo]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-content max-w-md truncate">
                      {log.acao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-content">
                            {log.user.nome}
                          </div>
                          <div className="text-xs text-content-secondary">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-content-secondary">Sistema</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="bg-surface px-4 py-3 flex items-center justify-between border-t border-edge sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-edge text-sm font-medium rounded-md text-content bg-surface hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={logs.length < limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-edge text-sm font-medium rounded-md text-content bg-surface hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-content">
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-edge bg-surface text-sm font-medium text-content-secondary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-edge bg-surface text-sm font-medium text-content">
                  Página {page + 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={logs.length < limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-edge bg-surface text-sm font-medium text-content-secondary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
