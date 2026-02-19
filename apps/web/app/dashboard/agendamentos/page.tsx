'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import Modal from '@/components/Modal'
import { Clock, CheckCircle2, Home, XCircle, Ban, Monitor, RefreshCw, CalendarDays, Star } from 'lucide-react'

interface Agendamento {
  id: string
  data_visita: string
  duracao_minutos: number
  tipo_visita: string
  status: string
  observacoes?: string
  confirmado_lead: boolean
  confirmado_corretor: boolean
  realizado: boolean
  feedback_lead?: string
  feedback_corretor?: string
  nota_lead?: number
  motivo_cancelamento?: string
  created_at: string
  lead: {
    id: string
    nome: string
    telefone: string
    email?: string
  }
  imovel: {
    id: string
    codigo: string
    titulo: string
    endereco: any
    tipo: string
  }
  corretor: {
    id: string
    user: {
      id: string
      nome: string
      email: string
    }
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: '' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: '' },
  REALIZADO: { label: 'Realizado', color: 'bg-green-100 text-green-700', icon: '' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: '' },
  NAO_COMPARECEU: { label: 'Não Compareceu', color: 'bg-gray-100 text-gray-700', icon: '' },
}

const TIPO_VISITA_CONFIG: Record<string, { label: string; icon: string }> = {
  PRESENCIAL: { label: 'Presencial', icon: '' },
  VIRTUAL: { label: 'Virtual', icon: '' },
  HIBRIDA: { label: 'Híbrida', icon: '' },
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [leads, setLeads] = useState<{ id: string; nome: string; telefone: string }[]>([])
  const [imoveis, setImoveis] = useState<{ id: string; codigo: string; titulo: string }[]>([])
  const [corretores, setCorretores] = useState<{ id: string; user: { nome: string } }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCancelarModal, setShowCancelarModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null)

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroCorretor, setFiltroCorretor] = useState('')

  // Form - Novo Agendamento
  const [formData, setFormData] = useState({
    lead_id: '',
    imovel_id: '',
    corretor_id: '',
    data_visita: '',
    hora_visita: '',
    duracao_minutos: '60',
    tipo_visita: 'PRESENCIAL' as 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA',
    observacoes: '',
  })

  // Form - Cancelar
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  // Form - Feedback
  const [feedbackData, setFeedbackData] = useState({
    feedback_corretor: '',
    feedback_lead: '',
    nota_lead: 5,
  })

  useEffect(() => {
    loadAgendamentos()
    loadLeads()
    loadImoveis()
    loadCorretores()
  }, [filtroStatus, filtroCorretor])

  const loadAgendamentos = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroStatus) params.append('status', filtroStatus)
      if (filtroCorretor) params.append('corretor_id', filtroCorretor)

      const response = await api.get(`/agendamentos?${params.toString()}`)
      setAgendamentos(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeads = async () => {
    try {
      const response = await api.get('/leads?limit=200')
      setLeads(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    }
  }

  const loadImoveis = async () => {
    try {
      const response = await api.get('/imoveis?limit=200')
      setImoveis(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error)
    }
  }

  const loadCorretores = async () => {
    try {
      const response = await api.get('/corretores')
      setCorretores(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar corretores:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataVisita = `${formData.data_visita}T${formData.hora_visita}:00`

      await api.post('/agendamentos', {
        lead_id: formData.lead_id,
        imovel_id: formData.imovel_id,
        corretor_id: formData.corretor_id,
        data_visita: dataVisita,
        duracao_minutos: parseInt(formData.duracao_minutos),
        tipo_visita: formData.tipo_visita,
        observacoes: formData.observacoes || undefined,
      })

      setShowModal(false)
      resetForm()
      loadAgendamentos()
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error)
      alert(error.response?.data?.message || error.response?.data?.error || 'Erro ao criar agendamento')
    }
  }

  const handleConfirmar = async (agendamento: Agendamento, confirmadoPor: 'LEAD' | 'CORRETOR') => {
    try {
      await api.post(`/agendamentos/${agendamento.id}/confirmar`, {
        confirmado_por: confirmadoPor,
      })
      loadAgendamentos()
      if (selectedAgendamento?.id === agendamento.id) {
        const response = await api.get(`/agendamentos/${agendamento.id}`)
        setSelectedAgendamento(response.data.data)
      }
    } catch (error: any) {
      console.error('Erro ao confirmar agendamento:', error)
      alert(error.response?.data?.message || 'Erro ao confirmar agendamento')
    }
  }

  const handleCancelar = async () => {
    if (!selectedAgendamento || !motivoCancelamento) return

    try {
      const userData = localStorage.getItem('user')
      const user = userData ? JSON.parse(userData) : null

      await api.post(`/agendamentos/${selectedAgendamento.id}/cancelar`, {
        motivo_cancelamento: motivoCancelamento,
        cancelado_por: user?.id || 'unknown',
      })

      setShowCancelarModal(false)
      setShowDetailModal(false)
      setMotivoCancelamento('')
      setSelectedAgendamento(null)
      loadAgendamentos()
    } catch (error: any) {
      console.error('Erro ao cancelar agendamento:', error)
      alert(error.response?.data?.message || 'Erro ao cancelar agendamento')
    }
  }

  const handleRealizar = async (agendamento: Agendamento) => {
    try {
      await api.post(`/agendamentos/${agendamento.id}/realizar`)
      loadAgendamentos()
      if (selectedAgendamento?.id === agendamento.id) {
        const response = await api.get(`/agendamentos/${agendamento.id}`)
        setSelectedAgendamento(response.data.data)
      }
    } catch (error: any) {
      console.error('Erro ao realizar agendamento:', error)
      alert(error.response?.data?.message || 'Erro ao marcar como realizado')
    }
  }

  const handleFeedback = async () => {
    if (!selectedAgendamento) return

    try {
      await api.post(`/agendamentos/${selectedAgendamento.id}/feedback`, {
        feedback_corretor: feedbackData.feedback_corretor || undefined,
        feedback_lead: feedbackData.feedback_lead || undefined,
        nota_lead: feedbackData.nota_lead,
      })

      setShowFeedbackModal(false)
      setFeedbackData({ feedback_corretor: '', feedback_lead: '', nota_lead: 5 })
      loadAgendamentos()
    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error)
      alert(error.response?.data?.message || 'Erro ao enviar feedback')
    }
  }

  const resetForm = () => {
    setFormData({
      lead_id: '',
      imovel_id: '',
      corretor_id: '',
      data_visita: '',
      hora_visita: '',
      duracao_minutos: '60',
      tipo_visita: 'PRESENCIAL',
      observacoes: '',
    })
  }

  const openDetail = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento)
    setShowDetailModal(true)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateTime = (date: string) => {
    return `${formatDate(date)} ${formatTime(date)}`
  }

  const getEndereco = (endereco: any) => {
    if (!endereco) return 'Endereço não informado'
    if (typeof endereco === 'string') return endereco
    return endereco.logradouro || endereco.rua || 'Endereço não informado'
  }

  const isPassado = (dataVisita: string) => {
    return new Date(dataVisita) < new Date()
  }

  // Contadores por status
  const contadores = {
    total: agendamentos.length,
    pendentes: agendamentos.filter(a => a.status === 'PENDENTE').length,
    confirmados: agendamentos.filter(a => a.status === 'CONFIRMADO').length,
    realizados: agendamentos.filter(a => a.status === 'REALIZADO').length,
    cancelados: agendamentos.filter(a => a.status === 'CANCELADO').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-content">Agendamentos</h1>
          <p className="text-sm text-content-secondary font-medium">Gerencie visitas a imóveis</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
          <p className="text-xs text-content-secondary font-medium">Total</p>
          <p className="text-2xl font-bold text-content">{contadores.total}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
          <p className="text-xs text-yellow-600 font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-700">{contadores.pendentes}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
          <p className="text-xs text-blue-600 font-medium">Confirmados</p>
          <p className="text-2xl font-bold text-blue-700">{contadores.confirmados}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
          <p className="text-xs text-green-600 font-medium">Realizados</p>
          <p className="text-2xl font-bold text-green-700">{contadores.realizados}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
          <p className="text-xs text-red-600 font-medium">Cancelados</p>
          <p className="text-2xl font-bold text-red-700">{contadores.cancelados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light">
        <div className="flex flex-wrap gap-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>{config.icon} {config.label}</option>
            ))}
          </select>
          <select
            value={filtroCorretor}
            onChange={(e) => setFiltroCorretor(e.target.value)}
            className="px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os corretores</option>
            {corretores.map(c => (
              <option key={c.id} value={c.id}>{c.user.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {agendamentos.length === 0 ? (
        <div className="bg-surface rounded-lg p-12 shadow-sm border border-edge-light text-center">
          <div className="mb-4"><CalendarDays className="w-10 h-10 text-content-tertiary mx-auto" /></div>
          <h3 className="text-lg font-bold text-content mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-content-secondary mb-4">Crie o primeiro agendamento de visita</p>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            + Novo Agendamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map(agendamento => {
            const statusConfig = STATUS_CONFIG[agendamento.status] || STATUS_CONFIG.PENDENTE
            const tipoConfig = TIPO_VISITA_CONFIG[agendamento.tipo_visita] || TIPO_VISITA_CONFIG.PRESENCIAL
            const passado = isPassado(agendamento.data_visita)

            return (
              <div
                key={agendamento.id}
                onClick={() => openDetail(agendamento)}
                className="bg-surface rounded-lg p-4 shadow-sm border border-edge-light hover:border-brand/30 hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusConfig.color}`}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        {tipoConfig.icon} {tipoConfig.label}
                      </span>
                      {passado && agendamento.status === 'PENDENTE' && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600">
                          Atrasado
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-content truncate">
                      {agendamento.lead.nome} - {agendamento.imovel.titulo}
                    </p>
                    <p className="text-sm text-content-secondary">
                      Corretor: {agendamento.corretor.user.nome}
                    </p>
                  </div>

                  {/* Data e hora */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-content">{formatDate(agendamento.data_visita)}</p>
                    <p className="text-sm font-medium text-green-600">{formatTime(agendamento.data_visita)}</p>
                    <p className="text-xs text-content-tertiary">{agendamento.duracao_minutos} min</p>
                  </div>

                  {/* Ações rápidas */}
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {agendamento.status === 'PENDENTE' && (
                      <>
                        <button
                          onClick={() => handleConfirmar(agendamento, 'CORRETOR')}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Confirmar pelo corretor"
                        >
                          Confirmar
                        </button>
                      </>
                    )}
                    {agendamento.status === 'CONFIRMADO' && (
                      <button
                        onClick={() => handleRealizar(agendamento)}
                        className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Realizado
                      </button>
                    )}
                    {agendamento.status === 'REALIZADO' && !agendamento.feedback_corretor && (
                      <button
                        onClick={() => {
                          setSelectedAgendamento(agendamento)
                          setShowFeedbackModal(true)
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal - Novo Agendamento */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Agendamento de Visita">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-content mb-1">Lead *</label>
            <select
              value={formData.lead_id}
              onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione o lead...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>{lead.nome} - {lead.telefone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-content mb-1">Imóvel *</label>
            <select
              value={formData.imovel_id}
              onChange={(e) => setFormData({ ...formData, imovel_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione o imóvel...</option>
              {imoveis.map(imovel => (
                <option key={imovel.id} value={imovel.id}>{imovel.codigo} - {imovel.titulo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-content mb-1">Corretor *</label>
            <select
              value={formData.corretor_id}
              onChange={(e) => setFormData({ ...formData, corretor_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione o corretor...</option>
              {corretores.map(c => (
                <option key={c.id} value={c.id}>{c.user.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content mb-1">Data *</label>
              <input
                type="date"
                value={formData.data_visita}
                onChange={(e) => setFormData({ ...formData, data_visita: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-content mb-1">Horário *</label>
              <input
                type="time"
                value={formData.hora_visita}
                onChange={(e) => setFormData({ ...formData, hora_visita: e.target.value })}
                required
                className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content mb-1">Tipo de Visita</label>
              <select
                value={formData.tipo_visita}
                onChange={(e) => setFormData({ ...formData, tipo_visita: e.target.value as any })}
                className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {Object.entries(TIPO_VISITA_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>{config.icon} {config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-content mb-1">Duração (min)</label>
              <select
                value={formData.duracao_minutos}
                onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h 30min</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-content mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              placeholder="Observações sobre a visita..."
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface placeholder:text-content-tertiary focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 border border-edge text-content rounded-lg font-bold hover:bg-surface-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Agendar Visita
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal - Detalhe do Agendamento */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedAgendamento(null) }}
        title="Detalhes do Agendamento"
      >
        {selectedAgendamento && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${STATUS_CONFIG[selectedAgendamento.status]?.color}`}>
                {STATUS_CONFIG[selectedAgendamento.status]?.icon} {STATUS_CONFIG[selectedAgendamento.status]?.label}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-50 text-purple-700">
                {TIPO_VISITA_CONFIG[selectedAgendamento.tipo_visita]?.icon} {TIPO_VISITA_CONFIG[selectedAgendamento.tipo_visita]?.label}
              </span>
            </div>

            {/* Data e Hora */}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Data da Visita</p>
              <p className="text-xl font-bold text-green-800">
                {formatDateTime(selectedAgendamento.data_visita)}
              </p>
              <p className="text-sm text-green-600">{selectedAgendamento.duracao_minutos} minutos</p>
            </div>

            {/* Lead */}
            <div className="bg-surface-secondary rounded-lg p-4">
              <p className="text-xs text-content-secondary font-bold uppercase mb-1">Lead</p>
              <p className="font-bold text-content">{selectedAgendamento.lead.nome}</p>
              <p className="text-sm text-content-secondary">{selectedAgendamento.lead.telefone}</p>
              {selectedAgendamento.lead.email && (
                <p className="text-sm text-content-secondary">{selectedAgendamento.lead.email}</p>
              )}
            </div>

            {/* Imóvel */}
            <div className="bg-surface-secondary rounded-lg p-4">
              <p className="text-xs text-content-secondary font-bold uppercase mb-1">Imóvel</p>
              <p className="font-bold text-content">{selectedAgendamento.imovel.titulo}</p>
              <p className="text-sm text-content-secondary">Código: {selectedAgendamento.imovel.codigo}</p>
              <p className="text-sm text-content-secondary">{getEndereco(selectedAgendamento.imovel.endereco)}</p>
            </div>

            {/* Corretor */}
            <div className="bg-surface-secondary rounded-lg p-4">
              <p className="text-xs text-content-secondary font-bold uppercase mb-1">Corretor</p>
              <p className="font-bold text-content">{selectedAgendamento.corretor.user.nome}</p>
              <p className="text-sm text-content-secondary">{selectedAgendamento.corretor.user.email}</p>
            </div>

            {/* Confirmações */}
            {selectedAgendamento.status === 'PENDENTE' && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-yellow-600 font-bold uppercase mb-2">Confirmações</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    {selectedAgendamento.confirmado_lead ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                    <span className="text-sm text-content">Lead</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgendamento.confirmado_corretor ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                    <span className="text-sm text-content">Corretor</span>
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            {selectedAgendamento.observacoes && (
              <div className="bg-surface-secondary rounded-lg p-4">
                <p className="text-xs text-content-secondary font-bold uppercase mb-1">Observações</p>
                <p className="text-sm text-content">{selectedAgendamento.observacoes}</p>
              </div>
            )}

            {/* Feedback */}
            {selectedAgendamento.feedback_corretor && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Feedback do Corretor</p>
                <p className="text-sm text-content">{selectedAgendamento.feedback_corretor}</p>
              </div>
            )}
            {selectedAgendamento.nota_lead && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Nota do Lead</p>
                <p className="text-lg font-bold text-purple-700">
                  {'★'.repeat(selectedAgendamento.nota_lead)}{'☆'.repeat(5 - selectedAgendamento.nota_lead)}
                  <span className="text-sm ml-2">{selectedAgendamento.nota_lead}/5</span>
                </p>
              </div>
            )}

            {/* Motivo Cancelamento */}
            {selectedAgendamento.motivo_cancelamento && (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-red-600 font-bold uppercase mb-1">Motivo do Cancelamento</p>
                <p className="text-sm text-content">{selectedAgendamento.motivo_cancelamento}</p>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 pt-2">
              {selectedAgendamento.status === 'PENDENTE' && (
                <>
                  <button
                    onClick={() => handleConfirmar(selectedAgendamento, 'LEAD')}
                    className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 transition-colors text-sm"
                  >
                    Confirmar (Lead)
                  </button>
                  <button
                    onClick={() => handleConfirmar(selectedAgendamento, 'CORRETOR')}
                    className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 transition-colors text-sm"
                  >
                    Confirmar (Corretor)
                  </button>
                  <button
                    onClick={() => { setShowCancelarModal(true) }}
                    className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {selectedAgendamento.status === 'CONFIRMADO' && (
                <>
                  <button
                    onClick={() => handleRealizar(selectedAgendamento)}
                    className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-colors text-sm"
                  >
                    Marcar como Realizado
                  </button>
                  <button
                    onClick={() => { setShowCancelarModal(true) }}
                    className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {selectedAgendamento.status === 'REALIZADO' && !selectedAgendamento.feedback_corretor && (
                <button
                  onClick={() => { setShowFeedbackModal(true) }}
                  className="flex-1 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors text-sm"
                >
                  Adicionar Feedback
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal - Cancelar Agendamento */}
      <Modal isOpen={showCancelarModal} onClose={() => { setShowCancelarModal(false); setMotivoCancelamento('') }} title="Cancelar Agendamento">
        <div className="space-y-4">
          <p className="text-sm text-content-secondary">
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
          </p>
          <div>
            <label className="block text-sm font-bold text-content mb-1">Motivo do cancelamento *</label>
            <textarea
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              rows={3}
              required
              placeholder="Descreva o motivo do cancelamento..."
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface placeholder:text-content-tertiary focus:ring-2 focus:ring-red-300 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCancelarModal(false); setMotivoCancelamento('') }}
              className="flex-1 px-4 py-2.5 border border-edge text-content rounded-lg font-bold hover:bg-surface-secondary transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleCancelar}
              disabled={!motivoCancelamento}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Cancelamento
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal - Feedback */}
      <Modal isOpen={showFeedbackModal} onClose={() => { setShowFeedbackModal(false); setFeedbackData({ feedback_corretor: '', feedback_lead: '', nota_lead: 5 }) }} title="Feedback da Visita">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-content mb-1">Nota do Lead (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(nota => (
                <button
                  key={nota}
                  type="button"
                  onClick={() => setFeedbackData({ ...feedbackData, nota_lead: nota })}
                  className={`text-2xl transition-colors ${nota <= feedbackData.nota_lead ? 'text-yellow-400' : 'text-content-tertiary'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-content mb-1">Feedback do Corretor</label>
            <textarea
              value={feedbackData.feedback_corretor}
              onChange={(e) => setFeedbackData({ ...feedbackData, feedback_corretor: e.target.value })}
              rows={3}
              placeholder="Como foi a visita? O lead demonstrou interesse?"
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface placeholder:text-content-tertiary focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-content mb-1">Feedback do Lead</label>
            <textarea
              value={feedbackData.feedback_lead}
              onChange={(e) => setFeedbackData({ ...feedbackData, feedback_lead: e.target.value })}
              rows={3}
              placeholder="O que o lead achou do imóvel?"
              className="w-full px-3 py-2 border border-edge rounded-lg text-sm text-content bg-surface placeholder:text-content-tertiary focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowFeedbackModal(false); setFeedbackData({ feedback_corretor: '', feedback_lead: '', nota_lead: 5 }) }}
              className="flex-1 px-4 py-2.5 border border-edge text-content rounded-lg font-bold hover:bg-surface-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleFeedback}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Enviar Feedback
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
