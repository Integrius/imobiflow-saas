'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Tarefa {
  id: string
  titulo: string
  tipo: string
  prioridade: string
  status: string
  data_vencimento?: string
  lead?: { id: string; nome: string }
}

const TIPOS: Record<string, string> = {
  FOLLOW_UP: '📋',
  LIGACAO: '📞',
  EMAIL: '📧',
  WHATSAPP: '💬',
  VISITA: '🏠',
  DOCUMENTO: '📄',
  REUNIAO: '👥',
  OUTRO: '📌'
}

const PRIORIDADES: Record<string, { label: string; color: string }> = {
  BAIXA: { label: 'Baixa', color: 'bg-gray-100 text-gray-600' },
  MEDIA: { label: 'Média', color: 'bg-blue-100 text-blue-600' },
  ALTA: { label: 'Alta', color: 'bg-orange-100 text-orange-600' },
  URGENTE: { label: 'Urgente', color: 'bg-red-100 text-red-600' }
}

export default function TarefasWidget() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pendentes: 0, atrasadas: 0 })

  useEffect(() => {
    loadTarefas()
  }, [])

  const loadTarefas = async () => {
    try {
      const [tarefasRes, statsRes] = await Promise.all([
        api.get('/tarefas/pendentes'),
        api.get('/tarefas/stats')
      ])

      setTarefas(tarefasRes.data.data || [])
      setStats({
        pendentes: statsRes.data.data?.pendentes || 0,
        atrasadas: statsRes.data.data?.atrasadas || 0
      })
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConcluir = async (tarefaId: string) => {
    try {
      await api.post(`/tarefas/${tarefaId}/concluir`, {})
      loadTarefas()
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error)
    }
  }

  const isVencida = (tarefa: Tarefa) => {
    if (!tarefa.data_vencimento) return false
    return new Date(tarefa.data_vencimento) < new Date()
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    if (d < hoje) {
      return 'Atrasada'
    } else if (d.toDateString() === hoje.toDateString()) {
      return 'Hoje'
    } else if (d.toDateString() === amanha.toDateString()) {
      return 'Amanhã'
    }

    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8FD14F]/10 to-[#7AB93F]/10 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h3 className="font-semibold text-[#2C2C2C]">Minhas Tarefas</h3>
          </div>
          <div className="flex items-center gap-2">
            {stats.atrasadas > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                {stats.atrasadas} atrasada{stats.atrasadas > 1 ? 's' : ''}
              </span>
            )}
            <span className="px-2 py-1 bg-[#8FD14F]/20 text-[#2C2C2C] text-xs font-medium rounded-full">
              {stats.pendentes} pendente{stats.pendentes > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="p-4">
        {tarefas.length === 0 ? (
          <div className="text-center py-6 text-[#8B7F76]">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm">Nenhuma tarefa pendente</p>
            <Link
              href="/dashboard/tarefas"
              className="text-[#8FD14F] text-sm hover:underline mt-2 inline-block"
            >
              Criar nova tarefa
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tarefas.slice(0, 5).map((tarefa) => (
              <div
                key={tarefa.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isVencida(tarefa)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">{TIPOS[tarefa.tipo] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C2C2C] truncate">
                      {tarefa.titulo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {tarefa.lead && (
                        <span className="text-xs text-[#8B7F76]">
                          👤 {tarefa.lead.nome}
                        </span>
                      )}
                      {tarefa.data_vencimento && (
                        <span className={`text-xs ${isVencida(tarefa) ? 'text-red-500 font-medium' : 'text-[#8B7F76]'}`}>
                          📅 {formatDate(tarefa.data_vencimento)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORIDADES[tarefa.prioridade]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {PRIORIDADES[tarefa.prioridade]?.label || tarefa.prioridade}
                  </span>
                  <button
                    onClick={() => handleConcluir(tarefa.id)}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Concluir"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {tarefas.length > 0 && (
        <div className="px-4 pb-4">
          <Link
            href="/dashboard/tarefas"
            className="block w-full py-2 text-center text-sm text-[#8FD14F] hover:bg-[#8FD14F]/10 rounded-lg transition-colors font-medium"
          >
            Ver todas as tarefas →
          </Link>
        </div>
      )}
    </div>
  )
}
