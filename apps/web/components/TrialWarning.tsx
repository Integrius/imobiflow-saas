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

  const { dias_restantes } = trialInfo;

  // Definir cor e ícone baseado nos dias restantes
  let textColor = 'text-white';
  let icon = '✅';

  // Verde: mais de 7 dias
  if (dias_restantes > 7) {
    textColor = 'text-[#00C48C]';
    icon = '✅';
  }
  // Amarelo: 4-7 dias
  else if (dias_restantes >= 4) {
    textColor = 'text-[#FFB627]';
    icon = '⏰';
  }
  // Vermelho: 0-3 dias
  else {
    textColor = 'text-[#FF6B6B]';
    icon = '⚠️';
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/20">
      <span className="text-lg">{icon}</span>
      <span className={`text-sm font-semibold ${textColor}`}>
        Trial: {dias_restantes} {dias_restantes === 1 ? 'dia' : 'dias'}
      </span>
    </div>
  );
}
