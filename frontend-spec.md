<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integrius - Design System Reference</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        vivoly: {
                            50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e',
                            600: '#16a34a', 800: '#166534', 900: '#14532d',
                        },
                        sofia: {
                            light: '#e0e7ff', DEFAULT: '#4f46e5', // Roxo/Índigo para IA
                        }
                    }
                }
            }
        }
    </script>
    <style>
        @keyframes pulse-soft {
            0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
        }
        .sofia-active { animation: pulse-soft 2s infinite; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased h-screen flex overflow-hidden">

    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-10">
        <div class="h-16 flex items-center px-6 border-b border-gray-100">
            <div class="flex items-center gap-2 text-vivoly-800 font-bold text-xl">
                <i data-lucide="layout-grid" class="w-6 h-6 text-vivoly-600"></i>
                VIVOLY <span class="text-gray-400 font-normal text-sm ml-1">Integrius</span>
            </div>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            <div>
                <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm font-medium bg-vivoly-50 text-vivoly-800 rounded-lg mb-1">
                    <i data-lucide="bar-chart-2" class="w-4 h-4"></i> Dashboard
                </a>
            </div>
            <div>
                <p class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comercial</p>
                <div class="space-y-1">
                    <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                        <i data-lucide="users" class="w-4 h-4"></i> Leads
                    </a>
                    <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                        <i data-lucide="briefcase" class="w-4 h-4"></i> Negociações
                    </a>
                </div>
            </div>
        </nav>
    </aside>

    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <h1 class="text-xl font-bold text-gray-800">Visão Geral</h1>
            <button class="bg-vivoly-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2">
                <i data-lucide="plus" class="w-4 h-4"></i> Novo Lead
            </button>
        </header>

        <div class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div class="lg:col-span-2 space-y-8">
                    <div class="grid grid-cols-4 gap-4">
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <span class="text-xs font-semibold text-gray-500 uppercase">Leads</span>
                            <div class="text-2xl font-bold text-gray-900 mt-1">1,240</div>
                        </div>
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <span class="text-xs font-semibold text-gray-500 uppercase">Conversão</span>
                            <div class="text-2xl font-bold text-gray-900 mt-1">18.5%</div>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Performance</h3>
                        <div class="bg-gray-50 h-40 rounded flex items-center justify-center text-gray-400">
                            [Área do Chart.js ou ApexCharts]
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-1 shadow-lg text-white">
                        <div class="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center sofia-active">
                                    <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600"></i>
                                </div>
                                <h3 class="font-bold text-md">Sofia Insights</h3>
                            </div>
                            <p class="text-sm opacity-90 mb-3">"O lead Carlos Silva visualizou o imóvel #402 3x hoje."</p>
                            <button class="w-full py-1.5 bg-white text-indigo-600 font-bold text-xs rounded hover:bg-indigo-50">
                                Enviar Mensagem
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="font-bold text-gray-800 text-sm mb-3">Agenda Hoje</h3>
                        <div class="text-sm text-gray-600">Visita: Apto Jardins (14:00)</div>
                    </div>
                </div>

            </div>
        </div>
    </main>
    <script>lucide.createIcons();</script>
</body>
</html>