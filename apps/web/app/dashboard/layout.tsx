'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { logout, getToken } from '@/lib/auth';
import ToastContainer from '@/components/ToastContainer';
import TrialWarning from '@/components/TrialWarning';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Users,
  Handshake,
  CalendarDays,
  Building2,
  UserSquare2,
  BadgeCheck,
  BarChart3,
  Target,
  TrendingUp,
  ListChecks,
  MessageCircle,
  CreditCard,
  Settings,
  FileText,
  XCircle,
  Building,
  ScrollText,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

interface MenuSection {
  key: string;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['comercial', 'equipe', 'produtividade'])
  );

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

    // Restaurar estado da sidebar
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed === 'true') setSidebarCollapsed(true);
  }, [router, pathname]);

  const isAdmin = user?.tipo === 'ADMIN' || user?.tipo === 'GESTOR';

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  // ─── Menu sections ───

  const adminSections: MenuSection[] = [
    {
      key: 'main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      key: 'comercial',
      title: 'Comercial',
      items: [
        { name: 'Leads', href: '/dashboard/leads', icon: Users },
        { name: 'Negociações', href: '/dashboard/negociacoes', icon: Handshake },
        { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: CalendarDays },
        { name: 'Imóveis', href: '/dashboard/imoveis', icon: Building2 },
        { name: 'Proprietários', href: '/dashboard/proprietarios', icon: UserSquare2 },
      ],
    },
    {
      key: 'equipe',
      title: 'Equipe',
      items: [
        { name: 'Corretores', href: '/dashboard/corretores', icon: BadgeCheck },
        { name: 'Gerencial', href: '/dashboard/gerencial', icon: BarChart3 },
        { name: 'Metas', href: '/dashboard/metas', icon: Target },
      ],
    },
    {
      key: 'produtividade',
      title: 'Produtividade',
      items: [
        { name: 'Meu Desempenho', href: '/dashboard/meu-desempenho', icon: TrendingUp },
        { name: 'Tarefas', href: '/dashboard/tarefas', icon: ListChecks },
      ],
    },
    {
      key: 'integracoes',
      title: 'Integrações',
      items: [
        { name: 'WhatsApp', href: '/dashboard/whatsapp', icon: MessageCircle },
      ],
    },
    {
      key: 'admin',
      title: 'Administração',
      items: [
        { name: 'Planos e Assinatura', href: '/dashboard/planos', icon: CreditCard },
        { name: 'Minha Conta', href: '/dashboard/administracao', icon: Settings },
        { name: 'Logs', href: '/dashboard/logs', icon: FileText },
        { name: 'Cancelar Assinatura', href: '/dashboard/cancelar-assinatura', icon: XCircle },
      ],
    },
  ];

  const corretorSections: MenuSection[] = [
    {
      key: 'main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      key: 'comercial',
      title: 'Comercial',
      items: [
        { name: 'Leads', href: '/dashboard/leads', icon: Users },
        { name: 'Negociações', href: '/dashboard/negociacoes', icon: Handshake },
        { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: CalendarDays },
        { name: 'Imóveis', href: '/dashboard/imoveis', icon: Building2 },
        { name: 'Proprietários', href: '/dashboard/proprietarios', icon: UserSquare2 },
      ],
    },
    {
      key: 'produtividade',
      title: 'Produtividade',
      items: [
        { name: 'Meu Desempenho', href: '/dashboard/meu-desempenho', icon: TrendingUp },
        { name: 'Tarefas', href: '/dashboard/tarefas', icon: ListChecks },
      ],
    },
    {
      key: 'conta',
      title: 'Conta',
      items: [
        { name: 'Minha Conta', href: '/dashboard/administracao', icon: Settings },
      ],
    },
  ];

  const adminGeralSection: MenuSection = {
    key: 'admin-geral',
    title: 'Admin Geral',
    items: [
      { name: 'Tenants', href: '/dashboard/admin/tenants', icon: Building },
      { name: 'Logs Gerais', href: '/dashboard/admin/logs', icon: ScrollText },
    ],
  };

  let sections = isAdmin ? adminSections : corretorSections;
  if (isVivolyAdmin) {
    sections = [...sections, adminGeralSection];
  }

  // ─── Render helpers ───

  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    const isActive = pathname === item.href;
    const IconComponent = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => isMobile && setSidebarOpen(false)}
        title={sidebarCollapsed && !isMobile ? item.name : undefined}
        className={`
          group flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md
          transition-colors duration-150
          ${isActive
            ? 'bg-brand-light text-brand-dark border-l-2 border-brand -ml-[1px]'
            : 'text-content-secondary hover:bg-surface-secondary hover:text-content'
          }
          ${sidebarCollapsed && !isMobile ? 'justify-center !px-0' : ''}
        `}
      >
        <IconComponent
          className={`w-4 h-4 flex-shrink-0 ${
            isActive ? 'text-brand' : 'text-content-tertiary group-hover:text-content-secondary'
          }`}
        />
        {(!sidebarCollapsed || isMobile) && (
          <span className="truncate">{item.name}</span>
        )}
      </Link>
    );
  };

  const renderSection = (section: MenuSection, isMobile: boolean = false) => {
    const isExpanded = expandedSections.has(section.key);
    const hasActiveItem = section.items.some(item => pathname === item.href);

    // Seções sem título (Dashboard) — renderizar direto
    if (!section.title) {
      return (
        <div key={section.key} className="mb-1">
          {section.items.map(item => renderMenuItem(item, isMobile))}
        </div>
      );
    }

    // Sidebar colapsada: apenas ícones, sem headers
    if (sidebarCollapsed && !isMobile) {
      return (
        <div key={section.key} className="space-y-0.5 py-1 border-t border-edge-light">
          {section.items.map(item => renderMenuItem(item, isMobile))}
        </div>
      );
    }

    return (
      <div key={section.key}>
        <button
          onClick={() => toggleSection(section.key)}
          className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-content-tertiary uppercase tracking-wider hover:text-content-secondary transition-colors"
        >
          <span>{section.title}</span>
          {isExpanded
            ? <ChevronDown className="w-3 h-3" />
            : <ChevronRight className="w-3 h-3" />
          }
        </button>
        {isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {section.items.map(item => renderMenuItem(item, isMobile))}
          </div>
        )}
        {!isExpanded && hasActiveItem && (
          <div className="flex justify-center py-0.5">
            <div className="w-1 h-1 rounded-full bg-brand" />
          </div>
        )}
      </div>
    );
  };

  // ─── Layout ───

  return (
    <div className="min-h-screen bg-surface-secondary text-content font-sans antialiased h-screen flex overflow-hidden">
      <ToastContainer />

      {/* Sidebar — Desktop */}
      <aside
        className={`
          ${sidebarCollapsed ? 'w-16' : 'w-56'}
          bg-surface border-r border-edge flex-col hidden md:flex z-10
          transition-[width] duration-200 ease-in-out
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center px-3 border-b border-edge-light">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logoIntegrius.png"
                alt="Integrius"
                width={140}
                height={40}
                className="h-9 w-auto"
                priority
              />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/logoIntegrius.png"
                alt="Integrius"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {sections.map(section => renderSection(section))}
        </nav>

        {/* Footer: Collapse toggle + version */}
        <div className="p-2 border-t border-edge-light">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-content-tertiary hover:text-content-secondary hover:bg-surface-secondary rounded-md transition-colors text-xs"
            title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
          {!sidebarCollapsed && (
            <p className="text-[10px] text-content-tertiary text-center mt-1">v1.16.0</p>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface h-full border-r border-edge shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none bg-surface shadow-lg"
              >
                <span className="sr-only">Fechar sidebar</span>
                <X className="h-5 w-5 text-content-secondary" />
              </button>
            </div>

            {/* Logo Mobile */}
            <div className="h-14 flex items-center px-4 border-b border-edge-light">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logoIntegrius.png"
                  alt="Integrius"
                  width={140}
                  height={40}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Mobile */}
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
              {sections.map(section => renderSection(section, true))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface-secondary">
        {/* Header */}
        <header className="h-14 bg-surface border-b border-edge flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-content-secondary hover:text-content"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <TrialWarning />
            <NotificationBell />
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-edge">
              <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center">
                <span className="text-xs font-semibold text-brand-dark">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-content font-medium">
                {user?.nome?.split(' ')[0] || 'Usuário'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sair"
              className="text-content-tertiary hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
