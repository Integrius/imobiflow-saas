'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface ReportDownloadButtonProps {
  reportType: 'leads' | 'corretor' | 'tenant'
  params?: Record<string, string | number>
  label?: string
  className?: string
}

export default function ReportDownloadButton({
  reportType,
  params = {},
  label,
  className = ''
}: ReportDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const getDefaultLabel = () => {
    switch (reportType) {
      case 'leads':
        return 'Relatório de Leads'
      case 'corretor':
        return 'Relatório de Desempenho'
      case 'tenant':
        return 'Relatório Mensal'
      default:
        return 'Baixar Relatório'
    }
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      // Construir query string
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value))
        }
      })

      const queryString = queryParams.toString()
      const url = `/reports/${reportType}${queryString ? `?${queryString}` : ''}`

      // Fazer requisição com responseType blob
      const response = await api.get(url, {
        responseType: 'blob'
      })

      // Criar URL do blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl

      // Nome do arquivo baseado no tipo
      const now = new Date()
      const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
      let filename = ''

      switch (reportType) {
        case 'leads':
          filename = `relatorio-leads-${dateStr}.pdf`
          break
        case 'corretor':
          filename = `relatorio-desempenho-${params.mes || now.getMonth() + 1}-${params.ano || now.getFullYear()}.pdf`
          break
        case 'tenant':
          filename = `relatorio-mensal-${params.mes || now.getMonth() + 1}-${params.ano || now.getFullYear()}.pdf`
          break
        default:
          filename = `relatorio-${dateStr}.pdf`
      }

      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error: any) {
      console.error('Erro ao baixar relatório:', error)
      alert(error.response?.data?.error || 'Erro ao gerar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#064E3B] to-[#065F46] text-white rounded-lg hover:from-[#065F46] hover:to-[#064E3B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Gerando PDF...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{label || getDefaultLabel()}</span>
        </>
      )}
    </button>
  )
}
