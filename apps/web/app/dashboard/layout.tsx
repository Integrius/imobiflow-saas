'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900 mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-blue-600">ImobiFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.nome || 'Usuário'}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
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
          <div className="flex flex-col w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 shadow-2xl h-[calc(100vh-4rem)]">
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
                          ? 'bg-gradient-to-r from-white to-blue-50 text-blue-900 shadow-2xl shadow-blue-900/30 border-2 border-blue-200 transform scale-105'
                          : 'bg-gradient-to-r from-blue-800/40 to-blue-700/40 text-blue-50 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:scale-102 border-2 border-blue-700/50 hover:border-blue-500'
                      } backdrop-blur-sm`}
                      style={{
                        boxShadow: isActive
                          ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                          : 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <span className="mr-4 text-3xl drop-shadow-lg">{item.icon}</span>
                      <span className="font-bold tracking-wide drop-shadow">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Footer da Sidebar */}
            <div className="px-4 pb-6 mt-auto">
              <div className="bg-gradient-to-r from-blue-800/60 to-indigo-800/60 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-blue-700/50 shadow-inner">
                <p className="text-sm text-blue-100 font-bold tracking-wider">ImobiFlow SaaS</p>
                <p className="text-xs text-blue-300 mt-1 font-semibold">versão 1.0.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 h-full">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-blue-600 shadow-xl"
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
                            ? 'bg-gradient-to-r from-white to-blue-50 text-blue-900 shadow-2xl border-2 border-blue-200'
                            : 'bg-gradient-to-r from-blue-800/40 to-blue-700/40 text-blue-50 hover:from-blue-700 hover:to-blue-600 border-2 border-blue-700/50'
                        } backdrop-blur-sm`}
                        style={{
                          boxShadow: isActive
                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                            : 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <span className="mr-4 text-3xl drop-shadow-lg">{item.icon}</span>
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
