'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface FieldInfo {
  name: string
  label: string
  required: boolean
  description: string
}

interface EnumsInfo {
  origem: string[]
  temperatura: string[]
  tipo_negocio: string[]
  tipo_imovel: string[]
}

interface AnalysisResult {
  headers: string[]
  mappedFields: Record<string, string>
  sampleRows: Record<string, string>[]
  totalRows: number
}

interface ImportResult {
  total: number
  sucesso: number
  erros: number
  duplicados: number
  detalhes: Array<{
    linha: number
    status: 'sucesso' | 'erro' | 'duplicado'
    nome?: string
    telefone?: string
    erro?: string
  }>
}

interface Corretor {
  id: string
  user: {
    nome: string
    email: string
  }
}

export default function ImportarLeadsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'result'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [delimiter, setDelimiter] = useState(';')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [availableFields, setAvailableFields] = useState<FieldInfo[]>([])
  const [enums, setEnums] = useState<EnumsInfo | null>(null)
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Opções de importação
  const [options, setOptions] = useState({
    defaultOrigem: 'OUTRO',
    defaultTemperatura: 'FRIO',
    defaultCorretorId: '',
    skipDuplicates: true,
    updateExisting: false
  })

  // Carregar campos disponíveis e corretores
  useEffect(() => {
    loadFields()
    loadCorretores()
  }, [])

  const loadFields = async () => {
    try {
      const response = await api.get('/leads/import/fields')
      if (response.data.success) {
        setAvailableFields(response.data.data.fields)
        setEnums(response.data.data.enums)
      }
    } catch (err) {
      console.error('Erro ao carregar campos:', err)
    }
  }

  const loadCorretores = async () => {
    try {
      const response = await api.get('/corretores')
      setCorretores(response.data.data || [])
    } catch (err) {
      console.error('Erro ao carregar corretores:', err)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Apenas arquivos CSV são permitidos')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(`/leads/import/analyze?delimiter=${encodeURIComponent(delimiter)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setAnalysis(response.data.data)
        setFieldMapping(response.data.data.mappedFields)
        setStep('mapping')
      } else {
        setError(response.data.message || 'Erro ao analisar arquivo')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao analisar arquivo CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setStep('importing')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('delimiter', delimiter)
      formData.append('fieldMapping', JSON.stringify(fieldMapping))
      formData.append('defaultOrigem', options.defaultOrigem)
      formData.append('defaultTemperatura', options.defaultTemperatura)
      if (options.defaultCorretorId) {
        formData.append('defaultCorretorId', options.defaultCorretorId)
      }
      formData.append('skipDuplicates', String(options.skipDuplicates))
      formData.append('updateExisting', String(options.updateExisting))

      const response = await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setImportResult(response.data.data)
        setStep('result')
      } else {
        setError(response.data.message || 'Erro na importação')
        setStep('mapping')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao importar leads')
      setStep('mapping')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/leads/import/template', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'template_leads.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Erro ao baixar template')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setAnalysis(null)
    setFieldMapping({})
    setImportResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateFieldMapping = (systemField: string, csvHeader: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [systemField]: csvHeader
    }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2C2C]">Importar Leads</h1>
          <p className="text-[#8B7F76] text-sm mt-1">
            Importe leads em massa a partir de um arquivo CSV
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 border border-[#A97E6F] text-[#A97E6F] rounded-lg hover:bg-[#A97E6F]/10 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar Template
          </button>
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          {['Upload', 'Mapeamento', 'Importando', 'Resultado'].map((label, index) => {
            const stepIndex = ['upload', 'mapping', 'importing', 'result'].indexOf(step)
            const isActive = index === stepIndex
            const isCompleted = index < stepIndex
            return (
              <div key={label} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-[#8FD14F] text-white' : isActive ? 'bg-[#A97E6F] text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'font-medium text-[#2C2C2C]' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${index < stepIndex ? 'bg-[#8FD14F]' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Selecione o arquivo CSV</h2>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#A97E6F] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? (
                <div>
                  <p className="text-[#2C2C2C] font-medium">{file.name}</p>
                  <p className="text-sm text-[#8B7F76]">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[#2C2C2C] font-medium">Clique para selecionar ou arraste um arquivo</p>
                  <p className="text-sm text-[#8B7F76] mt-1">Apenas arquivos CSV (máximo 5MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Delimiter Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Delimitador do CSV
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A97E6F]/30 focus:border-[#A97E6F]"
            >
              <option value=";">Ponto e vírgula (;)</option>
              <option value=",">Vírgula (,)</option>
              <option value="\t">Tab</option>
            </select>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="px-6 py-2 bg-gradient-to-r from-[#A97E6F] to-[#8B6F5C] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analisando...
                </>
              ) : (
                <>
                  Analisar Arquivo
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 'mapping' && analysis && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Resumo da Análise</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-[#2C2C2C]">{analysis.totalRows}</p>
                <p className="text-sm text-[#8B7F76]">Linhas encontradas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-[#2C2C2C]">{analysis.headers.length}</p>
                <p className="text-sm text-[#8B7F76]">Colunas detectadas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-[#8FD14F]">{Object.keys(analysis.mappedFields).length}</p>
                <p className="text-sm text-[#8B7F76]">Campos mapeados automaticamente</p>
              </div>
            </div>
          </div>

          {/* Field Mapping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Mapeamento de Campos</h2>
            <p className="text-sm text-[#8B7F76] mb-4">
              Associe as colunas do seu CSV aos campos do sistema. Campos com * são obrigatórios.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {availableFields.map((field) => (
                <div key={field.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#2C2C2C]">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <p className="text-xs text-[#8B7F76]">{field.description}</p>
                  </div>
                  <select
                    value={fieldMapping[field.name] || ''}
                    onChange={(e) => updateFieldMapping(field.name, e.target.value)}
                    className={`w-48 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A97E6F]/30 focus:border-[#A97E6F] ${
                      field.required && !fieldMapping[field.name] ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">-- Não mapear --</option>
                    {analysis.headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Data Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Preview dos Dados (5 primeiras linhas)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {analysis.headers.map((header) => (
                      <th key={header} className="px-4 py-2 text-left font-medium text-[#2C2C2C]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.sampleRows.map((row, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      {analysis.headers.map((header) => (
                        <td key={header} className="px-4 py-2 text-[#8B7F76]">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Opções de Importação</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Default Origem */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  Origem padrão
                </label>
                <select
                  value={options.defaultOrigem}
                  onChange={(e) => setOptions(prev => ({ ...prev, defaultOrigem: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A97E6F]/30 focus:border-[#A97E6F]"
                >
                  {enums?.origem.map((origem) => (
                    <option key={origem} value={origem}>{origem}</option>
                  ))}
                </select>
                <p className="text-xs text-[#8B7F76] mt-1">Usado quando não especificado no CSV</p>
              </div>

              {/* Default Temperatura */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  Temperatura padrão
                </label>
                <select
                  value={options.defaultTemperatura}
                  onChange={(e) => setOptions(prev => ({ ...prev, defaultTemperatura: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A97E6F]/30 focus:border-[#A97E6F]"
                >
                  {enums?.temperatura.map((temp) => (
                    <option key={temp} value={temp}>{temp}</option>
                  ))}
                </select>
                <p className="text-xs text-[#8B7F76] mt-1">Usado quando não especificado no CSV</p>
              </div>

              {/* Default Corretor */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  Corretor padrão
                </label>
                <select
                  value={options.defaultCorretorId}
                  onChange={(e) => setOptions(prev => ({ ...prev, defaultCorretorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A97E6F]/30 focus:border-[#A97E6F]"
                >
                  <option value="">-- Não atribuir --</option>
                  {corretores.map((corretor) => (
                    <option key={corretor.id} value={corretor.id}>{corretor.user.nome}</option>
                  ))}
                </select>
                <p className="text-xs text-[#8B7F76] mt-1">Atribuir leads sem corretor especificado</p>
              </div>

              {/* Duplicate Handling */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.skipDuplicates}
                    onChange={(e) => setOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                    className="w-4 h-4 text-[#A97E6F] focus:ring-[#A97E6F] border-gray-300 rounded"
                  />
                  <span className="text-sm text-[#2C2C2C]">Ignorar leads duplicados</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.updateExisting}
                    onChange={(e) => setOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                    className="w-4 h-4 text-[#A97E6F] focus:ring-[#A97E6F] border-gray-300 rounded"
                  />
                  <span className="text-sm text-[#2C2C2C]">Atualizar leads existentes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !fieldMapping.nome || !fieldMapping.telefone}
              className="px-6 py-2 bg-gradient-to-r from-[#8FD14F] to-[#6E9B3B] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importando...
                </>
              ) : (
                <>
                  Importar {analysis.totalRows} Leads
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-16 w-16 text-[#A97E6F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Importando leads...</h2>
            <p className="text-[#8B7F76]">Aguarde enquanto processamos o arquivo</p>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 'result' && importResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-3xl font-bold text-[#2C2C2C]">{importResult.total}</p>
              <p className="text-sm text-[#8B7F76]">Total de linhas</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-[#8FD14F]/30 p-6">
              <p className="text-3xl font-bold text-[#8FD14F]">{importResult.sucesso}</p>
              <p className="text-sm text-[#8B7F76]">Importados com sucesso</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
              <p className="text-3xl font-bold text-yellow-600">{importResult.duplicados}</p>
              <p className="text-sm text-[#8B7F76]">Duplicados ignorados</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <p className="text-3xl font-bold text-red-500">{importResult.erros}</p>
              <p className="text-sm text-[#8B7F76]">Erros</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Detalhes da Importação</h2>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-[#2C2C2C]">Linha</th>
                    <th className="px-4 py-2 text-left font-medium text-[#2C2C2C]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[#2C2C2C]">Nome</th>
                    <th className="px-4 py-2 text-left font-medium text-[#2C2C2C]">Telefone</th>
                    <th className="px-4 py-2 text-left font-medium text-[#2C2C2C]">Mensagem</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.detalhes.map((detalhe, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-[#8B7F76]">{detalhe.linha}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          detalhe.status === 'sucesso' ? 'bg-green-100 text-green-700' :
                          detalhe.status === 'duplicado' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {detalhe.status === 'sucesso' ? 'Sucesso' :
                           detalhe.status === 'duplicado' ? 'Duplicado' : 'Erro'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[#2C2C2C]">{detalhe.nome || '-'}</td>
                      <td className="px-4 py-2 text-[#8B7F76]">{detalhe.telefone || '-'}</td>
                      <td className="px-4 py-2 text-[#8B7F76]">{detalhe.erro || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Nova Importação
            </button>
            <button
              onClick={() => router.push('/dashboard/leads')}
              className="px-6 py-2 bg-gradient-to-r from-[#8FD14F] to-[#6E9B3B] text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
            >
              Ver Leads
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
