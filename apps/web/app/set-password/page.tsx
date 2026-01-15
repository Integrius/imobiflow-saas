'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function SetPasswordPage() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se usuário está autenticado
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);

    // Se não é primeiro acesso, redirecionar para dashboard
    if (!user.primeiro_acesso) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/set-password', { senha });

      // Atualizar token e usuário
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Atualizar cookie
      document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao definir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F4E2CE] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[#2C2C2C]">
            Defina sua Senha
          </h1>
          <p className="text-[#8B7F76] mt-2">
            Escolha uma senha segura para seu primeiro acesso
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5DDD5] rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5DDD5] rounded-lg focus:ring-2 focus:ring-[#8FD14F] focus:border-transparent"
              placeholder="Digite a senha novamente"
            />
          </div>

          {/* Dicas de Segurança */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
            <p className="text-emerald-700 text-sm font-semibold mb-2">
              💡 Dicas de Segurança:
            </p>
            <ul className="text-emerald-600 text-xs space-y-1">
              <li>• Use no mínimo 6 caracteres</li>
              <li>• Misture letras, números e símbolos</li>
              <li>• Não use senhas óbvias ou pessoais</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8FD14F] to-[#6E9B3B] text-white font-bold py-3 px-6 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Definindo senha...' : 'Confirmar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
