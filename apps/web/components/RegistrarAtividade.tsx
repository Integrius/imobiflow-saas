'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';

interface RegistrarAtividadeProps {
  leadId: string;
  leadNome: string;
  onSuccess?: () => void;
}

type TipoAtividade = 'LIGACAO' | 'WHATSAPP' | 'VISITA' | 'NOTA';

const tiposAtividade: { value: TipoAtividade; label: string; icon: string }[] = [
  { value: 'LIGACAO', label: 'Ligação', icon: '📞' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
  { value: 'VISITA', label: 'Visita', icon: '🏠' },
  { value: 'NOTA', label: 'Anotação', icon: '📝' },
];

export default function RegistrarAtividade({ leadId, leadNome, onSuccess }: RegistrarAtividadeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoAtividade | null>(null);
  const [observacao, setObservacao] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleRegistrar = async () => {
    if (!tipoSelecionado) {
      toast.error('Selecione o tipo de atividade');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/insights/interacoes/rapida', {
        lead_id: leadId,
        tipo: tipoSelecionado,
        observacao: observacao || undefined,
        duracao_minutos: tipoSelecionado === 'LIGACAO' ? duracaoMinutos : undefined,
      });

      toast.success('Atividade registrada com sucesso!');
      setModalOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao registrar atividade:', error);
      toast.error(error.response?.data?.error || 'Erro ao registrar atividade');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTipoSelecionado(null);
    setObservacao('');
    setDuracaoMinutos(undefined);
  };

  const handleClose = () => {
    setModalOpen(false);
    resetForm();
  };

  return (
    <>
      {/* Botão de Registrar Atividade */}
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#00C48C] to-[#059669] rounded-lg hover:shadow-md transition-all hover:scale-105"
        title="Registrar atividade com este lead"
      >
        <span>✅</span>
        <span>Registrar Atividade</span>
      </button>

      {/* Modal de Registro */}
      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        title={`Registrar Atividade - ${leadNome}`}
        size="md"
      >
        <div className="space-y-6">
          {/* Seleção do Tipo */}
          <div>
            <label className="block text-sm font-bold text-[#064E3B] mb-3">
              O que você fez? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {tiposAtividade.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTipoSelecionado(tipo.value)}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                    tipoSelecionado === tipo.value
                      ? 'bg-[#F0FDF4] border-[#00C48C] shadow-md'
                      : 'bg-white border-gray-200 hover:border-[#00C48C]/50'
                  }`}
                >
                  <span className="text-2xl">{tipo.icon}</span>
                  <span className={`font-bold ${
                    tipoSelecionado === tipo.value ? 'text-[#064E3B]' : 'text-[#4B5563]'
                  }`}>
                    {tipo.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duração (apenas para ligação) */}
          {tipoSelecionado === 'LIGACAO' && (
            <div>
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Duração da ligação (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={duracaoMinutos || ''}
                onChange={(e) => setDuracaoMinutos(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Ex: 15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="block text-sm font-bold text-[#064E3B] mb-2">
              Observação {tipoSelecionado === 'NOTA' ? '*' : '(opcional)'}
            </label>
            <textarea
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder={
                tipoSelecionado === 'LIGACAO' ? 'Ex: Cliente interessado, vai ver com a esposa...' :
                tipoSelecionado === 'WHATSAPP' ? 'Ex: Enviei catálogo de imóveis...' :
                tipoSelecionado === 'VISITA' ? 'Ex: Visitamos 3 apartamentos, gostou do último...' :
                'Anote suas observações sobre este lead...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-[#059669] border-2 border-[#059669] rounded-lg hover:bg-[#059669] hover:text-white font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegistrar}
              disabled={submitting || !tipoSelecionado || (tipoSelecionado === 'NOTA' && !observacao)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00C48C] to-[#059669] text-white rounded-lg hover:shadow-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registrando...' : '✅ Registrar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
