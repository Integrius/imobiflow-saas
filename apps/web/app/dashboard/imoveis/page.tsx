'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImoveis() {
      try {
        const response = await api.get('/imoveis');
        setImoveis(response.data);
      } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
      } finally {
        setLoading(false);
      }
    }
    loadImoveis();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Imóveis</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Novo Imóvel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imoveis.length === 0 ? (
          <div className="col-span-full bg-white shadow rounded-lg p-12 text-center text-gray-500">
            Nenhum imóvel cadastrado
          </div>
        ) : (
          imoveis.map((imovel: any) => (
            <div key={imovel.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Sem imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {imovel.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{imovel.endereco}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR')}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    imovel.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                    imovel.status === 'VENDIDO' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {imovel.status}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                    Editar
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
