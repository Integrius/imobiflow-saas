'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Interacao {
  id: string;
  tipo: 'WHATSAPP' | 'EMAIL' | 'LIGACAO' | 'VISITA' | 'NOTA' | 'SMS' | 'TELEGRAM';
  direcao: 'ENTRADA' | 'SAIDA';
  conteudo?: string;
  sentimento?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO';
  duracao_minutos?: number;
  automatico: boolean;
  corretor?: {
    user: {
      nome: string;
    };
  };
  created_at: string;
}

interface TimelineInteracoesProps {
  leadId: string;
  leadNome?: string;
  maxItems?: number;
  showHeader?: boolean;
  onInteracaoAdded?: () => void;
}

const tipoConfig: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  WHATSAPP: { icon: '💬', label: 'WhatsApp', color: 'text-[#25D366]', bgColor: 'bg-[#25D366]/10' },
  EMAIL: { icon: '📧', label: 'Email', color: 'text-[#EA4335]', bgColor: 'bg-[#EA4335]/10' },
  LIGACAO: { icon: '📞', label: 'Ligação', color: 'text-[#4285F4]', bgColor: 'bg-[#4285F4]/10' },
  VISITA: { icon: '🏠', label: 'Visita', color: 'text-[#FF9800]', bgColor: 'bg-[#FF9800]/10' },
  NOTA: { icon: '📝', label: 'Anotação', color: 'text-[#9C27B0]', bgColor: 'bg-[#9C27B0]/10' },
  SMS: { icon: '📱', label: 'SMS', color: 'text-[#607D8B]', bgColor: 'bg-[#607D8B]/10' },
  TELEGRAM: { icon: '✈️', label: 'Telegram', color: 'text-[#0088CC]', bgColor: 'bg-[#0088CC]/10' },
};

const sentimentoConfig: Record<string, { icon: string; color: string }> = {
  POSITIVO: { icon: '😊', color: 'text-green-500' },
  NEUTRO: { icon: '😐', color: 'text-gray-500' },
  NEGATIVO: { icon: '😞', color: 'text-red-500' },
};

export default function TimelineInteracoes({
  leadId,
  leadNome,
  maxItems = 50,
  showHeader = true,
  onInteracaoAdded,
}: TimelineInteracoesProps) {
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadInteracoes();
  }, [leadId]);

  const loadInteracoes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/insights/interacoes/lead/${leadId}?limit=${maxItems}`);
      setInteracoes(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar interações:', error);
      // Não mostrar toast de erro para não poluir UX
      setInteracoes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredInteracoes = filtroTipo === 'TODOS'
    ? interacoes
    : interacoes.filter((i) => i.tipo === filtroTipo);

  const tiposPresentes = [...new Set(interacoes.map((i) => i.tipo))];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C48C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h4 className="text-md font-bold text-[#064E3B] flex items-center gap-2">
            📋 Histórico de Interações
            <span className="text-xs font-normal text-[#4B5563] bg-gray-100 px-2 py-0.5 rounded-full">
              {interacoes.length} registros
            </span>
          </h4>
          <button
            onClick={loadInteracoes}
            className="text-xs text-[#00C48C] hover:text-[#059669] font-medium flex items-center gap-1"
            title="Atualizar"
          >
            🔄 Atualizar
          </button>
        </div>
      )}

      {/* Filtros */}
      {interacoes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroTipo('TODOS')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              filtroTipo === 'TODOS'
                ? 'bg-[#064E3B] text-white'
                : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
            }`}
          >
            Todos ({interacoes.length})
          </button>
          {tiposPresentes.map((tipo) => {
            const config = tipoConfig[tipo] || { icon: '📌', label: tipo, color: 'text-gray-500', bgColor: 'bg-gray-100' };
            const count = interacoes.filter((i) => i.tipo === tipo).length;
            return (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                  filtroTipo === tipo
                    ? `${config.bgColor} ${config.color} ring-2 ring-offset-1`
                    : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {filteredInteracoes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-[#4B5563] font-medium">
            {interacoes.length === 0
              ? 'Nenhuma interação registrada ainda'
              : 'Nenhuma interação deste tipo'}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Use o botão &quot;Registrar Atividade&quot; para adicionar
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical da timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00C48C] via-[#00C48C]/50 to-transparent"></div>

          <div className="space-y-4">
            {filteredInteracoes.map((interacao, index) => {
              const config = tipoConfig[interacao.tipo] || { icon: '📌', label: interacao.tipo, color: 'text-gray-500', bgColor: 'bg-gray-100' };
              const sentimento = interacao.sentimento ? sentimentoConfig[interacao.sentimento] : null;
              const isExpanded = expandedId === interacao.id;

              return (
                <div
                  key={interacao.id}
                  className="relative pl-10 group"
                >
                  {/* Ponto na timeline */}
                  <div
                    className={`absolute left-2 w-5 h-5 rounded-full ${config.bgColor} border-2 border-white shadow-sm flex items-center justify-center text-xs ${config.color} group-hover:scale-110 transition-transform`}
                  >
                    {config.icon}
                  </div>

                  {/* Card da interação */}
                  <div
                    className={`bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer ${
                      isExpanded ? 'ring-2 ring-[#00C48C]/30' : ''
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : interacao.id)}
                  >
                    {/* Header do card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${config.bgColor} ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          interacao.direcao === 'ENTRADA'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {interacao.direcao === 'ENTRADA' ? '← Recebido' : '→ Enviado'}
                        </span>
                        {sentimento && (
                          <span className={`text-sm ${sentimento.color}`} title={`Sentimento: ${interacao.sentimento}`}>
                            {sentimento.icon}
                          </span>
                        )}
                        {interacao.automatico && (
                          <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded" title="Registrado automaticamente">
                            🤖 Auto
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#9CA3AF] whitespace-nowrap" title={formatFullDate(interacao.created_at)}>
                        {formatDate(interacao.created_at)}
                      </span>
                    </div>

                    {/* Conteúdo */}
                    {interacao.conteudo && (
                      <p className={`mt-2 text-sm text-[#374151] ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {interacao.conteudo}
                      </p>
                    )}

                    {/* Detalhes expandidos */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {interacao.duracao_minutos && (
                          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                            <span>⏱️</span>
                            <span>Duração: <strong>{interacao.duracao_minutos} minutos</strong></span>
                          </div>
                        )}
                        {interacao.corretor?.user?.nome && (
                          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                            <span>👤</span>
                            <span>Registrado por: <strong>{interacao.corretor.user.nome}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                          <span>📅</span>
                          <span>{formatFullDate(interacao.created_at)}</span>
                        </div>
                      </div>
                    )}

                    {/* Indicador de expandir */}
                    {interacao.conteudo && interacao.conteudo.length > 100 && !isExpanded && (
                      <button className="mt-1 text-xs text-[#00C48C] hover:text-[#059669] font-medium">
                        Ver mais...
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer com estatísticas */}
      {interacoes.length > 0 && (
        <div className="bg-gradient-to-r from-[#F0FDF4] to-[#EFF6FF] rounded-lg p-3 border border-[#00C48C]/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#4B5563]">
                📊 <strong>{interacoes.length}</strong> interações total
              </span>
              {interacoes.filter((i) => i.direcao === 'SAIDA').length > 0 && (
                <span className="text-green-600">
                  → <strong>{interacoes.filter((i) => i.direcao === 'SAIDA').length}</strong> enviadas
                </span>
              )}
              {interacoes.filter((i) => i.direcao === 'ENTRADA').length > 0 && (
                <span className="text-blue-600">
                  ← <strong>{interacoes.filter((i) => i.direcao === 'ENTRADA').length}</strong> recebidas
                </span>
              )}
            </div>
            {interacoes[0] && (
              <span className="text-[#9CA3AF]">
                Última: {formatDate(interacoes[0].created_at)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
