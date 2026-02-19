'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  ClipboardList, Phone, Mail, MessageCircle, Home, FileText,
  Users, MapPin, RefreshCw, User, CalendarDays, Bell, Check,
  Pencil, X, Trash2, ListChecks
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  tipo: string
  prioridade: string
  status: string
  data_vencimento?: string
  data_lembrete?: string
  data_conclusao?: string
  observacao_conclusao?: string
  recorrente: boolean
  tipo_recorrencia?: string
  created_at: string
  user?: { id: string; nome: string; email: string }
  lead?: { id: string; nome: string; telefone: string }
  corretor?: { id: string; user: { nome: string } }
}

interface Stats {
  total: number
  pendentes: number
  emAndamento: number
  concluidas: number
  atrasadas: number
  canceladas: number
  taxaConclusao: number
}

const TIPOS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'FOLLOW_UP', label: 'Follow-up', icon: ClipboardList },
  { value: 'LIGACAO', label: 'Ligação', icon: Phone },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
  { value: 'VISITA', label: 'Visita', icon: Home },
  { value: 'DOCUMENTO', label: 'Documento', icon: FileText },
  { value: 'REUNIAO', label: 'Reunião', icon: Users },
  { value: 'OUTRO', label: 'Outro', icon: MapPin }
]

const PRIORIDADES = [
  { value: 'BAIXA', label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  { value: 'MEDIA', label: 'Média', color: 'bg-blue-100 text-blue-700' },
  { value: 'ALTA', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENTE', label: 'Urgente', color: 'bg-red-100 text-red-700' }
]

const STATUS = [
  { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' },
  { value: 'CONCLUIDA', label: 'Concluída', color: 'bg-green-100 text-green-700' },
  { value: 'CANCELADA', label: 'Cancelada', color: 'bg-gray-100 text-gray-700' },
  { value: 'ATRASADA', label: 'Atrasada', color: 'bg-red-100 text-red-700' }
]

const RECORRENCIA = [
  { value: 'DIARIA', label: 'Diária' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'MENSAL', label: 'Mensal' }
]

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConcluirModal, setShowConcluirModal] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null)
  const [concluindoTarefa, setConcluindoTarefa] = useState<Tarefa | null>(null)
  const [observacaoConclusao, setObservacaoConclusao] = useState('')

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')

  // Form
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'FOLLOW_UP',
    prioridade: 'MEDIA',
    lead_id: '',
    data_vencimento: '',
    data_lembrete: '',
    recorrente: false,
    tipo_recorrencia: ''
  })

  useEffect(() => {
    loadTarefas()
    loadStats()
    loadLeads()
  }, [filtroStatus, filtroTipo, filtroPrioridade])

  const loadTarefas = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroStatus) params.append('status', filtroStatus)
      if (filtroTipo) params.append('tipo', filtroTipo)
      if (filtroPrioridade) params.append('prioridade', filtroPrioridade)

      const response = await api.get(`/tarefas?${params.toString()}`)
      setTarefas(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await api.get('/tarefas/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadLeads = async () => {
    try {
      const response = await api.get('/leads?limit=100')
      setLeads(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        lead_id: formData.lead_id || undefined,
        data_vencimento: formData.data_vencimento || undefined,
        data_lembrete: formData.data_lembrete || undefined,
        tipo_recorrencia: formData.recorrente ? formData.tipo_recorrencia : undefined
      }

      if (editingTarefa) {
        await api.patch(`/tarefas/${editingTarefa.id}`, payload)
      } else {
        await api.post('/tarefas', payload)
      }

      setShowModal(false)
      resetForm()
      loadTarefas()
      loadStats()
    } catch (error: any) {
      console.error('Erro ao salvar tarefa:', error)
      alert(error.response?.data?.error || 'Erro ao salvar tarefa')
    }
  }

  const handleConcluir = async () => {
    if (!concluindoTarefa) return

    try {
      await api.post(`/tarefas/${concluindoTarefa.id}/concluir`, {
        observacao: observacaoConclusao || undefined
      })

      setShowConcluirModal(false)
      setConcluindoTarefa(null)
      setObservacaoConclusao('')
      loadTarefas()
      loadStats()
    } catch (error: any) {
      console.error('Erro ao concluir tarefa:', error)
      alert(error.response?.data?.error || 'Erro ao concluir tarefa')
    }
  }

  const handleCancelar = async (tarefa: Tarefa) => {
    if (!confirm('Deseja cancelar esta tarefa?')) return

    try {
      await api.post(`/tarefas/${tarefa.id}/cancelar`)
      loadTarefas()
      loadStats()
    } catch (error: any) {
      console.error('Erro ao cancelar tarefa:', error)
      alert(error.response?.data?.error || 'Erro ao cancelar tarefa')
    }
  }

  const handleDelete = async (tarefa: Tarefa) => {
    if (!confirm('Deseja excluir esta tarefa permanentemente?')) return

    try {
      await api.delete(`/tarefas/${tarefa.id}`)
      loadTarefas()
      loadStats()
    } catch (error: any) {
      console.error('Erro ao excluir tarefa:', error)
      alert(error.response?.data?.error || 'Erro ao excluir tarefa')
    }
  }

  const openEditModal = (tarefa: Tarefa) => {
    setEditingTarefa(tarefa)
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      tipo: tarefa.tipo,
      prioridade: tarefa.prioridade,
      lead_id: tarefa.lead?.id || '',
      data_vencimento: tarefa.data_vencimento ? tarefa.data_vencimento.split('T')[0] : '',
      data_lembrete: tarefa.data_lembrete ? tarefa.data_lembrete.split('T')[0] : '',
      recorrente: tarefa.recorrente,
      tipo_recorrencia: tarefa.tipo_recorrencia || ''
    })
    setShowModal(true)
  }

  const openConcluirModal = (tarefa: Tarefa) => {
    setConcluindoTarefa(tarefa)
    setObservacaoConclusao('')
    setShowConcluirModal(true)
  }

  const resetForm = () => {
    setEditingTarefa(null)
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'FOLLOW_UP',
      prioridade: 'MEDIA',
      lead_id: '',
      data_vencimento: '',
      data_lembrete: '',
      recorrente: false,
      tipo_recorrencia: ''
    })
  }

  const getTipoIcon = (tipo: string): LucideIcon => {
    return TIPOS.find(t => t.value === tipo)?.icon || MapPin
  }

  const getPrioridadeStyle = (prioridade: string) => {
    return PRIORIDADES.find(p => p.value === prioridade)?.color || 'bg-gray-100 text-gray-700'
  }

  const getStatusStyle = (status: string) => {
    return STATUS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const isVencida = (tarefa: Tarefa) => {
    if (!tarefa.data_vencimento) return false
    if (tarefa.status === 'CONCLUIDA' || tarefa.status === 'CANCELADA') return false
    return new Date(tarefa.data_vencimento) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-content">Tarefas</h1>
          <p className="text-content-secondary font-medium">Gerencie suas tarefas e follow-ups</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-[#8FD14F] to-[#7AB93F] text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>+</span>
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
            <div className="text-3xl font-bold text-content">{stats.total}</div>
            <div className="text-sm text-content-secondary font-medium">Total</div>
          </div>
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">{stats.pendentes}</div>
            <div className="text-sm text-content-secondary font-medium">Pendentes</div>
          </div>
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{stats.emAndamento}</div>
            <div className="text-sm text-content-secondary font-medium">Em Andamento</div>
          </div>
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-3xl font-bold text-green-600">{stats.concluidas}</div>
            <div className="text-sm text-content-secondary font-medium">Concluídas</div>
          </div>
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-red-200">
            <div className="text-3xl font-bold text-red-600">{stats.atrasadas}</div>
            <div className="text-sm text-content-secondary font-medium">Atrasadas</div>
          </div>
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge">
            <div className="text-3xl font-bold text-content-secondary">{stats.canceladas}</div>
            <div className="text-sm text-content-secondary font-medium">Canceladas</div>
          </div>
          <div className="bg-surface rounded-lg p-4 shadow-sm border border-[#8FD14F]/30">
            <div className="text-3xl font-bold text-[#8FD14F]">{stats.taxaConclusao}%</div>
            <div className="text-sm text-[#6B7280] font-medium">Taxa Conclusão</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-semibold text-content-secondary mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
            >
              <option value="">Todos</option>
              {STATUS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-content-secondary mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
            >
              <option value="">Todos</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-content-secondary mb-1">Prioridade</label>
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
            >
              <option value="">Todas</option>
              {PRIORIDADES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-surface rounded-lg shadow-sm border border-edge-light overflow-hidden">
        {tarefas.length === 0 ? (
          <div className="p-8 text-center text-content-secondary">
            <div className="mb-2"><ListChecks className="w-10 h-10 text-content-tertiary mx-auto" /></div>
            <p className="font-medium">Nenhuma tarefa encontrada</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="mt-4 text-brand hover:underline"
            >
              Criar primeira tarefa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-edge-light">
            {tarefas.map((tarefa) => (
              <div
                key={tarefa.id}
                className={`p-4 hover:bg-surface-secondary transition-colors ${
                  isVencida(tarefa) ? 'bg-red-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {(() => { const Icon = getTipoIcon(tarefa.tipo); return <Icon className="w-5 h-5 text-content-tertiary mt-0.5 flex-shrink-0" />; })()}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${
                          tarefa.status === 'CONCLUIDA' ? 'line-through text-content-secondary' : 'text-content'
                        }`}>
                          {tarefa.titulo}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(tarefa.status)}`}>
                          {STATUS.find(s => s.value === tarefa.status)?.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPrioridadeStyle(tarefa.prioridade)}`}>
                          {PRIORIDADES.find(p => p.value === tarefa.prioridade)?.label}
                        </span>
                        {tarefa.recorrente && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            <RefreshCw className="w-3 h-3 inline" /> {RECORRENCIA.find(r => r.value === tarefa.tipo_recorrencia)?.label}
                          </span>
                        )}
                      </div>
                      {tarefa.descricao && (
                        <p className="text-sm text-content-secondary mt-1">{tarefa.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-content-secondary font-medium">
                        {tarefa.lead && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{tarefa.lead.nome}</span>
                          </span>
                        )}
                        {tarefa.data_vencimento && (
                          <span className={`flex items-center gap-1 ${isVencida(tarefa) ? 'text-red-500 font-semibold' : ''}`}>
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{formatDate(tarefa.data_vencimento)}</span>
                            {isVencida(tarefa) && <span>(Vencida!)</span>}
                          </span>
                        )}
                        {tarefa.data_lembrete && (
                          <span className="flex items-center gap-1">
                            <Bell className="w-3.5 h-3.5" />
                            <span>{formatDate(tarefa.data_lembrete)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(tarefa.status === 'PENDENTE' || tarefa.status === 'EM_ANDAMENTO' || tarefa.status === 'ATRASADA') && (
                      <>
                        <button
                          onClick={() => openConcluirModal(tarefa)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Concluir"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(tarefa)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelar(tarefa)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(tarefa)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nova/Editar Tarefa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-edge-light">
              <h2 className="text-xl font-bold text-content">
                {editingTarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-content mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  placeholder="Ex: Ligar para cliente sobre proposta"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  rows={3}
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-content mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  >
                    {TIPOS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-content mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                    className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  >
                    {PRIORIDADES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">
                  Lead Relacionado
                </label>
                <select
                  value={formData.lead_id}
                  onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                >
                  <option value="">Nenhum</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-content mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-content mb-1">
                    Lembrete
                  </label>
                  <input
                    type="date"
                    value={formData.data_lembrete}
                    onChange={(e) => setFormData({ ...formData, data_lembrete: e.target.value })}
                    className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  />
                </div>
              </div>

              <div className="border-t border-edge-light pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recorrente}
                    onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                    className="w-4 h-4 text-[#8FD14F] border-gray-300 rounded focus:ring-[#8FD14F]"
                  />
                  <span className="text-sm font-bold text-content">Tarefa Recorrente</span>
                </label>

                {formData.recorrente && (
                  <div className="mt-3">
                    <label className="block text-sm font-bold text-content mb-1">
                      Frequência
                    </label>
                    <select
                      value={formData.tipo_recorrencia}
                      onChange={(e) => setFormData({ ...formData, tipo_recorrencia: e.target.value })}
                      className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                    >
                      <option value="">Selecione...</option>
                      {RECORRENCIA.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-edge-light">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2.5 border border-edge text-content-secondary font-medium rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-[#8FD14F] to-[#7AB93F] text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  {editingTarefa ? 'Salvar' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Concluir Tarefa */}
      {showConcluirModal && concluindoTarefa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-edge-light">
              <h2 className="text-xl font-bold text-content">Concluir Tarefa</h2>
              <p className="text-sm text-[#6B7280] font-medium mt-1">{concluindoTarefa.titulo}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-content mb-1">
                  Observações da Conclusão (opcional)
                </label>
                <textarea
                  value={observacaoConclusao}
                  onChange={(e) => setObservacaoConclusao(e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                  rows={3}
                  placeholder="O que foi feito, resultado obtido..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-edge-light">
                <button
                  type="button"
                  onClick={() => {
                    setShowConcluirModal(false)
                    setConcluindoTarefa(null)
                    setObservacaoConclusao('')
                  }}
                  className="px-4 py-2.5 border border-edge text-content-secondary font-medium rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConcluir}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Concluir Tarefa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
