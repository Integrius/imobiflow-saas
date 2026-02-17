'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  // Verificar se usuário está autenticado e obter dados
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        // Não autenticado, redirecionar para login
        router.push('/login');
        return;
      }

      try {
        // Buscar dados do usuário autenticado
        const response = await api.get('/auth/me');
        const user = response.data;

        setUserName(user.nome);

        // Se já definiu senha (primeiro_acesso = false), redirecionar para dashboard
        if (user.primeiro_acesso === false) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Token inválido, redirecionar para login
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/primeiro-acesso', { senha });

      // Atualizar token no localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Atualizar cookie também
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      setLoading(false);

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      console.error('Erro ao definir senha:', error);
      setError(error.response?.data?.error || 'Erro ao definir senha. Tente novamente.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#064E3B] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <Image
              src="/logoIntegrius.png"
              alt="Integrius"
              width={156}
              height={52}
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo(a), {userName}! 👋
          </h1>
          <p className="text-[#00C48C] text-sm">
            Defina sua senha para acessar o sistema
          </p>
        </div>

        {/* Card de Primeiro Acesso */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#064E3B] mb-2">
              Primeiro Acesso 🔐
            </h2>
            <p className="text-gray-600 text-sm">
              Por segurança, você precisa definir uma senha pessoal para acessar sua conta.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use letras, números e caracteres especiais para maior segurança
              </p>
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={senha.length < 6}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all ${
                    senha.length < 6 ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={senha.length < 6 ? 'Complete a senha acima primeiro' : 'Digite a senha novamente'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={senha.length < 6}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {/* Feedback de confirmação */}
              {confirmarSenha.length > 0 && senha.length >= 6 && (
                <p className={`text-xs mt-1 ${confirmarSenha === senha ? 'text-green-600' : 'text-red-600'}`}>
                  {confirmarSenha === senha ? '✓ As senhas conferem!' : '✗ As senhas não conferem'}
                </p>
              )}
            </div>

            {/* Indicador de Força da Senha */}
            {senha.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-1.5 flex-1 rounded-full ${senha.length < 6 ? 'bg-red-300' : senha.length < 8 ? 'bg-yellow-300' : 'bg-green-400'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${senha.length < 8 ? 'bg-gray-200' : /[A-Z]/.test(senha) ? 'bg-green-400' : 'bg-yellow-300'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${!/[0-9]/.test(senha) ? 'bg-gray-200' : 'bg-green-400'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${!/[!@#$%^&*]/.test(senha) ? 'bg-gray-200' : 'bg-green-400'}`} />
                </div>
                <p className="text-xs text-gray-500">
                  Força: {
                    senha.length < 6 ? 'Fraca' :
                    senha.length < 8 ? 'Média' :
                    /[A-Z]/.test(senha) && /[0-9]/.test(senha) && /[!@#$%^&*]/.test(senha) ? 'Forte' :
                    'Boa'
                  }
                </p>
              </div>
            )}

            {/* Botão Confirmar */}
            <button
              type="submit"
              disabled={loading || senha.length < 6 || senha !== confirmarSenha}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00C48C] to-[#00A575] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Definindo senha...
                </span>
              ) : (
                'Definir Senha e Continuar'
              )}
            </button>

            {/* Dicas de Segurança */}
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                💡 Dicas de Segurança
              </h3>
              <ul className="text-xs text-emerald-700 space-y-1">
                <li>• Use no mínimo 8 caracteres</li>
                <li>• Combine letras maiúsculas e minúsculas</li>
                <li>• Adicione números e símbolos (!@#$%)</li>
                <li>• Evite informações pessoais óbvias</li>
                <li>• Não reutilize senhas de outros sites</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">
            Protegido por criptografia de ponta a ponta 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
