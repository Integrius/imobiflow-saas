'use client';

interface CorretorStatusLedProps {
  ativo: boolean;
  primeiroAcesso: boolean;
}

export default function CorretorStatusLed({ ativo, primeiroAcesso }: CorretorStatusLedProps) {
  // Determinar cor e mensagem do LED
  const getStatus = () => {
    if (!ativo) {
      return {
        color: 'bg-red-500',
        pulseColor: 'bg-red-400',
        tooltip: 'Corretor desabilitado/inativo - Não pode acessar o sistema',
        label: 'Inativo'
      };
    }

    if (primeiroAcesso) {
      return {
        color: 'bg-yellow-500',
        pulseColor: 'bg-yellow-400',
        tooltip: 'Aguardando primeiro acesso - Corretor ainda não trocou a senha temporária',
        label: 'Pendente'
      };
    }

    return {
      color: 'bg-green-500',
      pulseColor: 'bg-green-400',
      tooltip: 'Corretor ativo - Sistema liberado e funcionando normalmente',
      label: 'Ativo'
    };
  };

  const status = getStatus();

  return (
    <div className="group relative inline-flex items-center gap-2">
      {/* LED com animação de pulso */}
      <div className="relative flex items-center justify-center">
        {/* Pulso animado (apenas para ativo e pendente) */}
        {ativo && (
          <span className={`absolute inline-flex h-4 w-4 rounded-full ${status.pulseColor} opacity-75 animate-ping`}></span>
        )}
        {/* LED principal */}
        <span className={`relative inline-flex h-3 w-3 rounded-full ${status.color} ring-2 ring-white shadow-lg`}></span>
      </div>

      {/* Tooltip */}
      <div className="invisible group-hover:visible absolute z-50 left-0 top-6 w-64 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg transition-opacity duration-200">
        <div className="font-bold mb-1">{status.label}</div>
        <div className="text-gray-300">{status.tooltip}</div>
        {/* Setinha do tooltip */}
        <div className="absolute left-2 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
}
