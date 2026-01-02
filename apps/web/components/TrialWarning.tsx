'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TrialInfo {
  isTrial: boolean;
  dias_restantes: number;
  status: string;
}

export default function TrialWarning() {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrialInfo();
  }, []);

  const loadTrialInfo = async () => {
    try {
      const response = await api.get('/trial-info');
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

  const { dias_restantes } = trialInfo;

  // Não mostrar se ainda tem mais de 7 dias
  if (dias_restantes > 7) {
    return null;
  }

  // Definir cor baseado nos dias restantes
  let bgColor = 'bg-[#FFB627]/10';
  let borderColor = 'border-[#FFB627]/30';
  let textColor = 'text-[#FFB627]';
  let icon = '⏰';

  if (dias_restantes <= 3) {
    bgColor = 'bg-[#FF6B6B]/10';
    borderColor = 'border-[#FF6B6B]/30';
    textColor = 'text-[#FF006E]';
    icon = '⚠️';
  }

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-3 mb-4`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-bold ${textColor}`}>
            {dias_restantes === 1 
              ? 'Último dia de teste!' 
              : dias_restantes === 0
              ? 'Período de teste expirando hoje'
              : `${dias_restantes} dias restantes no período de teste`
            }
          </p>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Entre em contato para ativar sua assinatura e continuar usando o ImobiFlow
          </p>
        </div>
      </div>
    </div>
  );
}
