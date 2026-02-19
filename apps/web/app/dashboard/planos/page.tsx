'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Assinatura {
  plano: string;
  status: string;
  valor_mensal: number;
  proxima_cobranca: string | null;
  gateway: string | null;
  metodo_pagamento: string | null;
  periodicidade: string | null;
  created_at: string;
}

interface TenantInfo {
  nome: string;
  plano: string;
  status: string;
  data_expiracao: string | null;
  limite_usuarios: number;
  limite_imoveis: number;
  total_usuarios: number;
  total_imoveis: number;
}

interface AssinaturaData {
  assinatura: Assinatura | null;
  tenant: TenantInfo;
}

interface HistoricoEvento {
  tipo: string;
  data: string;
  timestamp: string;
  status?: string;
  valor?: number;
  plano?: string;
  detalhes?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

interface PlanoDef {
  id: 'BASICO' | 'PRO' | 'ENTERPRISE';
  nome: string;
  preco: number;
  limiteUsuarios: number;
  limiteImoveis: number;
  storage: string;
  features: string[];
  destaque: boolean;
}

const PLANOS: PlanoDef[] = [
  {
    id: 'BASICO',
    nome: 'Basico',
    preco: 97,
    limiteUsuarios: 3,
    limiteImoveis: 100,
    storage: '1GB',
    features: [
      'Gestao de leads',
      'Imoveis',
      'Negociacoes',
      'Relatorios basicos',
    ],
    destaque: false,
  },
  {
    id: 'PRO',
    nome: 'Pro',
    preco: 197,
    limiteUsuarios: 10,
    limiteImoveis: 500,
    storage: '5GB',
    features: [
      'Tudo do Basico',
      'Sofia IA',
      'Agendamentos',
      'Metas',
      'Relatorios avancados',
      'WhatsApp',
    ],
    destaque: true,
  },
  {
    id: 'ENTERPRISE',
    nome: 'Enterprise',
    preco: 397,
    limiteUsuarios: 50,
    limiteImoveis: 5000,
    storage: '50GB',
    features: [
      'Tudo do Pro',
      'API aberta',
      'Suporte prioritario',
      'Customizacoes',
      'Multi-filiais',
    ],
    destaque: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getDaysRemaining(expirationDate: string): number {
  const now = new Date();
  const exp = new Date(expirationDate);
  const diff = exp.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ---------------------------------------------------------------------------
// Status badge helpers
// ---------------------------------------------------------------------------

function getStatusBadgeClasses(status: string): string {
  switch (status.toUpperCase()) {
    case 'TRIAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'ATIVO':
      return 'bg-green-100 text-green-800';
    case 'PENDENTE':
      return 'bg-blue-100 text-blue-800';
    case 'SUSPENSO':
    case 'CANCELADO':
    case 'INATIVO':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-content';
  }
}

function getPaymentStatusBadge(status: string): { classes: string; label: string } {
  const s = status?.toLowerCase() ?? '';
  if (s === 'approved' || s === 'pago' || s === 'sucesso') {
    return { classes: 'bg-green-100 text-green-800', label: 'Aprovado' };
  }
  if (s === 'pending' || s === 'pendente') {
    return { classes: 'bg-yellow-100 text-yellow-800', label: 'Pendente' };
  }
  if (s === 'rejected' || s === 'recusado' || s === 'falha') {
    return { classes: 'bg-red-100 text-red-800', label: 'Recusado' };
  }
  return { classes: 'bg-gray-100 text-content', label: status || '--' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PlanosPage() {
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [assinaturaData, setAssinaturaData] = useState<AssinaturaData | null>(null);
  const [historicoData, setHistoricoData] = useState<HistoricoEvento[]>([]);
  const [error, setError] = useState('');

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const [assinaturaRes, historicoRes] = await Promise.allSettled([
        api.get('/pagamentos/assinatura'),
        api.get('/pagamentos/historico'),
      ]);

      if (assinaturaRes.status === 'fulfilled') {
        setAssinaturaData(assinaturaRes.value.data);
      }

      if (historicoRes.status === 'fulfilled') {
        const data = historicoRes.value.data;
        setHistoricoData(Array.isArray(data) ? data : []);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao carregar dados da assinatura.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------------------------
  // Subscribe action
  // -----------------------------------------------------------------------

  async function handleSubscribe(plano: 'BASICO' | 'PRO' | 'ENTERPRISE') {
    setSubscribing(plano);
    setError('');
    try {
      const response = await api.post('/pagamentos/assinar', { plano });
      const { checkoutUrl } = response.data;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Nao foi possivel gerar o link de pagamento. Tente novamente.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao processar assinatura. Tente novamente.';
      setError(msg);
    } finally {
      setSubscribing(null);
    }
  }

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------

  const tenant = assinaturaData?.tenant;
  const assinatura = assinaturaData?.assinatura;
  const currentPlan = tenant?.plano?.toUpperCase() ?? '';
  const tenantStatus = tenant?.status?.toUpperCase() ?? '';
  const isTrial = tenantStatus === 'TRIAL';
  const daysRemaining =
    isTrial && tenant?.data_expiracao ? getDaysRemaining(tenant.data_expiracao) : null;

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#00C48C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-content-secondary text-sm font-semibold">Carregando planos...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-2xl font-bold text-content">Planos e Assinatura</h1>
        <p className="text-sm text-content-secondary mt-1">
          Gerencie seu plano, acompanhe o uso e consulte o historico de pagamentos.
        </p>
      </div>

      {/* ---- Error banner ---- */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">Erro</p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ---- Trial banner ---- */}
      {isTrial && daysRemaining !== null && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-bold text-amber-800">
              Periodo de teste:{' '}
              <span className="font-bold">
                {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
              </span>
            </p>
          </div>
          <p className="text-sm text-amber-700 sm:ml-2">
            Escolha um plano abaixo para continuar usando o sistema apos o periodo de teste.
          </p>
        </div>
      )}

      {/* ---- Current subscription card ---- */}
      {tenant && (
        <div className="bg-surface rounded-xl shadow-sm border border-edge-light p-6">
          <h2 className="text-lg font-bold text-content mb-4">Assinatura Atual</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan name */}
            <div>
              <p className="text-xs font-semibold text-content-secondary uppercase mb-1">Plano</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-[#064E3B] text-white">
                {currentPlan || 'Nenhum'}
              </span>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-content-secondary uppercase mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClasses(
                  tenantStatus
                )}`}
              >
                {tenantStatus}
              </span>
            </div>

            {/* Next billing */}
            <div>
              <p className="text-xs font-semibold text-content-secondary uppercase mb-1">
                Proxima Cobranca
              </p>
              <p className="text-sm font-semibold text-content">
                {assinatura?.proxima_cobranca
                  ? formatDate(assinatura.proxima_cobranca)
                  : '--'}
              </p>
            </div>

            {/* Monthly value */}
            <div>
              <p className="text-xs font-semibold text-content-secondary uppercase mb-1">
                Valor Mensal
              </p>
              <p className="text-sm font-semibold text-content">
                {assinatura?.valor_mensal
                  ? formatCurrency(assinatura.valor_mensal)
                  : '--'}
              </p>
            </div>
          </div>

          {/* Usage bars */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-content">Usuarios</p>
                <p className="text-sm text-content-secondary">
                  {tenant.total_usuarios}/{tenant.limite_usuarios}
                </p>
              </div>
              <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00C48C] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (tenant.total_usuarios / Math.max(1, tenant.limite_usuarios)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Properties */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-content">Imoveis</p>
                <p className="text-sm text-content-secondary">
                  {tenant.total_imoveis}/{tenant.limite_imoveis}
                </p>
              </div>
              <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00C48C] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (tenant.total_imoveis / Math.max(1, tenant.limite_imoveis)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Plans grid ---- */}
      <div>
        <h2 className="text-lg font-bold text-content mb-4">Escolha seu Plano</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANOS.map((plano) => {
            const isCurrentPlan = currentPlan === plano.id;
            const isUpgrade =
              !isCurrentPlan &&
              PLANOS.findIndex((p) => p.id === plano.id) >
                PLANOS.findIndex((p) => p.id === currentPlan);

            return (
              <div
                key={plano.id}
                className={`relative bg-surface rounded-xl shadow-sm border-2 p-6 flex flex-col transition-shadow hover:shadow-md ${
                  plano.destaque
                    ? 'border-[#00C48C]'
                    : isCurrentPlan
                    ? 'border-edge'
                    : 'border-edge-light'
                }`}
              >
                {/* "Mais Popular" badge */}
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-[#00C48C] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      Mais Popular
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-xl font-bold text-content mt-2">{plano.nome}</h3>

                {/* Price */}
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-content">
                    {formatCurrency(plano.preco)}
                  </span>
                  <span className="text-sm text-content-secondary mb-1">/mes</span>
                </div>

                {/* Divider */}
                <hr className="my-4 border-edge-light" />

                {/* Limits */}
                <div className="space-y-2 text-sm text-content mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-content-tertiary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>
                      Ate {plano.limiteUsuarios}{' '}
                      {plano.limiteUsuarios === 1 ? 'usuario' : 'usuarios'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-content-tertiary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
                      />
                    </svg>
                    <span>Ate {plano.limiteImoveis.toLocaleString('pt-BR')} imoveis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-content-tertiary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"
                      />
                    </svg>
                    <span>{plano.storage} de armazenamento</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plano.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-content">
                      <svg
                        className="w-4 h-4 text-[#00C48C] flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <div className="mt-6">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-lg text-sm font-bold bg-surface-secondary text-content-secondary cursor-not-allowed"
                    >
                      Plano Atual
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plano.id)}
                      disabled={subscribing !== null}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${
                        subscribing === plano.id
                          ? 'bg-[#059669] cursor-wait'
                          : 'bg-[#00C48C] hover:bg-[#059669]'
                      } disabled:opacity-60`}
                    >
                      {subscribing === plano.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processando...
                        </span>
                      ) : isUpgrade ? (
                        'Fazer Upgrade'
                      ) : (
                        'Assinar'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Payment history ---- */}
      <div className="bg-surface rounded-xl shadow-sm border border-edge-light p-6">
        <h2 className="text-lg font-bold text-content mb-4">Historico de Pagamentos</h2>

        {historicoData.length === 0 ? (
          <div className="text-center py-10">
            <svg
              className="w-12 h-12 text-content-tertiary mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-content-secondary font-semibold">
              Nenhum historico de pagamento
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th className="text-left py-3 px-4 font-semibold text-content-secondary">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-content-secondary">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-content-secondary">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-content-secondary">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {historicoData.map((evento, idx) => {
                  const statusBadge = getPaymentStatusBadge(evento.status ?? '');
                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-50 hover:bg-surface-secondary transition-colors"
                    >
                      <td className="py-3 px-4 text-content">
                        {evento.data
                          ? formatDateTime(evento.data)
                          : evento.timestamp
                          ? formatDateTime(evento.timestamp)
                          : '--'}
                      </td>
                      <td className="py-3 px-4 text-content capitalize">
                        {evento.tipo ?? '--'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge.classes}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-content-secondary">
                        {evento.detalhes
                          ? evento.detalhes
                          : evento.valor
                          ? formatCurrency(evento.valor)
                          : evento.plano
                          ? `Plano ${evento.plano}`
                          : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
