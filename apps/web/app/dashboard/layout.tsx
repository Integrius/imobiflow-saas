'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { logout, getToken } from '@/lib/auth';
import ToastContainer from '@/components/ToastContainer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Leads', href: '/dashboard/leads', icon: '👥' },
    { name: 'Corretores', href: '/dashboard/corretores', icon: '🏢' },
    { name: 'Proprietários', href: '/dashboard/proprietarios', icon: '🏠' },
    { name: 'Imóveis', href: '/dashboard/imoveis', icon: '🏘️' },
    { name: 'Negociações', href: '/dashboard/negociacoes', icon: '💼' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <ToastContainer />
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-[#6F5A4A] to-[#8B6F5C] shadow-lg fixed w-full z-10 border-b border-[rgba(169,126,111,0.3)]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-[#F4EFE9] hover:text-white mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Vivoly"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#F4EFE9]">
                Olá, {user?.nome || 'Usuário'}
              </span>
              <button
                onClick={logout}
                className="text-sm text-[#FF6B6B] hover:text-[#FF3390] font-medium"
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
          <div className="flex flex-col w-72 bg-gradient-to-br from-[#F4EFE9] to-[#F4E2CE] shadow-2xl h-[calc(100vh-4rem)] border-r border-[rgba(169,126,111,0.2)]">
            <div className="flex-1 flex flex-col pt-8 pb-6 overflow-y-auto">
              <nav className="mt-2 flex-1 px-4 space-y-3">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-5 py-4 text-sm font-bold rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#8FD14F] to-[#006D77] text-white shadow-xl glow-green border-2 border-[#8FD14F] transform scale-105'
                          : 'bg-white text-[#2C2C2C] hover:bg-[#DFF9C7] hover:shadow-lg hover:scale-102 border-2 border-[rgba(169,126,111,0.15)] hover:border-[#8FD14F]/50'
                      } backdrop-blur-sm`}
                    >
                      <span className="mr-4 text-3xl drop-shadow">{item.icon}</span>
                      <span className="font-bold tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Footer da Sidebar */}
            <div className="px-4 pb-6 mt-auto">
              <div className="bg-gradient-to-r from-[#C7A695] to-[#A97E6F] rounded-xl p-4 text-center border-2 border-[#A97E6F] shadow-md">
                <p className="text-sm text-white font-bold tracking-wider">Vivoly</p>
                <p className="text-xs text-[#F4E2CE] mt-1 font-semibold">versão 1.0.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-[#2C2C2C] bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-br from-[#F4EFE9] to-[#F4E2CE] h-full border-r border-[rgba(169,126,111,0.2)]">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8FD14F] bg-[#A97E6F] shadow-xl"
                >
                  <span className="sr-only">Fechar sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 h-0 pt-8 pb-6 overflow-y-auto">
                <nav className="mt-2 px-4 space-y-3">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-5 py-4 text-base font-bold rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#8FD14F] to-[#006D77] text-white shadow-xl glow-green border-2 border-[#8FD14F]'
                            : 'bg-white text-[#2C2C2C] hover:bg-[#DFF9C7] hover:shadow-lg border-2 border-[rgba(169,126,111,0.15)] hover:border-[#8FD14F]/50'
                        } backdrop-blur-sm`}
                      >
                        <span className="mr-4 text-3xl drop-shadow">{item.icon}</span>
                        <span className="font-bold tracking-wide">{item.name}</span>
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
