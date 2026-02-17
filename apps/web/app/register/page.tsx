'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

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

  // Formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  };

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
      // Preparar dados para envio
      const payload = {
        nome: formData.nome,
        slug: formData.slug,
        email: formData.email,
        telefone: formData.telefone || undefined,
        plano: formData.plano,
        // Dados do admin
        adminNome: formData.adminNome,
        adminEmail: formData.adminEmail,
        adminSenha: formData.adminSenha
      };

      console.log('📤 Enviando dados para criação de tenant:', {
        ...payload,
        adminSenha: '***' // Ocultar senha no log
      });

      // Criar tenant + usuário admin em uma única requisição
      await api.post('/tenants', payload);

      // Redirecionar para o subdomínio do tenant
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
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>

      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#DFF9C7] rounded-full blur-3xl opacity-40 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F4E2CE] rounded-full blur-3xl opacity-40 animate-float-delayed"></div>
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[#CBEFA9] rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-2xl w-full relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 group">
            <Image
              src="/logoIntegrius.png"
              alt="Integrius"
              width={370}
              height={91}
              className="h-[94px] w-auto mx-auto drop-shadow-lg group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-3">
            Comece sua jornada 🌱
          </h1>
          <p className="text-lg text-[#8B7F76]">
            Crie sua conta e experimente <span className="text-gradient-accent font-semibold">grátis por 14 dias</span>
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-8 md:p-10 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados da Imobiliária */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C]">
                  Dados da Imobiliária
                </h3>
              </div>

              <div className="space-y-5">
                {/* Nome da Imobiliária */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                    Nome da Imobiliária *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleNomeChange(e.target.value)}
                    className="input-modern"
                    placeholder="Ex: Imobiliária ACME"
                  />
                  {errors.nome && (
                    <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Subdomínio */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                    Seu Subdomínio *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="input-modern pr-10"
                        placeholder="acme"
                      />
                      {checkingSlug && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="animate-spin h-4 w-4 text-[#8FD14F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {!checkingSlug && slugAvailable === true && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {!checkingSlug && slugAvailable === false && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-[#8B7F76] text-sm font-medium whitespace-nowrap">.integrius.com.br</span>
                  </div>
                  {slugAvailable === true && (
                    <p className="text-[#8FD14F] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Subdomínio disponível!
                    </p>
                  )}
                  {slugAvailable === false && (
                    <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Este subdomínio já está em uso
                    </p>
                  )}
                  {errors.slug && (
                    <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.slug}
                    </p>
                  )}
                  <div className="mt-3 p-4 bg-gradient-to-r from-[#DFF9C7]/40 to-[#8FD14F]/20 border-2 border-[#8FD14F]/50 rounded-xl shadow-sm">
                    <p className="text-[#2C2C2C] text-base font-bold flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#7FB344]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      Seu endereço será:
                    </p>
                    <p className="text-[#7FB344] text-lg font-black mt-1 tracking-wide">
                      {formData.slug || 'seu-subdominio'}.integrius.com.br
                    </p>
                  </div>
                </div>

                {/* Email e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                      E-mail da Imobiliária *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-modern"
                      placeholder="contato@acme.com.br"
                    />
                    {errors.email && (
                      <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                      className="input-modern"
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* Plano */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                    Escolha seu Plano
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plano: 'BASICO' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.plano === 'BASICO'
                          ? 'border-[#8FD14F] bg-[#DFF9C7]/30 shadow-md'
                          : 'border-[rgba(169,126,111,0.15)] bg-white hover:border-[#8FD14F]/50'
                      }`}
                    >
                      <div className="text-sm font-bold text-[#2C2C2C]">Básico</div>
                      <div className="text-xs text-[#8B7F76] mt-1">3 usuários • 100 imóveis</div>
                      <div className="text-xs text-[#A97E6F] mt-2 font-medium">R$ 97/mês</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plano: 'PRO' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative ${
                        formData.plano === 'PRO'
                          ? 'border-[#8FD14F] bg-[#DFF9C7]/30 shadow-md'
                          : 'border-[rgba(169,126,111,0.15)] bg-white hover:border-[#8FD14F]/50'
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-[#8FD14F] to-[#006D77] text-white text-[10px] font-bold rounded-full">
                        POPULAR
                      </div>
                      <div className="text-sm font-bold text-[#2C2C2C]">Pro</div>
                      <div className="text-xs text-[#8B7F76] mt-1">10 usuários • 500 imóveis</div>
                      <div className="text-xs text-[#A97E6F] mt-2 font-medium">R$ 197/mês</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plano: 'ENTERPRISE' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.plano === 'ENTERPRISE'
                          ? 'border-[#8FD14F] bg-[#DFF9C7]/30 shadow-md'
                          : 'border-[rgba(169,126,111,0.15)] bg-white hover:border-[#8FD14F]/50'
                      }`}
                    >
                      <div className="text-sm font-bold text-[#2C2C2C]">Enterprise</div>
                      <div className="text-xs text-[#8B7F76] mt-1">Usuários ilimitados</div>
                      <div className="text-xs text-[#A97E6F] mt-2 font-medium">Sob consulta</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(169,126,111,0.2)]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[rgba(244,239,233,0.7)] text-[#8B7F76] text-sm">Dados do Administrador</span>
              </div>
            </div>

            {/* Dados do Administrador */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C]">
                  Seu Acesso
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.adminNome}
                    onChange={(e) => setFormData({ ...formData, adminNome: e.target.value })}
                    className="input-modern"
                    placeholder="João Silva"
                  />
                  {errors.adminNome && (
                    <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.adminNome}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="input-modern"
                    placeholder="joao@acme.com.br"
                  />
                  {errors.adminEmail && (
                    <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.adminEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.adminSenha}
                    onChange={(e) => setFormData({ ...formData, adminSenha: e.target.value })}
                    className="input-modern"
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.adminSenha && (
                    <p className="text-[#FF6B6B] text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.adminSenha}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Erro geral */}
            {errors.submit && (
              <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#FF6B6B] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-[#FF6B6B] text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || slugAvailable === false}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg py-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando sua conta...
                </>
              ) : (
                <>
                  Criar conta grátis
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Login link */}
            <div className="text-center">
              <p className="text-[#8B7F76] text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-[#7FB344] hover:text-[#8FD14F] font-semibold transition-colors">
                  Fazer login →
                </Link>
              </p>
            </div>

            {/* Trial Banner */}
            <div className="card-accent text-center p-4">
              <p className="text-[#6E9B3B] text-sm font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14 dias grátis • Sem cartão • Cancele quando quiser
              </p>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-8 text-xs text-[#8B7F76]">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Dados protegidos</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            <span>500+ empresas</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Suporte dedicado</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(10px);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
