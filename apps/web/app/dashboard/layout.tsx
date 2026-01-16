'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { logout, getToken } from '@/lib/auth';
import ToastContainer from '@/components/ToastContainer';
import TrialWarning from '@/components/TrialWarning';

// Tipos para navegação
interface SubMenuItem {
  name: string;
  href: string;
  icon: string;
}

interface MenuItem {
  name: string;
  icon: string;
  iconImage: string | null;
  href?: string;
  subItems?: SubMenuItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVivolyAdmin, setIsVivolyAdmin] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // 🔐 Verificar se é primeiro acesso e redirecionar
      if (parsedUser.primeiro_acesso && pathname !== '/primeiro-acesso') {
        console.log('🔐 Primeiro acesso detectado - redirecionando para /primeiro-acesso');
        router.push('/primeiro-acesso');
        return;
      }

      // Verificar se é admin do tenant Vivoly
      const tenantData = localStorage.getItem('tenant_id');
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      setIsVivolyAdmin(
        parsedUser.tipo === 'ADMIN' &&
        (subdomain === 'vivoly' || hostname.includes('vivoly'))
      );
    }
  }, [router, pathname]);

  // Verificar se é admin do tenant (ADMIN ou GESTOR)
  const isAdmin = user?.tipo === 'ADMIN' || user?.tipo === 'GESTOR';

  // Navegação para ADMIN/GESTOR (acesso completo)
  const adminNavigation: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', iconImage: '/ico-dashboard.png' },
    { name: 'Meu Desempenho', href: '/dashboard/meu-desempenho', icon: '📈', iconImage: null },
    { name: 'Leads', href: '/dashboard/leads', icon: '👥', iconImage: '/ico-Leads.png' },
    { name: 'Corretores', href: '/dashboard/corretores', icon: '🏢', iconImage: '/ico-corretores.png' },
    { name: 'Proprietários', href: '/dashboard/proprietarios', icon: '🏠', iconImage: '/ico-proprietarios.png' },
    { name: 'Imóveis', href: '/dashboard/imoveis', icon: '🏘️', iconImage: '/ico-imoveis.png' },
    { name: 'Negociações', href: '/dashboard/negociacoes', icon: '💼', iconImage: '/ico-negociacoes.png' },
    // Menu Administração para tenants normais
    {
      name: 'Administração',
      icon: '⚙️',
      iconImage: null,
      subItems: [
        { name: 'Minha Conta', href: '/dashboard/administracao', icon: '👤' },
        { name: 'Logs', href: '/dashboard/logs', icon: '📋' },
        { name: 'Cancelar Assinatura', href: '/dashboard/cancelar-assinatura', icon: '🚫' }
      ]
    }
  ];

  // Navegação para CORRETOR (acesso restrito - sem Corretores e Administração completa)
  const corretorNavigation: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', iconImage: '/ico-dashboard.png' },
    { name: 'Meu Desempenho', href: '/dashboard/meu-desempenho', icon: '📈', iconImage: null },
    { name: 'Leads', href: '/dashboard/leads', icon: '👥', iconImage: '/ico-Leads.png' },
    { name: 'Proprietários', href: '/dashboard/proprietarios', icon: '🏠', iconImage: '/ico-proprietarios.png' },
    { name: 'Imóveis', href: '/dashboard/imoveis', icon: '🏘️', iconImage: '/ico-imoveis.png' },
    { name: 'Negociações', href: '/dashboard/negociacoes', icon: '💼', iconImage: '/ico-negociacoes.png' },
    // Corretor tem acesso à Minha Conta para alterar senha
    { name: 'Minha Conta', href: '/dashboard/administracao', icon: '👤', iconImage: null },
  ];

  // Selecionar navegação baseada no tipo de usuário
  const baseNavigation = isAdmin ? adminNavigation : corretorNavigation;

  // Adicionar item de admin se for Vivoly (com submenu)
  const navigation = isVivolyAdmin
    ? [
        ...baseNavigation.filter(item => item.name !== 'Administração'), // Remove "Administração" para Vivoly
        {
          name: 'Admin Geral',
          icon: '🔐',
          iconImage: null,
          subItems: [
            { name: 'Tenants', href: '/dashboard/admin/tenants', icon: '🏢' },
            { name: 'Logs', href: '/dashboard/admin/logs', icon: '📋' }
          ]
        }
      ]
    : baseNavigation;

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <ToastContainer />
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-[#064E3B] to-[#065F46] shadow-lg fixed w-full z-10 border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-white/90 hover:text-white mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Vivoly"
                  width={240}
                  height={64}
                  className="h-16 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Aviso de Trial no Header */}
              <TrialWarning />

              <span className="text-sm text-white/90">
                Olá, {user?.nome || 'Usuário'}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72 bg-white shadow-lg h-[calc(100vh-4rem)] border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-8 pb-6 overflow-y-auto">
              <nav className="mt-2 flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  // Se tem subitens, é um submenu
                  if (item.subItems) {
                    const isExpanded = expandedMenu === item.name;
                    const isAnySubItemActive = item.subItems.some(subItem => pathname === subItem.href);

                    return (
                      <div key={item.name}>
                        {/* Item principal do submenu */}
                        <button
                          onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                          className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            isAnySubItemActive
                              ? 'bg-gradient-to-r from-[#00C48C] to-[#059669] text-white shadow-md glow-green'
                              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#00C48C]'
                          }`}
                        >
                          <div className="flex items-center">
                            {item.iconImage ? (
                              <Image
                                src={item.iconImage}
                                alt={item.name}
                                width={24}
                                height={24}
                                className="mr-3"
                              />
                            ) : (
                              <span className="mr-3 text-2xl">{item.icon}</span>
                            )}
                            <span className="font-semibold">{item.name}</span>
                          </div>
                          <span className={`text-lg transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                        </button>

                        {/* Subitens */}
                        {isExpanded && (
                          <div className="ml-6 mt-2 space-y-1">
                            {item.subItems.map((subItem) => {
                              const isActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? 'bg-[#00C48C]/10 text-[#00C48C]'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#00C48C]'
                                  }`}
                                >
                                  <span className="mr-2 text-lg">{subItem.icon}</span>
                                  <span>{subItem.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Item normal sem submenu
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00C48C] to-[#059669] text-white shadow-md glow-green'
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#00C48C]'
                      }`}
                    >
                      {item.iconImage ? (
                        <Image
                          src={item.iconImage}
                          alt={item.name}
                          width={24}
                          height={24}
                          className="mr-3"
                        />
                      ) : (
                        <span className="mr-3 text-2xl">{item.icon}</span>
                      )}
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Footer da Sidebar */}
            <div className="px-4 pb-6 mt-auto">
              <div className="bg-gradient-to-r from-[#F4F6F8] to-gray-100 rounded-lg p-4 text-center border border-gray-200">
                <p className="text-sm text-[#064E3B] font-semibold">Vivoly</p>
                <p className="text-xs text-gray-600 mt-1">versão 1.0.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full border-r border-gray-200 shadow-xl">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00C48C] bg-white shadow-lg"
                >
                  <span className="sr-only">Fechar sidebar</span>
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 h-0 pt-8 pb-6 overflow-y-auto">
                <nav className="mt-2 px-4 space-y-2">
                  {navigation.map((item) => {
                    // Se tem subitens, é um submenu
                    if (item.subItems) {
                      const isExpanded = expandedMenu === item.name;
                      const isAnySubItemActive = item.subItems.some(subItem => pathname === subItem.href);

                      return (
                        <div key={item.name}>
                          {/* Item principal do submenu */}
                          <button
                            onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                            className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                              isAnySubItemActive
                                ? 'bg-gradient-to-r from-[#00C48C] to-[#059669] text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#00C48C]'
                            }`}
                          >
                            <div className="flex items-center">
                              {item.iconImage ? (
                                <Image
                                  src={item.iconImage}
                                  alt={item.name}
                                  width={24}
                                  height={24}
                                  className="mr-3"
                                />
                              ) : (
                                <span className="mr-3 text-2xl">{item.icon}</span>
                              )}
                              <span className="font-semibold">{item.name}</span>
                            </div>
                            <span className={`text-lg transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                          </button>

                          {/* Subitens */}
                          {isExpanded && (
                            <div className="ml-6 mt-2 space-y-1">
                              {item.subItems.map((subItem) => {
                                const isActive = pathname === subItem.href;
                                return (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                      isActive
                                        ? 'bg-[#00C48C]/10 text-[#00C48C]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#00C48C]'
                                    }`}
                                  >
                                    <span className="mr-2 text-lg">{subItem.icon}</span>
                                    <span>{subItem.name}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Item normal sem submenu
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href!}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#00C48C] to-[#059669] text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#00C48C]'
                        }`}
                      >
                        {item.iconImage ? (
                          <Image
                            src={item.iconImage}
                            alt={item.name}
                            width={24}
                            height={24}
                            className="mr-3"
                          />
                        ) : (
                          <span className="mr-3 text-2xl">{item.icon}</span>
                        )}
                        <span className="font-semibold">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
