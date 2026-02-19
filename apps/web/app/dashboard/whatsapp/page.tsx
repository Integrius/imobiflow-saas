'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Smartphone, Lock, Plug, Settings, Clock, MessageCircle, Link2, Save } from 'lucide-react'

interface WhatsAppConfig {
  id?: string
  twilio_account_sid?: string
  twilio_auth_token?: string
  twilio_phone_number?: string
  auto_response_enabled: boolean
  welcome_message?: string
  business_hours_start?: string
  business_hours_end?: string
  out_of_hours_message?: string
  auto_assign_corretor: boolean
  default_corretor_id?: string
  is_active: boolean
}

interface WhatsAppStats {
  total_messages: number
  received_messages: number
  sent_messages: number
  leads_from_whatsapp: number
  messages_today: number
  config_status: {
    is_active: boolean
    auto_response: boolean
    last_message: string | null
  }
}

interface Corretor {
  id: string
  user: {
    nome: string
  }
}

export default function WhatsAppConfigPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    auto_response_enabled: true,
    auto_assign_corretor: false,
    is_active: false
  })
  const [stats, setStats] = useState<WhatsAppStats | null>(null)
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar configuração
      const configRes = await api.get('/whatsapp/config')
      if (configRes.data.data) {
        setConfig(configRes.data.data)
      }

      // Carregar estatísticas
      const statsRes = await api.get('/whatsapp/stats')
      if (statsRes.data.data) {
        setStats(statsRes.data.data)
      }

      // Carregar corretores
      const corretoresRes = await api.get('/corretores')
      if (corretoresRes.data.data) {
        setCorretores(corretoresRes.data.data)
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      await api.put('/whatsapp/config', config)

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    try {
      setTesting(true)
      setMessage(null)

      const res = await api.post('/whatsapp/test')

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Conexão com Twilio OK!' })
      } else {
        setMessage({ type: 'error', text: res.data.error || 'Falha na conexão' })
      }
    } catch (error: any) {
      console.error('Erro ao testar:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao testar conexão' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-content-tertiary" />
          Configuração WhatsApp (Twilio)
        </h1>
        <p className="text-[#8B7F76] mt-2">
          Configure a integração com WhatsApp Business via Twilio para receber e enviar mensagens automaticamente.
        </p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-brand-light border border-brand text-brand'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface rounded-xl shadow-sm p-4 border border-edge-light">
            <div className="text-2xl font-bold text-[#8FD14F]">{stats.total_messages}</div>
            <div className="text-sm text-[#8B7F76]">Total de Mensagens</div>
          </div>
          <div className="bg-surface rounded-xl shadow-sm p-4 border border-edge-light">
            <div className="text-2xl font-bold text-blue-500">{stats.received_messages}</div>
            <div className="text-sm text-[#8B7F76]">Recebidas</div>
          </div>
          <div className="bg-surface rounded-xl shadow-sm p-4 border border-edge-light">
            <div className="text-2xl font-bold text-purple-500">{stats.sent_messages}</div>
            <div className="text-sm text-[#8B7F76]">Enviadas</div>
          </div>
          <div className="bg-surface rounded-xl shadow-sm p-4 border border-edge-light">
            <div className="text-2xl font-bold text-[#A97E6F]">{stats.leads_from_whatsapp}</div>
            <div className="text-sm text-[#8B7F76]">Leads via WhatsApp</div>
          </div>
        </div>
      )}

      {/* Formulário de Configuração */}
      <div className="bg-surface rounded-xl shadow-sm border border-edge-light overflow-hidden">
        {/* Credenciais Twilio */}
        <div className="p-6 border-b border-edge-light">
          <h2 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 inline mr-1" /> Credenciais Twilio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content mb-1">
                Account SID
              </label>
              <input
                type="text"
                value={config.twilio_account_sid || ''}
                onChange={(e) => setConfig({ ...config, twilio_account_sid: e.target.value })}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content mb-1">
                Auth Token
              </label>
              <input
                type="password"
                value={config.twilio_auth_token || ''}
                onChange={(e) => setConfig({ ...config, twilio_auth_token: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-content mb-1">
                Número WhatsApp Business
              </label>
              <input
                type="text"
                value={config.twilio_phone_number || ''}
                onChange={(e) => setConfig({ ...config, twilio_phone_number: e.target.value })}
                placeholder="+5511999999999"
                className="w-full px-4 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
              />
              <p className="text-xs text-[#8B7F76] mt-1">
                Número configurado no Twilio para WhatsApp Business
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleTest}
              disabled={testing || !config.twilio_account_sid || !config.twilio_auth_token}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {testing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Testando...
                </>
              ) : (
                <><Plug className="w-4 h-4 inline mr-1" /> Testar Conexão</>
              )}
            </button>
          </div>
        </div>

        {/* Configurações de Comportamento */}
        <div className="p-6 border-b border-edge-light">
          <h2 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 inline mr-1" /> Comportamento
          </h2>

          <div className="space-y-4">
            {/* Status Ativo */}
            <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
              <div>
                <div className="font-medium text-content">Integração Ativa</div>
                <div className="text-sm text-content-secondary">
                  Habilita o recebimento e processamento de mensagens
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.is_active}
                  onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8FD14F]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8FD14F]"></div>
              </label>
            </div>

            {/* Respostas Automáticas */}
            <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
              <div>
                <div className="font-medium text-content">Respostas Automáticas (Sofia)</div>
                <div className="text-sm text-content-secondary">
                  A IA Sofia responde automaticamente às mensagens
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.auto_response_enabled}
                  onChange={(e) => setConfig({ ...config, auto_response_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8FD14F]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8FD14F]"></div>
              </label>
            </div>

            {/* Atribuição Automática */}
            <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
              <div>
                <div className="font-medium text-content">Atribuir Corretor Automaticamente</div>
                <div className="text-sm text-content-secondary">
                  Atribui um corretor padrão para novos leads
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.auto_assign_corretor}
                  onChange={(e) => setConfig({ ...config, auto_assign_corretor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8FD14F]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8FD14F]"></div>
              </label>
            </div>

            {/* Corretor Padrão */}
            {config.auto_assign_corretor && (
              <div>
                <label className="block text-sm font-medium text-content mb-1">
                  Corretor Padrão
                </label>
                <select
                  value={config.default_corretor_id || ''}
                  onChange={(e) => setConfig({ ...config, default_corretor_id: e.target.value || undefined })}
                  className="w-full px-4 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
                >
                  <option value="">Selecione um corretor</option>
                  {corretores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Horário Comercial */}
        <div className="p-6 border-b border-edge-light">
          <h2 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 inline mr-1" /> Horário Comercial
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content mb-1">
                Início
              </label>
              <input
                type="time"
                value={config.business_hours_start || '08:00'}
                onChange={(e) => setConfig({ ...config, business_hours_start: e.target.value })}
                className="w-full px-4 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content mb-1">
                Fim
              </label>
              <input
                type="time"
                value={config.business_hours_end || '18:00'}
                onChange={(e) => setConfig({ ...config, business_hours_end: e.target.value })}
                className="w-full px-4 py-2 border border-edge rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Mensagem fora do horário comercial
            </label>
            <textarea
              value={config.out_of_hours_message || ''}
              onChange={(e) => setConfig({ ...config, out_of_hours_message: e.target.value })}
              placeholder="Olá! Estamos fora do horário comercial. Retornaremos seu contato assim que possível."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
            />
          </div>
        </div>

        {/* Mensagens Personalizadas */}
        <div className="p-6 border-b border-edge-light">
          <h2 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 inline mr-1" /> Mensagens Personalizadas
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Mensagem de boas-vindas (novos leads)
            </label>
            <textarea
              value={config.welcome_message || ''}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              placeholder="Olá! Sou a Sofia, assistente virtual. Como posso ajudar você a encontrar o imóvel ideal?"
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD14F]/50"
            />
            <p className="text-xs text-[#8B7F76] mt-1">
              Deixe em branco para usar a mensagem padrão da Sofia
            </p>
          </div>
        </div>

        {/* Webhook Info */}
        <div className="p-6 border-b border-edge-light bg-blue-50">
          <h2 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 inline mr-1" /> Configuração do Webhook no Twilio
          </h2>

          <p className="text-sm text-[#2C2C2C] mb-3">
            Configure os seguintes URLs no painel do Twilio:
          </p>

          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-[#8B7F76] mb-1">Webhook de Mensagens (POST):</div>
              <code className="text-sm text-blue-600 break-all">
                {typeof window !== 'undefined'
                  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/webhook`
                  : 'https://sua-api.com/api/v1/whatsapp/webhook'}
              </code>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-[#8B7F76] mb-1">Webhook de Status (POST):</div>
              <code className="text-sm text-blue-600 break-all">
                {typeof window !== 'undefined'
                  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/webhook/status`
                  : 'https://sua-api.com/api/v1/whatsapp/webhook/status'}
              </code>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-6 bg-surface-secondary flex justify-end gap-3">
          <button
            onClick={loadData}
            className="px-6 py-2 border border-edge text-content rounded-lg hover:bg-surface-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-[#8FD14F] to-[#6E9B3B] text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                Salvando...
              </>
            ) : (
              <><Save className="w-4 h-4 inline mr-1" /> Salvar Configurações</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
