'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  X,
  ReceiptText,
} from 'lucide-react';

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
    nome: 'Básico',
    preco: 97,
    limiteUsuarios: 3,
    limiteImoveis: 100,
    storage: '1GB',
    features: ['Gestão de leads', 'Imóveis', 'Negociações', 'Relatórios básicos'],
    destaque: false,
  },
  {
    id: 'PRO',
    nome: 'Pro',
    preco: 197,
    limiteUsuarios: 10,
    limiteImoveis: 500,
    storage: '5GB',
    features: ['Tudo do Básico', 'Sofia IA', 'Agendamentos', 'Metas', 'Relatórios avançados', 'WhatsApp'],
    destaque: true,
  },
  {
    id: 'ENTERPRISE',
    nome: 'Enterprise',
    preco: 397,
    limiteUsuarios: 50,
    limiteImoveis: 5000,
    storage: '50GB',
    features: ['Tudo do Pro', 'API aberta', 'Suporte prioritário', 'Customizações', 'Multi-filiais'],
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
  return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getStatusBadgeClasses(status: string): string {
  switch (status.toUpperCase()) {
    case 'TRIAL':      return 'bg-yellow-100 text-yellow-800';
    case 'ATIVO':      return 'bg-green-100 text-green-800';
    case 'PENDENTE':   return 'bg-blue-100 text-blue-800';
    case 'SUSPENSO':
    case 'CANCELADO':
    case 'INATIVO':    return 'bg-red-100 text-red-800';
    default:           return 'bg-gray-100 text-content';
  }
}

function getPaymentStatusBadge(status: string): { classes: string; label: string } {
  const s = status?.toLowerCase() ?? '';
  if (s === 'approved' || s === 'pago' || s === 'sucesso')
    return { classes: 'bg-green-100 text-green-800', label: 'Aprovado' };
  if (s === 'pending' || s === 'pendente')
    return { classes: 'bg-yellow-100 text-yellow-800', label: 'Pendente' };
  if (s === 'rejected' || s === 'recusado' || s === 'falha')
    return { classes: 'bg-red-100 text-red-800', label: 'Recusado' };
  return { classes: 'bg-gray-100 text-content', label: status || '--' };
}

// ---------------------------------------------------------------------------
// Check icon
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
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

  // Plan change state (paid view)
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoDef | null>(null);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

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
      if (assinaturaRes.status === 'fulfilled') setAssinaturaData(assinaturaRes.value.data);
      if (historicoRes.status === 'fulfilled') {
        const data = historicoRes.value.data;
        setHistoricoData(Array.isArray(data) ? data : []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados da assinatura.');
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Subscribe / plan change
  // -------------------------------------------------------------------------

  async function handleSubscribe(planoId: 'BASICO' | 'PRO' | 'ENTERPRISE') {
    setSubscribing(planoId);
    setError('');
    try {
      const response = await api.post('/pagamentos/assinar', { plano: planoId });
      const { checkoutUrl } = response.data;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Não foi possível gerar o link de pagamento. Tente novamente.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao processar. Tente novamente.');
    } finally {
      setSubscribing(null);
    }
  }

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const tenant = assinaturaData?.tenant;
  const assinatura = assinaturaData?.assinatura;
  const currentPlan = tenant?.plano?.toUpperCase() ?? '';
  const tenantStatus = tenant?.status?.toUpperCase() ?? '';

  // Paid view: tenant has an active subscription (not trial, not suspended/cancelled)
  const isPaidView = tenantStatus === 'ATIVO' && !!assinatura;
  const isTrial = tenantStatus === 'TRIAL';
  const daysRemaining =
    isTrial && tenant?.data_expiracao ? getDaysRemaining(tenant.data_expiracao) : null;

  // Plans available for change (exclude current)
  const alternatePlanos = PLANOS.filter((p) => p.id !== currentPlan);
  const currentPlanDef = PLANOS.find((p) => p.id === currentPlan);

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-content-secondary text-sm font-semibold">Carregando planos...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content">Planos e Assinatura</h1>
        <p className="text-sm text-content-secondary mt-1">
          Gerencie seu plano, acompanhe o uso e consulte o histórico de pagamentos.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Erro</p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================================================================
          PAID VIEW — tenant has active subscription
          ================================================================ */}
      {isPaidView ? (
        <>
          {/* Current plan card */}
          <div className="bg-surface rounded-xl shadow-sm border border-edge-light p-6">
            <h2 className="text-lg font-bold text-content mb-5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              Plano Atual
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1.5">Plano</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-brand text-white">
                  {currentPlan || 'Nenhum'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1.5">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClasses(tenantStatus)}`}>
                  {tenantStatus}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1.5">Próxima Cobrança</p>
                <p className="text-sm font-semibold text-content flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-content-tertiary" />
                  {assinatura?.proxima_cobranca ? formatDate(assinatura.proxima_cobranca) : '--'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1.5">Valor Mensal</p>
                <p className="text-sm font-semibold text-content flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-content-tertiary" />
                  {assinatura?.valor_mensal ? formatCurrency(assinatura.valor_mensal) : '--'}
                </p>
              </div>
            </div>

            {/* Usage bars */}
            {tenant && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-edge-light">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-content flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-content-tertiary" /> Usuários
                    </p>
                    <p className="text-sm text-content-secondary">{tenant.total_usuarios} / {tenant.limite_usuarios}</p>
                  </div>
                  <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${Math.min(100, (tenant.total_usuarios / Math.max(1, tenant.limite_usuarios)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-content flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-content-tertiary" /> Imóveis
                    </p>
                    <p className="text-sm text-content-secondary">{tenant.total_imoveis} / {tenant.limite_imoveis}</p>
                  </div>
                  <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${Math.min(100, (tenant.total_imoveis / Math.max(1, tenant.limite_imoveis)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plan change section */}
          <div className="bg-surface rounded-xl shadow-sm border border-edge-light p-6">
            <h2 className="text-lg font-bold text-content mb-2">Alterar Plano</h2>
            <p className="text-sm text-content-secondary mb-6">
              Selecione um plano diferente do atual para iniciar o processo de mudança.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alternatePlanos.map((plano) => (
                <button
                  key={plano.id}
                  onClick={() => setPlanoSelecionado(plano)}
                  className={`text-left relative rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                    plano.destaque ? 'border-brand' : 'border-edge-light hover:border-edge'
                  }`}
                >
                  {plano.destaque && (
                    <span className="absolute -top-3 left-4 bg-brand text-white text-xs font-bold px-3 py-0.5 rounded-full">
                      Mais Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-base font-bold text-content">{plano.nome}</p>
                      <p className="text-2xl font-bold text-brand mt-1">
                        {formatCurrency(plano.preco)}
                        <span className="text-sm font-normal text-content-secondary">/mês</span>
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {plano.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-content-secondary">
                            <CheckIcon />
                            {f}
                          </li>
                        ))}
                        {plano.features.length > 3 && (
                          <li className="text-xs text-content-tertiary pl-6">+{plano.features.length - 3} mais recursos</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-brand" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment history */}
          <PaymentHistory historicoData={historicoData} />
        </>
      ) : (
        /* ================================================================
           TRIAL / FREE VIEW — show plans grid for subscription
           ================================================================ */
        <>
          {/* Trial banner */}
          {isTrial && daysRemaining !== null && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-bold text-amber-800">
                  Período de teste:{' '}
                  <span className="font-bold">
                    {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                  </span>
                </p>
              </div>
              <p className="text-sm text-amber-700 sm:ml-2">
                Escolha um plano abaixo para continuar usando o sistema após o período de teste.
              </p>
            </div>
          )}

          {/* Current plan info (compact — only for trial with existing plan) */}
          {tenant && currentPlan && (
            <div className="bg-surface rounded-xl shadow-sm border border-edge-light p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">Plano</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-surface-secondary text-content">
                    {currentPlan}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClasses(tenantStatus)}`}>
                    {tenantStatus}
                  </span>
                </div>
                {tenant.data_expiracao && (
                  <div>
                    <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">Expira em</p>
                    <p className="text-sm font-semibold text-content">{formatDate(tenant.data_expiracao)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plans grid */}
          <div>
            <h2 className="text-lg font-bold text-content mb-4">Escolha seu Plano</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANOS.map((plano) => {
                const isCurrentPlan = currentPlan === plano.id;
                const isUpgrade =
                  !isCurrentPlan &&
                  PLANOS.findIndex((p) => p.id === plano.id) > PLANOS.findIndex((p) => p.id === currentPlan);

                return (
                  <div
                    key={plano.id}
                    className={`relative bg-surface rounded-xl shadow-sm border-2 p-6 flex flex-col transition-shadow hover:shadow-md ${
                      plano.destaque ? 'border-brand' : isCurrentPlan ? 'border-edge' : 'border-edge-light'
                    }`}
                  >
                    {plano.destaque && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          Mais Popular
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-content mt-2">{plano.nome}</h3>

                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-3xl font-bold text-content">{formatCurrency(plano.preco)}</span>
                      <span className="text-sm text-content-secondary mb-1">/mês</span>
                    </div>

                    <hr className="my-4 border-edge-light" />

                    <div className="space-y-2 text-sm text-content mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-content-tertiary flex-shrink-0" />
                        <span>Até {plano.limiteUsuarios} {plano.limiteUsuarios === 1 ? 'usuário' : 'usuários'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-content-tertiary flex-shrink-0" />
                        <span>Até {plano.limiteImoveis.toLocaleString('pt-BR')} imóveis</span>
                      </div>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {plano.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-content">
                          <CheckIcon />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      {isCurrentPlan ? (
                        <button disabled className="w-full py-2.5 rounded-lg text-sm font-bold bg-surface-secondary text-content-secondary cursor-not-allowed">
                          Plano Atual
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(plano.id)}
                          disabled={subscribing !== null}
                          className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${
                            subscribing === plano.id ? 'bg-brand/80 cursor-wait' : 'bg-brand hover:bg-brand/90'
                          } disabled:opacity-60`}
                        >
                          {subscribing === plano.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processando...
                            </span>
                          ) : isUpgrade ? 'Fazer Upgrade' : 'Assinar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>

    {/* ====================================================================
        Modal de confirmação de mudança de plano (paid view)
        ==================================================================== */}
    {planoSelecionado && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-surface rounded-2xl shadow-2xl border border-edge max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-content">Confirmar Mudança de Plano</h3>
              <p className="text-sm text-content-secondary mt-0.5">
                Você será redirecionado para a página de pagamento.
              </p>
            </div>
            <button
              onClick={() => setPlanoSelecionado(null)}
              className="p-1 rounded-md text-content-tertiary hover:text-content hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plan comparison */}
          <div className="bg-surface-secondary rounded-xl p-4 mb-4 space-y-3">
            {currentPlanDef && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-content-secondary">Plano atual</span>
                <span className="font-semibold text-content">
                  {currentPlanDef.nome} — {formatCurrency(currentPlanDef.preco)}/mês
                </span>
              </div>
            )}
            <div className="border-t border-edge-light" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-content-secondary">Novo plano</span>
              <span className="font-bold text-brand text-base">
                {planoSelecionado.nome} — {formatCurrency(planoSelecionado.preco)}/mês
              </span>
            </div>
          </div>

          {/* Features of new plan */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
              Incluso no {planoSelecionado.nome}
            </p>
            <ul className="space-y-1.5">
              {planoSelecionado.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-content-secondary">
                  <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setPlanoSelecionado(null)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-edge text-content-secondary hover:bg-surface-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                handleSubscribe(planoSelecionado.id);
                setPlanoSelecionado(null);
              }}
              disabled={subscribing !== null}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {subscribing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <ReceiptText className="w-4 h-4" />
                  Ir para Pagamento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Payment history sub-component
// ---------------------------------------------------------------------------

function PaymentHistory({ historicoData }: { historicoData: HistoricoEvento[] }) {
  function getPaymentStatusBadge(status: string): { classes: string; label: string } {
    const s = status?.toLowerCase() ?? '';
    if (s === 'approved' || s === 'pago' || s === 'sucesso')
      return { classes: 'bg-green-100 text-green-800', label: 'Aprovado' };
    if (s === 'pending' || s === 'pendente')
      return { classes: 'bg-yellow-100 text-yellow-800', label: 'Pendente' };
    if (s === 'rejected' || s === 'recusado' || s === 'falha')
      return { classes: 'bg-red-100 text-red-800', label: 'Recusado' };
    return { classes: 'bg-gray-100 text-content', label: status || '--' };
  }

  function formatDateTime(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-edge-light p-6">
      <h2 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
        <ReceiptText className="w-5 h-5 text-content-tertiary" />
        Histórico de Pagamentos
      </h2>

      {historicoData.length === 0 ? (
        <div className="text-center py-10">
          <ReceiptText className="w-12 h-12 text-content-tertiary mx-auto mb-3" />
          <p className="text-sm text-content-secondary font-semibold">Nenhum histórico de pagamento</p>
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
                  <tr key={idx} className="border-b border-edge-light hover:bg-surface-secondary transition-colors">
                    <td className="py-3 px-4 text-content">
                      {evento.data ? formatDateTime(evento.data) : evento.timestamp ? formatDateTime(evento.timestamp) : '--'}
                    </td>
                    <td className="py-3 px-4 text-content capitalize">{evento.tipo ?? '--'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge.classes}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-content-secondary">
                      {evento.detalhes ?? (evento.valor ? formatCurrency(evento.valor) : evento.plano ? `Plano ${evento.plano}` : '--')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
