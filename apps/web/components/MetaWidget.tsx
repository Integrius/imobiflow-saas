'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface MetaData {
  id: string;
  mes: number;
  ano: number;
  meta_leads: number | null;
  meta_visitas: number | null;
  meta_propostas: number | null;
  meta_fechamentos: number | null;
  meta_valor: number | null;
  progresso_leads: number;
  progresso_visitas: number;
  progresso_propostas: number;
  progresso_fechamentos: number;
  progresso_valor: number;
  status: string;
  percentuais: {
    leads: number;
    visitas: number;
    propostas: number;
    fechamentos: number;
    valor: number;
    geral: number;
  };
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export default function MetaWidget() {
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeta();
  }, []);

  async function loadMeta() {
    try {
      setLoading(true);
      const response = await api.get('/metas/minha-meta');
      setMeta(response.data.data);
    } catch (err: any) {
      // Silenciosamente ignora erros (corretor pode não ter meta)
      console.log('Nenhuma meta encontrada:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function getProgressColor(percent: number) {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function getProgressBgColor(percent: number) {
    if (percent >= 100) return 'from-green-500/20 to-green-500/5';
    if (percent >= 75) return 'from-blue-500/20 to-blue-500/5';
    if (percent >= 50) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-red-500/20 to-red-500/5';
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <div className="text-center">
          <span className="text-4xl mb-3 block">🎯</span>
          <h3 className="text-lg font-bold text-[#064E3B] mb-2">Metas do Mês</h3>
          <p className="text-sm text-[#4B5563]">
            Nenhuma meta definida para este mês.
          </p>
          <p className="text-xs text-[#4B5563] mt-2">
            Solicite ao seu gestor para definir suas metas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${getProgressBgColor(meta.percentuais.geral)} rounded-xl p-6 shadow-lg border-2 border-gray-100`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#064E3B]">Minhas Metas</h3>
          <p className="text-sm text-[#4B5563]">{MESES[meta.mes - 1]} {meta.ano}</p>
        </div>
        <div className={`text-3xl font-bold ${
          meta.percentuais.geral >= 100 ? 'text-green-600' :
          meta.percentuais.geral >= 75 ? 'text-blue-600' :
          meta.percentuais.geral >= 50 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {meta.percentuais.geral}%
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {/* Leads */}
        {meta.meta_leads && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#4B5563]">Leads</span>
              <span className="font-semibold">{meta.progresso_leads}/{meta.meta_leads}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(meta.percentuais.leads)}`}
                style={{ width: `${Math.min(meta.percentuais.leads, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Visitas */}
        {meta.meta_visitas && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#4B5563]">Visitas</span>
              <span className="font-semibold">{meta.progresso_visitas}/{meta.meta_visitas}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(meta.percentuais.visitas)}`}
                style={{ width: `${Math.min(meta.percentuais.visitas, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Fechamentos */}
        {meta.meta_fechamentos && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#4B5563]">Fechamentos</span>
              <span className="font-semibold">{meta.progresso_fechamentos}/{meta.meta_fechamentos}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(meta.percentuais.fechamentos)}`}
                style={{ width: `${Math.min(meta.percentuais.fechamentos, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Valor */}
        {meta.meta_valor && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#4B5563]">Valor</span>
              <span className="font-semibold text-xs">
                {formatCurrency(meta.progresso_valor)} / {formatCurrency(meta.meta_valor)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(meta.percentuais.valor)}`}
                style={{ width: `${Math.min(meta.percentuais.valor, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="mt-4 flex justify-center">
        {meta.percentuais.geral >= 100 ? (
          <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
            Meta Atingida!
          </span>
        ) : meta.percentuais.geral >= 75 ? (
          <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
            Quase lá! Continue assim!
          </span>
        ) : meta.percentuais.geral >= 50 ? (
          <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
            Bom progresso!
          </span>
        ) : (
          <span className="px-4 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">
            Foco nas metas!
          </span>
        )}
      </div>
    </div>
  );
}
