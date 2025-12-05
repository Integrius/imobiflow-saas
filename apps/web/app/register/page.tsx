'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    email: '',
    telefone: '',
    plano: 'PRO',
    adminNome: '',
    adminEmail: '',
    adminSenha: '',
  });
  const [errors, setErrors] = useState<any>({});

  // Gerar slug automaticamente a partir do nome
  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífen
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens do início/fim
  };

  // Verificar disponibilidade do slug
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      await api.get(`/tenants/slug/${slug}`);
      // Se encontrou, slug não está disponível
      setSlugAvailable(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Não encontrou, slug está disponível
        setSlugAvailable(true);
      } else {
        setSlugAvailable(null);
      }
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleNomeChange = (nome: string) => {
    setFormData({ ...formData, nome });

    // Gerar slug automaticamente se o campo slug estiver vazio
    if (!formData.slug) {
      const newSlug = generateSlug(nome);
      setFormData({ ...formData, nome, slug: newSlug });
      if (newSlug.length >= 3) {
        checkSlugAvailability(newSlug);
      }
    }
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = generateSlug(slug);
    setFormData({ ...formData, slug: cleanSlug });

    // Debounce check
    if (cleanSlug.length >= 3) {
      setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 500);
    } else {
      setSlugAvailable(null);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = 'Nome da imobiliária é obrigatório (mínimo 3 caracteres)';
    }

    if (!formData.slug || formData.slug.length < 3) {
      newErrors.slug = 'Subdomínio é obrigatório (mínimo 3 caracteres)';
    } else if (slugAvailable === false) {
      newErrors.slug = 'Este subdomínio já está em uso';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail válido é obrigatório';
    }

    if (!formData.adminNome || formData.adminNome.length < 3) {
      newErrors.adminNome = 'Nome do administrador é obrigatório';
    }

    if (!formData.adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'E-mail válido do administrador é obrigatório';
    }

    if (!formData.adminSenha || formData.adminSenha.length < 6) {
      newErrors.adminSenha = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Criar tenant
      const tenantResponse = await api.post('/tenants', {
        nome: formData.nome,
        slug: formData.slug,
        email: formData.email,
        telefone: formData.telefone || undefined,
        plano: formData.plano,
      });

      const tenant = tenantResponse.data;

      // 2. Criar usuário administrador
      await api.post('/users', {
        nome: formData.adminNome,
        email: formData.adminEmail,
        senha: formData.adminSenha,
        tipo: 'ADMIN',
        tenant_id: tenant.id,
      });

      // 3. Redirecionar para o subdomínio do tenant
      const subdomain = `${formData.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;
      window.location.href = `https://${subdomain}/login?new=true`;
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Vivoly"
                width={370}
                height={91}
                className="h-[94px] w-auto"
              />
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Crie sua conta no Vivoly
          </h1>
          <p className="text-slate-400">
            Experimente grátis por 14 dias. Não é necessário cartão de crédito.
          </p>
        </div>

        <div className="bg-slate-800 shadow-2xl rounded-2xl p-8 border-2 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados da Imobiliária */}
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-slate-700">
                Dados da Imobiliária
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nome da Imobiliária *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleNomeChange(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Imobiliária ACME"
                  />
                  {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Subdomínio *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="acme"
                    />
                    <span className="text-slate-400 text-sm">.integrius.com.br</span>
                  </div>
                  {checkingSlug && (
                    <p className="text-slate-400 text-xs mt-1">Verificando disponibilidade...</p>
                  )}
                  {slugAvailable === true && (
                    <p className="text-green-400 text-xs mt-1">✓ Subdomínio disponível!</p>
                  )}
                  {slugAvailable === false && (
                    <p className="text-red-400 text-xs mt-1">✗ Subdomínio já está em uso</p>
                  )}
                  {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
                  <p className="text-slate-500 text-xs mt-1">
                    Este será o endereço da sua imobiliária: {formData.slug || 'seu-subdominio'}.integrius.com.br
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      E-mail da Imobiliária *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contato@acme.com.br"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Plano
                  </label>
                  <select
                    value={formData.plano}
                    onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BASICO">Básico - 3 usuários, 100 imóveis</option>
                    <option value="PRO">Pro - 10 usuários, 500 imóveis (Recomendado)</option>
                    <option value="ENTERPRISE">Enterprise - Ilimitado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dados do Administrador */}
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-slate-700">
                Dados do Administrador
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.adminNome}
                    onChange={(e) => setFormData({ ...formData, adminNome: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="João Silva"
                  />
                  {errors.adminNome && <p className="text-red-400 text-xs mt-1">{errors.adminNome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="joao@acme.com.br"
                  />
                  {errors.adminEmail && <p className="text-red-400 text-xs mt-1">{errors.adminEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.adminSenha}
                    onChange={(e) => setFormData({ ...formData, adminSenha: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.adminSenha && <p className="text-red-400 text-xs mt-1">{errors.adminSenha}</p>}
                </div>
              </div>
            </div>

            {/* Erro geral */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Botões */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || slugAvailable === false}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>

              <p className="text-center text-sm text-slate-400">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Fazer login
                </Link>
              </p>
            </div>

            {/* Trial info */}
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 text-center">
              <p className="text-blue-400 text-sm">
                🎉 14 dias de teste grátis • Cancele quando quiser • Sem cartão de crédito
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
