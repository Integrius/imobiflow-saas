'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, Lock, ClipboardList, Settings, RefreshCw, Lightbulb } from 'lucide-react';

// Tipos
interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'ADMIN' | 'GESTOR' | 'CORRETOR';
  telefone?: string;
  primeiro_acesso?: boolean;
}

interface ActivityLog {
  id: string;
  acao: string;
  descricao: string;
  ip?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    nome: string;
    email: string;
  };
}

type TabType = 'conta' | 'seguranca' | 'logs';

export default function AdministracaoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('conta');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para alteração de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  // Estado para logs
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Carregar logs quando a aba for selecionada
  useEffect(() => {
    if (activeTab === 'logs' && (user?.tipo === 'ADMIN' || user?.tipo === 'GESTOR')) {
      loadLogs();
    }
  }, [activeTab, user?.tipo]);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await api.get('/activity-logs?limit=50');
      setLogs(response.data.logs || []);
    } catch (err: any) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações
    if (!senhaAtual) {
      setError('Informe a senha atual');
      return;
    }

    if (!novaSenha || novaSenha.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setAlterandoSenha(true);

    try {
      await api.post('/auth/alterar-senha', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha
      });

      setSuccess('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setAlterandoSenha(false);
    }
  };

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const canViewLogs = user?.tipo === 'ADMIN' || user?.tipo === 'GESTOR';

  const tabs = [
    { id: 'conta' as TabType, label: 'Minha Conta', icon: '' },
    { id: 'seguranca' as TabType, label: 'Segurança', icon: '' },
    ...(canViewLogs ? [{ id: 'logs' as TabType, label: 'Logs de Atividade', icon: '' }] : [])
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-[#2C2C2C]">
          <Settings className="w-5 h-5 inline mr-1" /> Administração
        </h1>
        <p className="text-gray-700 mt-1 font-medium">
          Gerencie sua conta e configurações
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#00C48C] text-[#00C48C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Aba: Minha Conta */}
          {activeTab === 'conta' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#2C2C2C]">Dados da Conta</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nome
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {user?.nome || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {user?.email || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo de Usuário
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user?.tipo === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : user?.tipo === 'GESTOR'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user?.tipo || '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    ID do Usuário
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm font-mono">
                    {user?.id || '-'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Para alterar seus dados de perfil, entre em contato com o administrador do sistema.
                </p>
              </div>
            </div>
          )}

          {/* Aba: Segurança */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#2C2C2C]">Alterar Senha</h2>

              <form onSubmit={handleAlterarSenha} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Senha Atual *
                  </label>
                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <button
                  type="submit"
                  disabled={alterandoSenha}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00C48C] to-[#059669] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {alterandoSenha ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Alterando...
                    </span>
                  ) : (
                    'Alterar Senha'
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Dicas de Segurança:</h3>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Use uma senha com pelo menos 6 caracteres</li>
                  <li>• Combine letras maiúsculas, minúsculas e números</li>
                  <li>• Evite usar informações pessoais como datas de nascimento</li>
                  <li>• Não compartilhe sua senha com outras pessoas</li>
                </ul>
              </div>
            </div>
          )}

          {/* Aba: Logs de Atividade (apenas ADMIN/GESTOR) */}
          {activeTab === 'logs' && canViewLogs && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#2C2C2C]">Logs de Atividade</h2>
                <button
                  onClick={loadLogs}
                  disabled={loadingLogs}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingLogs ? 'Carregando...' : 'Atualizar'}
                </button>
              </div>

              {loadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C48C]"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="mt-2">Nenhum log de atividade encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Ação
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          IP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {log.user?.nome || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.acao.includes('LOGIN') ? 'bg-green-100 text-green-700' :
                              log.acao.includes('LOGOUT') ? 'bg-gray-100 text-gray-700' :
                              log.acao.includes('SENHA') ? 'bg-yellow-100 text-yellow-700' :
                              log.acao.includes('CREATE') ? 'bg-blue-100 text-blue-700' :
                              log.acao.includes('UPDATE') ? 'bg-purple-100 text-purple-700' :
                              log.acao.includes('DELETE') ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {log.acao}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {log.descricao}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                            {log.ip || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
