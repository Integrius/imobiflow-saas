'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Package, CheckCircle2 } from 'lucide-react';

interface ExportStatus {
  canExport: boolean;
  hasExported: boolean;
  showButton: boolean;
  showMessage: boolean;
}

export default function DataExportButton() {
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    checkExportStatus();
  }, []);

  const checkExportStatus = async () => {
    try {
      const response = await api.get('/export/can-export');
      setExportStatus(response.data);
    } catch (error) {
      console.error('Erro ao verificar status de exportação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!confirm('Deseja exportar todos os seus dados? Os arquivos serão enviados por email em formato CSV.')) {
      return;
    }

    setIsExporting(true);

    try {
      const response = await api.post('/export/data');

      alert(`Dados exportados com sucesso!\n\n${response.data.stats.leads} leads, ${response.data.stats.imoveis} imóveis, ${response.data.stats.proprietarios} proprietários, ${response.data.stats.negociacoes} negociações e ${response.data.stats.agendamentos} agendamentos foram enviados para seu email.`);

      // Atualizar status
      await checkExportStatus();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao exportar dados';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !exportStatus) {
    return null;
  }

  // Mostrar botão "Recuperar Dados" (últimos 5 dias, não exportado)
  if (exportStatus.showButton) {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
          ${isExporting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#8FD14F] to-[#6E9B3B] text-white hover:shadow-lg hover:scale-105'
          }
        `}
        title="Exportar todos os seus dados em CSV"
      >
        {isExporting ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Exportando...
          </>
        ) : (
          <>
            <Package className="w-4 h-4 inline mr-1" /> Recuperar Dados
          </>
        )}
      </button>
    );
  }

  // Mostrar aviso de dados já exportados (últimos 5 dias, já exportado)
  if (exportStatus.showMessage) {
    return (
      <div className="bg-gradient-to-r from-[#D4EDDA] to-[#C3E6CB] border-2 border-[#28A745] rounded-lg px-4 py-2">
        <p className="text-sm font-semibold text-[#155724] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Dados exportados e enviados por email
        </p>
      </div>
    );
  }

  return null;
}
