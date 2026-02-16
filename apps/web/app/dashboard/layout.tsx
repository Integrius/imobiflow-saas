'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { logout, getToken } from '@/lib/auth';
import ToastContainer from '@/components/ToastContainer';
import TrialWarning from '@/components/TrialWarning';
import NotificationBell from '@/components/NotificationBell';

// Tipos para navegação
interface SubMenuItem {
  name: string;
  href: string;
  icon: string;
}

interface MenuItem {
  name: string;
  icon: string;
  iconImage?: string | null;
  href?: string;
  subItems?: SubMenuItem[];
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
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

  // Seções de navegação para ADMIN/GESTOR
  const adminSections: MenuSection[] = [
    {
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      ]
    },
    {
      title: 'Comercial',
      items: [
        { name: 'Leads', href: '/dashboard/leads', icon: '👥' },
        { name: 'Negociações', href: '/dashboard/negociacoes', icon: '💼' },
        { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: '📅' },
        { name: 'Imóveis', href: '/dashboard/imoveis', icon: '🏠' },
        { name: 'Proprietários', href: '/dashboard/proprietarios', icon: '🏢' },
      ]
    },
    {
      title: 'Equipe',
      items: [
        { name: 'Corretores', href: '/dashboard/corretores', icon: '👔' },
        { name: 'Gerencial', href: '/dashboard/gerencial', icon: '📈' },
        { name: 'Metas', href: '/dashboard/metas', icon: '🎯' },
      ]
    },
    {
      title: 'Produtividade',
      items: [
        { name: 'Meu Desempenho', href: '/dashboard/meu-desempenho', icon: '🏆' },
        { name: 'Tarefas', href: '/dashboard/tarefas', icon: '📋' },
      ]
    },
    {
      title: 'Integrações',
      items: [
        { name: 'WhatsApp', href: '/dashboard/whatsapp', icon: '📱' },
      ]
    },
    {
      title: 'Administração',
      items: [
        { name: 'Minha Conta', href: '/dashboard/administracao', icon: '👤' },
        { name: 'Logs', href: '/dashboard/logs', icon: '📋' },
        { name: 'Cancelar Assinatura', href: '/dashboard/cancelar-assinatura', icon: '🚫' },
      ]
    }
  ];

  // Seções de navegação para CORRETOR
  const corretorSections: MenuSection[] = [
    {
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      ]
    },
    {
      title: 'Comercial',
      items: [
        { name: 'Leads', href: '/dashboard/leads', icon: '👥' },
        { name: 'Negociações', href: '/dashboard/negociacoes', icon: '💼' },
        { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: '📅' },
        { name: 'Imóveis', href: '/dashboard/imoveis', icon: '🏠' },
        { name: 'Proprietários', href: '/dashboard/proprietarios', icon: '🏢' },
      ]
    },
    {
      title: 'Produtividade',
      items: [
        { name: 'Meu Desempenho', href: '/dashboard/meu-desempenho', icon: '🏆' },
        { name: 'Tarefas', href: '/dashboard/tarefas', icon: '📋' },
      ]
    },
    {
      title: 'Conta',
      items: [
        { name: 'Minha Conta', href: '/dashboard/administracao', icon: '👤' },
      ]
    }
  ];

  // Seção Admin Geral (apenas para Vivoly)
  const adminGeralSection: MenuSection = {
    title: 'Admin Geral',
    items: [
      { name: 'Tenants', href: '/dashboard/admin/tenants', icon: '🏢' },
      { name: 'Logs Gerais', href: '/dashboard/admin/logs', icon: '📋' },
    ]
  };

  // Selecionar navegação baseada no tipo de usuário
  let sections = isAdmin ? adminSections : corretorSections;

  // Adicionar seção Admin Geral se for Vivoly
  if (isVivolyAdmin) {
    sections = [...sections, adminGeralSection];
  }

  // Renderizar item do menu
  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.name}
        href={item.href!}
        onClick={() => isMobile && setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-green-50 text-green-800'
            : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
        }`}
      >
        <span className="text-lg">{item.icon}</span>
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased h-screen flex overflow-hidden">
      <ToastContainer />

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex z-10">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2 text-green-800 font-bold text-xl">
            <Image
              src="/logo.svg"
              alt="Vivoly"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Vivoly Integrius</p>
            <p className="text-xs text-gray-400 mt-0.5">v1.16.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
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
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none bg-white shadow-lg"
              >
                <span className="sr-only">Fechar sidebar</span>
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Logo Mobile */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Vivoly"
                  width={140}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Mobile */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title && (
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {section.title}
                    </p>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => renderMenuItem(item, true))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Trial Warning */}
            <TrialWarning />

            {/* Notifications */}
            <NotificationBell />

            {/* User Info */}
            <span className="text-sm text-gray-700 hidden sm:block">
              Olá, <span className="font-semibold text-gray-800">{user?.nome || 'Usuário'}</span>
            </span>

            {/* Logout */}
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-600 font-semibold"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
