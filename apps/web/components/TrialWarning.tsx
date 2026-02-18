'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, PartyPopper, Clock, AlertTriangle } from 'lucide-react';

interface TrialInfo {
  isTrial: boolean;
  dias_restantes: number;
  status: string;
  campanha_lancamento?: boolean;
  trial_days?: number;
}

export default function TrialWarning() {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrialInfo();
  }, []);

  const loadTrialInfo = async () => {
    try {
      const response = await api.get('/tenants/trial-info');
      setTrialInfo(response.data);
    } catch (error) {
      console.error('Erro ao carregar informações do trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !trialInfo || !trialInfo.isTrial) {
    return null;
  }

  const { dias_restantes, campanha_lancamento } = trialInfo;

  // Definir cor e ícone baseado nos dias restantes
  let textColor = 'text-white';
  let icon: React.ReactNode = <CheckCircle2 className="w-4 h-4" />;

  if (campanha_lancamento) {
    if (dias_restantes > 10) {
      textColor = 'text-[#00C48C]';
      icon = <PartyPopper className="w-4 h-4" />;
    } else if (dias_restantes >= 4) {
      textColor = 'text-[#FFB627]';
      icon = <Clock className="w-4 h-4" />;
    } else {
      textColor = 'text-[#FF6B6B]';
      icon = <AlertTriangle className="w-4 h-4" />;
    }
  } else {
    if (dias_restantes > 7) {
      textColor = 'text-[#00C48C]';
      icon = <CheckCircle2 className="w-4 h-4" />;
    } else if (dias_restantes >= 4) {
      textColor = 'text-[#FFB627]';
      icon = <Clock className="w-4 h-4" />;
    } else {
      textColor = 'text-[#FF6B6B]';
      icon = <AlertTriangle className="w-4 h-4" />;
    }
  }

  // Texto do aviso
  let label: string;
  if (campanha_lancamento) {
    if (dias_restantes <= 10) {
      label = `Você tem ${dias_restantes} ${dias_restantes === 1 ? 'dia' : 'dias'} no plano promocional 60 dias`;
    } else {
      label = 'Plano promocional 60 dias';
    }
  } else {
    label = `Trial: ${dias_restantes} ${dias_restantes === 1 ? 'dia' : 'dias'}`;
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/20">
      <span>{icon}</span>
      <span className={`text-sm font-semibold ${textColor}`}>
        {label}
      </span>
    </div>
  );
}
