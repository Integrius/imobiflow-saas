'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Target, BarChart3, CalendarDays, Plus, Package, Pencil, Trash2, RefreshCw } from 'lucide-react';

interface Corretor {
  id: string;
  creci: string;
  user: {
    nome: string;
    email: string;
  };
}

interface Meta {
  id: string;
  corretor_id: string;
  corretor: Corretor;
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

interface ResumoMetas {
  periodo: { mes: number; ano: number };
  estatisticas: {
    totalCorretoresComMeta: number;
    metasAtingidas: number;
    percentualAtingimento: number;
    mediaProgresso: number;
  };
  ranking: Meta[];
  todas: Meta[];
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function MetasPage() {
  const [resumo, setResumo] = useState<ResumoMetas | null>(null);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mesAno, setMesAno] = useState(() => {
    const now = new Date();
    return { mes: now.getMonth() + 1, ano: now.getFullYear() };
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'individual' | 'lote'>('individual');
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [formData, setFormData] = useState({
    corretor_id: '',
    meta_leads: '',
    meta_visitas: '',
    meta_propostas: '',
    meta_fechamentos: '',
    meta_valor: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    loadCorretores();
  }, [mesAno]);

  async function loadData() {
    try {
      setLoading(true);
      const response = await api.get(`/metas/resumo?mes=${mesAno.mes}&ano=${mesAno.ano}`);
      setResumo(response.data.data);
    } catch (err: any) {
      console.error('Erro ao carregar metas:', err);
      if (err.response?.status === 403) {
        setError('Acesso negado. Apenas ADMIN ou GESTOR podem acessar esta página.');
      } else {
        setError('Erro ao carregar dados de metas.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadCorretores() {
    try {
      const response = await api.get('/corretores');
      setCorretores(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar corretores:', err);
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

  function getStatusColor(status: string) {
    switch (status) {
      case 'ATINGIDA': return 'bg-green-100 text-green-800';
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
      case 'NAO_ATINGIDA': return 'bg-red-100 text-red-800';
      case 'CANCELADA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getProgressColor(percent: number) {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function openCreateModal(mode: 'individual' | 'lote') {
    setModalMode(mode);
    setSelectedMeta(null);
    setFormData({
      corretor_id: '',
      meta_leads: '',
      meta_visitas: '',
      meta_propostas: '',
      meta_fechamentos: '',
      meta_valor: ''
    });
    setShowModal(true);
  }

  function openEditModal(meta: Meta) {
    setModalMode('individual');
    setSelectedMeta(meta);
    setFormData({
      corretor_id: meta.corretor_id,
      meta_leads: meta.meta_leads?.toString() || '',
      meta_visitas: meta.meta_visitas?.toString() || '',
      meta_propostas: meta.meta_propostas?.toString() || '',
      meta_fechamentos: meta.meta_fechamentos?.toString() || '',
      meta_valor: meta.meta_valor?.toString() || ''
    });
    setShowModal(true);
  }

  async function handleSave() {
    try {
      setSaving(true);

      const metaData = {
        meta_leads: formData.meta_leads ? parseInt(formData.meta_leads) : undefined,
        meta_visitas: formData.meta_visitas ? parseInt(formData.meta_visitas) : undefined,
        meta_propostas: formData.meta_propostas ? parseInt(formData.meta_propostas) : undefined,
        meta_fechamentos: formData.meta_fechamentos ? parseInt(formData.meta_fechamentos) : undefined,
        meta_valor: formData.meta_valor ? parseFloat(formData.meta_valor) : undefined
      };

      if (modalMode === 'lote') {
        // Criar em lote
        await api.post('/metas/lote', {
          mes: mesAno.mes,
          ano: mesAno.ano,
          meta_padrao: metaData
        });
      } else if (selectedMeta) {
        // Editar existente
        await api.patch(`/metas/${selectedMeta.id}`, metaData);
      } else {
        // Criar individual
        if (!formData.corretor_id) {
          alert('Selecione um corretor');
          return;
        }
        await api.post('/metas', {
          corretor_id: formData.corretor_id,
          mes: mesAno.mes,
          ano: mesAno.ano,
          ...metaData
        });
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('Erro ao salvar meta:', err);
      alert(err.response?.data?.error || 'Erro ao salvar meta');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(metaId: string) {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      await api.delete(`/metas/${metaId}`);
      loadData();
    } catch (err: any) {
      console.error('Erro ao excluir meta:', err);
      alert(err.response?.data?.error || 'Erro ao excluir meta');
    }
  }

  async function handleAtualizarProgresso() {
    try {
      await api.post('/metas/atualizar-progresso-mensal');
      loadData();
    } catch (err: any) {
      console.error('Erro ao atualizar progresso:', err);
      alert(err.response?.data?.error || 'Erro ao atualizar progresso');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[#FF6B6B] mb-4 font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 bg-[#00C48C] text-white rounded-lg font-bold hover:bg-[#059669] transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Metas de Corretores</h2>
          <p className="text-[#374151] mt-2 text-lg font-medium">Defina e acompanhe metas mensais do time</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Seletor de Mês/Ano */}
          <select
            value={mesAno.mes}
            onChange={(e) => setMesAno({ ...mesAno, mes: parseInt(e.target.value) })}
            className="px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
          >
            {MESES.map((mes, index) => (
              <option key={index} value={index + 1}>{mes}</option>
            ))}
          </select>

          <select
            value={mesAno.ano}
            onChange={(e) => setMesAno({ ...mesAno, ano: parseInt(e.target.value) })}
            className="px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
          >
            {[2024, 2025, 2026, 2027].map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>

          <button
            onClick={handleAtualizarProgresso}
            className="px-4 py-2.5 bg-[#059669] text-white rounded-lg font-bold hover:bg-[#047857] transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" /> Atualizar
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface rounded-xl p-6 shadow-lg border-2 border-[#00C48C]/20">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#00C48C]" />
              <span className="text-xs font-bold text-[#00C48C] uppercase">Corretores</span>
            </div>
            <div className="text-3xl font-bold text-[#064E3B]">{resumo.estatisticas.totalCorretoresComMeta}</div>
            <p className="text-sm text-[#374151] font-medium">com metas definidas</p>
          </div>

          <div className="bg-surface rounded-xl p-6 shadow-lg border-2 border-[#059669]/20">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-[#059669]" />
              <span className="text-xs font-bold text-[#059669] uppercase">Atingidas</span>
            </div>
            <div className="text-3xl font-bold text-[#064E3B]">{resumo.estatisticas.metasAtingidas}</div>
            <p className="text-sm text-[#374151] font-medium">{resumo.estatisticas.percentualAtingimento}% do total</p>
          </div>

          <div className="bg-surface rounded-xl p-6 shadow-lg border-2 border-[#FFB627]/20">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-[#FFB627]" />
              <span className="text-xs font-bold text-[#FFB627] uppercase">Média</span>
            </div>
            <div className="text-3xl font-bold text-[#064E3B]">{resumo.estatisticas.mediaProgresso}%</div>
            <p className="text-sm text-[#374151] font-medium">progresso médio</p>
          </div>

          <div className="bg-surface rounded-xl p-6 shadow-lg border-2 border-[#8B5CF6]/20">
            <div className="flex items-center justify-between mb-2">
              <CalendarDays className="w-5 h-5 text-[#8B5CF6]" />
              <span className="text-xs font-bold text-[#8B5CF6] uppercase">Período</span>
            </div>
            <div className="text-2xl font-bold text-[#064E3B]">{MESES[mesAno.mes - 1]}</div>
            <p className="text-sm text-[#374151] font-medium">{mesAno.ano}</p>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <button
          onClick={() => openCreateModal('individual')}
          className="px-6 py-3 bg-gradient-to-r from-[#00C48C] to-[#059669] text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 inline mr-1" /> Nova Meta Individual
        </button>
        <button
          onClick={() => openCreateModal('lote')}
          className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Package className="w-4 h-4 inline mr-1" /> Criar Metas em Lote
        </button>
      </div>

      {/* Tabela de Metas */}
      <div className="bg-surface rounded-xl shadow-lg border-2 border-edge-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-[#064E3B]">Corretor</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Leads</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Visitas</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Propostas</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Fechamentos</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Valor</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Geral</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Status</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#064E3B]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resumo?.todas.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-[#374151] font-medium">
                    Nenhuma meta definida para este período
                  </td>
                </tr>
              )}
              {resumo?.todas.map((meta) => (
                <tr key={meta.id} className="border-t hover:bg-surface-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-[#064E3B]">{meta.corretor.user.nome}</p>
                      <p className="text-xs text-[#374151] font-medium">CRECI: {meta.corretor.creci}</p>
                    </div>
                  </td>

                  {/* Leads */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold">{meta.progresso_leads}/{meta.meta_leads || '-'}</p>
                      {meta.meta_leads && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.percentuais.leads)}`}
                            style={{ width: `${Math.min(meta.percentuais.leads, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Visitas */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold">{meta.progresso_visitas}/{meta.meta_visitas || '-'}</p>
                      {meta.meta_visitas && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.percentuais.visitas)}`}
                            style={{ width: `${Math.min(meta.percentuais.visitas, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Propostas */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold">{meta.progresso_propostas}/{meta.meta_propostas || '-'}</p>
                      {meta.meta_propostas && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.percentuais.propostas)}`}
                            style={{ width: `${Math.min(meta.percentuais.propostas, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Fechamentos */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold">{meta.progresso_fechamentos}/{meta.meta_fechamentos || '-'}</p>
                      {meta.meta_fechamentos && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.percentuais.fechamentos)}`}
                            style={{ width: `${Math.min(meta.percentuais.fechamentos, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Valor */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold text-sm">
                        {formatCurrency(meta.progresso_valor)}
                      </p>
                      <p className="text-xs text-[#374151] font-medium">
                        / {meta.meta_valor ? formatCurrency(meta.meta_valor) : '-'}
                      </p>
                      {meta.meta_valor && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.percentuais.valor)}`}
                            style={{ width: `${Math.min(meta.percentuais.valor, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Progresso Geral */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold ${
                        meta.percentuais.geral >= 100 ? 'bg-green-100 text-green-800' :
                        meta.percentuais.geral >= 75 ? 'bg-blue-100 text-blue-800' :
                        meta.percentuais.geral >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {meta.percentuais.geral}%
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(meta.status)}`}>
                        {meta.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(meta)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(meta.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-[#064E3B] mb-4">
              {modalMode === 'lote' ? 'Criar Metas em Lote' :
               selectedMeta ? 'Editar Meta' : 'Nova Meta'}
            </h3>

            <div className="space-y-4">
              {/* Seletor de Corretor (apenas para individual) */}
              {modalMode === 'individual' && !selectedMeta && (
                <div>
                  <label className="block text-sm font-bold text-[#064E3B] mb-1">Corretor</label>
                  <select
                    value={formData.corretor_id}
                    onChange={(e) => setFormData({ ...formData, corretor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                  >
                    <option value="">Selecione um corretor</option>
                    {corretores.map((corretor) => (
                      <option key={corretor.id} value={corretor.id}>
                        {corretor.user.nome} - CRECI: {corretor.creci}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modalMode === 'lote' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    As metas serão criadas para <strong>todos os corretores ativos</strong> que ainda não possuem meta em {MESES[mesAno.mes - 1]}/{mesAno.ano}.
                  </p>
                </div>
              )}

              {/* Grid de Metas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#064E3B] mb-1">Meta de Leads</label>
                  <input
                    type="number"
                    value={formData.meta_leads}
                    onChange={(e) => setFormData({ ...formData, meta_leads: e.target.value })}
                    className="w-full px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Ex: 20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#064E3B] mb-1">Meta de Visitas</label>
                  <input
                    type="number"
                    value={formData.meta_visitas}
                    onChange={(e) => setFormData({ ...formData, meta_visitas: e.target.value })}
                    className="w-full px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Ex: 15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#064E3B] mb-1">Meta de Propostas</label>
                  <input
                    type="number"
                    value={formData.meta_propostas}
                    onChange={(e) => setFormData({ ...formData, meta_propostas: e.target.value })}
                    className="w-full px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Ex: 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#064E3B] mb-1">Meta de Fechamentos</label>
                  <input
                    type="number"
                    value={formData.meta_fechamentos}
                    onChange={(e) => setFormData({ ...formData, meta_fechamentos: e.target.value })}
                    className="w-full px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Ex: 5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#064E3B] mb-1">Meta de Valor (R$)</label>
                  <input
                    type="number"
                    value={formData.meta_valor}
                    onChange={(e) => setFormData({ ...formData, meta_valor: e.target.value })}
                    className="w-full px-4 py-2 border border-edge rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent"
                    placeholder="Ex: 500000"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-[#374151] font-medium hover:bg-surface-tertiary rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#00C48C] to-[#059669] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
