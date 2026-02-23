'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { User, Lock, ClipboardList, Settings, Upload, Trash2, ImageIcon, AlertCircle } from 'lucide-react';

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

type TabType = 'conta' | 'identidade' | 'seguranca' | 'logs';

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

  // Estado para identidade visual
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [validationModal, setValidationModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estado para logs
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Carregar dados do usuário e logo do tenant
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);

    // Carregar logo atual do tenant
    api.get('/tenants/trial-info')
      .then((res) => setLogoUrl(res.data.logo_url || null))
      .catch(() => {});
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

  // Helper: lê dimensões de um arquivo de imagem no browser
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const showLogoValidationError = (message: string) => {
    setValidationModal({ open: true, message });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de formato — modal em caso de erro
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      showLogoValidationError('Formato inválido. Use PNG, JPG, WebP ou SVG.');
      return;
    }

    // Validação de tamanho — modal em caso de erro
    if (file.size > 2 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      showLogoValidationError(`Arquivo muito grande (${sizeMB} MB). O tamanho máximo permitido é 2 MB.`);
      return;
    }

    // Validação de dimensões mínimas (ignora SVG — formato vetorial)
    if (file.type !== 'image/svg+xml') {
      try {
        const { width, height } = await getImageDimensions(file);
        if (width < 120 || height < 40) {
          showLogoValidationError(
            `Imagem muito pequena (${width}×${height}px). O mínimo recomendado é 300×100px com proporção 3:1.`
          );
          return;
        }
      } catch {
        // Se não conseguir ler as dimensões, prossegue com o upload
      }
    }

    setUploadingLogo(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenant_id');
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (tenantId) headers['X-Tenant-ID'] = tenantId;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenants/minha-logo`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao fazer upload');
      }

      const data = await res.json();
      setLogoUrl(data.url);
      setSuccess('Logo atualizada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da logo');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Remover a logo da sua imobiliária?')) return;
    setRemovingLogo(true);
    setError(null);
    try {
      await api.delete('/tenants/minha-logo');
      setLogoUrl(null);
      setSuccess('Logo removida com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao remover logo');
    } finally {
      setRemovingLogo(false);
    }
  };

  const canViewLogs = user?.tipo === 'ADMIN' || user?.tipo === 'GESTOR';
  const isAdmin = user?.tipo === 'ADMIN';

  const tabs = [
    { id: 'conta' as TabType, label: 'Minha Conta' },
    ...(isAdmin ? [{ id: 'identidade' as TabType, label: 'Identidade Visual' }] : []),
    { id: 'seguranca' as TabType, label: 'Segurança' },
    ...(canViewLogs ? [{ id: 'logs' as TabType, label: 'Logs de Atividade' }] : [])
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-xl shadow-sm border border-edge p-6">
        <h1 className="text-2xl font-bold text-content">
          <Settings className="w-5 h-5 inline mr-1" /> Administração
        </h1>
        <p className="text-content mt-1 font-medium">
          Gerencie sua conta e configurações
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-xl shadow-sm border border-edge">
        {/* Tab Headers */}
        <div className="border-b border-edge">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-content-secondary hover:text-content hover:border-edge'
                }`}
              >
                {tab.label}
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
            <div className="mb-4 p-4 bg-brand-light border border-brand rounded-lg text-brand">
              {success}
            </div>
          )}

          {/* Aba: Minha Conta */}
          {activeTab === 'conta' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-content">Dados da Conta</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    Nome
                  </label>
                  <div className="px-4 py-3 bg-surface-secondary border border-edge rounded-lg text-content">
                    {user?.nome || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-surface-secondary border border-edge rounded-lg text-content">
                    {user?.email || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    Tipo de Usuário
                  </label>
                  <div className="px-4 py-3 bg-surface-secondary border border-edge rounded-lg">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user?.tipo === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : user?.tipo === 'GESTOR'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-brand-light text-brand'
                    }`}>
                      {user?.tipo || '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    ID do Usuário
                  </label>
                  <div className="px-4 py-3 bg-surface-secondary border border-edge rounded-lg text-content-secondary text-sm font-mono">
                    {user?.id || '-'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-edge">
                <p className="text-sm text-content-secondary">
                  Para alterar seus dados de perfil, entre em contato com o administrador do sistema.
                </p>
              </div>
            </div>
          )}

          {/* Aba: Identidade Visual (ADMIN only) */}
          {activeTab === 'identidade' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-content">Logomarca da Imobiliária</h2>
                <p className="text-sm text-content-secondary mt-1">
                  Exibida no topo do sistema. Recomendado: PNG ou SVG transparente, proporção 3:1, mínimo 300×100px, máximo 600×200px, até 2MB.
                </p>
              </div>

              {/* Preview da logo atual */}
              <div className="flex flex-col items-start gap-4">
                <div className="w-[300px] h-[100px] rounded-xl border-2 border-dashed border-edge flex items-center justify-center bg-surface-secondary overflow-hidden">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo da imobiliária"
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-content-tertiary">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Sem logo cadastrada</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadingLogo ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingLogo ? 'Enviando...' : logoUrl ? 'Substituir logo' : 'Enviar logo'}
                  </button>

                  {logoUrl && (
                    <button
                      onClick={handleRemoveLogo}
                      disabled={removingLogo}
                      className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {removingLogo ? 'Removendo...' : 'Remover'}
                    </button>
                  )}
                </div>

                <div className="text-xs text-content-tertiary space-y-0.5">
                  <p>• Formatos aceitos: PNG, JPG, WebP, SVG</p>
                  <p>• Tamanho máximo: 2MB</p>
                  <p>• Dimensões recomendadas: 600×200px (proporção 3:1)</p>
                  <p>• Fundo transparente (PNG ou SVG) recomendado para melhor exibição</p>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Segurança */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-content">Alterar Senha</h2>

              <form onSubmit={handleAlterarSenha} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    Senha Atual *
                  </label>
                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="w-full px-4 py-3 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-content mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
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

              <div className="pt-4 border-t border-edge">
                <h3 className="text-sm font-semibold text-content mb-2">Dicas de Segurança:</h3>
                <ul className="text-sm text-content-secondary space-y-1">
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
                <h2 className="text-lg font-bold text-content">Logs de Atividade</h2>
                <button
                  onClick={loadLogs}
                  disabled={loadingLogs}
                  className="px-4 py-2 text-sm bg-surface-secondary hover:bg-surface-tertiary rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingLogs ? 'Carregando...' : 'Atualizar'}
                </button>
              </div>

              {loadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C48C]"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-content-secondary">
                  <ClipboardList className="w-10 h-10 text-content-tertiary mx-auto" />
                  <p className="mt-2">Nenhum log de atividade encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-edge">
                    <thead className="bg-surface-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">
                          Ação
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">
                          IP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-edge">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-secondary">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-content-secondary">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-content">
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
                          <td className="px-4 py-3 text-sm text-content-secondary max-w-xs truncate">
                            {log.descricao}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-content-tertiary font-mono">
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

      {/* Modal de validação de logomarca */}
      {validationModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface rounded-xl shadow-xl border border-edge p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-content mb-1">Imagem não aceita</h3>
                <p className="text-sm text-content-secondary">{validationModal.message}</p>
              </div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3 text-xs text-content-tertiary space-y-0.5 mb-4">
              <p className="font-semibold text-content-secondary mb-1">Especificações da logomarca:</p>
              <p>• Formatos aceitos: PNG, JPG, WebP, SVG</p>
              <p>• Tamanho máximo: 2 MB</p>
              <p>• Dimensões recomendadas: 600×200px (proporção 3:1)</p>
              <p>• Mínimo: 300×100px</p>
              <p>• Fundo transparente (PNG/SVG) para melhor resultado</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setValidationModal({ open: false, message: '' })}
                className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
