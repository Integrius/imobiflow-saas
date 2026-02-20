'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, PartyPopper, Clock, AlertTriangle } from 'lucide-react';

interface TenantInfo {
  isTrial: boolean;
  dias_restantes?: number;
  status: string;
  campanha_lancamento?: boolean;
  nome?: string;
  logo_url?: string;
}

export default function TenantSubheader() {
  const [info, setInfo] = useState<TenantInfo | null>(null);

  useEffect(() => {
    api.get('/tenants/trial-info')
      .then((res) => setInfo(res.data))
      .catch(() => {});
  }, []);

  if (!info) return null;

  const { isTrial, dias_restantes, campanha_lancamento, nome } = info;

  // Badge de trial
  let badge: React.ReactNode = null;
  if (isTrial && dias_restantes !== undefined) {
    let color = 'text-brand';
    let icon: React.ReactNode = <CheckCircle2 className="w-3.5 h-3.5" />;

    if (campanha_lancamento) {
      if (dias_restantes > 10) {
        color = 'text-brand'; icon = <PartyPopper className="w-3.5 h-3.5" />;
      } else if (dias_restantes >= 4) {
        color = 'text-amber-500'; icon = <Clock className="w-3.5 h-3.5" />;
      } else {
        color = 'text-red-500'; icon = <AlertTriangle className="w-3.5 h-3.5" />;
      }
    } else {
      if (dias_restantes > 7) {
        color = 'text-brand'; icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      } else if (dias_restantes >= 4) {
        color = 'text-amber-500'; icon = <Clock className="w-3.5 h-3.5" />;
      } else {
        color = 'text-red-500'; icon = <AlertTriangle className="w-3.5 h-3.5" />;
      }
    }

    const label = campanha_lancamento
      ? dias_restantes <= 10
        ? `${dias_restantes} ${dias_restantes === 1 ? 'dia' : 'dias'} no plano promocional`
        : 'Plano promocional 60 dias'
      : `Trial: ${dias_restantes} ${dias_restantes === 1 ? 'dia' : 'dias'}`;

    badge = (
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary border-b border-edge-light px-4 md:px-6 py-1.5 flex items-center justify-between min-h-[32px]">
      {nome ? (
        <span className="text-xs font-semibold text-content-secondary truncate">{nome}</span>
      ) : (
        <span />
      )}
      {badge}
    </div>
  );
}
