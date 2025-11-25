'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useImovel } from '@/hooks/use-imoveis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Bed, Bath, Car, Maximize, Home } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ImovelDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: imovel, isLoading, error } = useImovel(resolvedParams.id)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const tipoLabels: Record<string, string> = {
    APARTAMENTO: 'Apartamento',
    CASA: 'Casa',
    TERRENO: 'Terreno',
    COMERCIAL: 'Comercial',
    RURAL: 'Rural',
    CHACARA: 'Chácara',
    SOBRADO: 'Sobrado',
    COBERTURA: 'Cobertura',
    LOFT: 'Loft',
    KITNET: 'Kitnet',
  }

  const categoriaLabels: Record<string, string> = {
    VENDA: 'Venda',
    LOCACAO: 'Locação',
    TEMPORADA: 'Temporada',
  }

  const statusLabels: Record<string, string> = {
    DISPONIVEL: 'Disponível',
    RESERVADO: 'Reservado',
    VENDIDO: 'Vendido',
    ALUGADO: 'Alugado',
    INATIVO: 'Inativo',
    MANUTENCAO: 'Manutenção',
  }

  const statusColors: Record<string, string> = {
    DISPONIVEL: 'bg-green-100 text-green-800',
    RESERVADO: 'bg-yellow-100 text-yellow-800',
    VENDIDO: 'bg-blue-100 text-blue-800',
    ALUGADO: 'bg-blue-100 text-blue-800',
    INATIVO: 'bg-gray-100 text-gray-800',
    MANUTENCAO: 'bg-orange-100 text-orange-800',
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando detalhes do imóvel...</div>
      </div>
    )
  }

  if (error || !imovel) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Erro ao carregar imóvel.</p>
          <Button onClick={() => router.push('/imoveis')} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/imoveis')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{imovel.titulo}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[imovel.status]}`}>
                {statusLabels[imovel.status]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {imovel.endereco.logradouro && `${imovel.endereco.logradouro}, `}
                {imovel.endereco.numero}
                {imovel.endereco.complemento && ` - ${imovel.endereco.complemento}`}
                {imovel.endereco.bairro && ` - ${imovel.endereco.bairro}`}
                {imovel.endereco.cidade && `, ${imovel.endereco.cidade}`}
                {imovel.endereco.estado && `/${imovel.endereco.estado}`}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Código: {imovel.codigo}</span>
              <span>•</span>
              <span>{tipoLabels[imovel.tipo]}</span>
              <span>•</span>
              <span>{categoriaLabels[imovel.categoria]}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(imovel.preco)}</div>
            {(imovel.condominio || imovel.iptu) && (
              <div className="text-sm text-gray-600 mt-1">
                {imovel.condominio && <div>Condomínio: {formatCurrency(imovel.condominio)}</div>}
                {imovel.iptu && <div>IPTU: {formatCurrency(imovel.iptu)}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{imovel.descricao}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {imovel.caracteristicas.quartos !== undefined && (
                <div className="flex items-center gap-3">
                  <Bed className="h-5 w-5 text-gray-600" />
                  <span>{imovel.caracteristicas.quartos} {imovel.caracteristicas.quartos === 1 ? 'Quarto' : 'Quartos'}</span>
                </div>
              )}
              {imovel.caracteristicas.suites !== undefined && imovel.caracteristicas.suites > 0 && (
                <div className="flex items-center gap-3">
                  <Bed className="h-5 w-5 text-gray-600" />
                  <span>{imovel.caracteristicas.suites} {imovel.caracteristicas.suites === 1 ? 'Suíte' : 'Suítes'}</span>
                </div>
              )}
              {imovel.caracteristicas.banheiros !== undefined && (
                <div className="flex items-center gap-3">
                  <Bath className="h-5 w-5 text-gray-600" />
                  <span>{imovel.caracteristicas.banheiros} {imovel.caracteristicas.banheiros === 1 ? 'Banheiro' : 'Banheiros'}</span>
                </div>
              )}
              {imovel.caracteristicas.vagas !== undefined && (
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-gray-600" />
                  <span>{imovel.caracteristicas.vagas} {imovel.caracteristicas.vagas === 1 ? 'Vaga' : 'Vagas'}</span>
                </div>
              )}
              {imovel.caracteristicas.area_total !== undefined && (
                <div className="flex items-center gap-3">
                  <Maximize className="h-5 w-5 text-gray-600" />
                  <span>{imovel.caracteristicas.area_total} m² (Área Total)</span>
                </div>
              )}
              {imovel.caracteristicas.area_construida !== undefined && (
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span>{imovel.caracteristicas.area_construida} m² (Construída)</span>
                </div>
              )}
              {imovel.caracteristicas.mobiliado && (
                <div className="flex items-center gap-3">
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">Mobiliado</span>
                </div>
              )}
              {imovel.caracteristicas.aceita_pets && (
                <div className="flex items-center gap-3">
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">Aceita Pets</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {imovel.proprietario && (
          <Card>
            <CardHeader>
              <CardTitle>Proprietário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{imovel.proprietario.nome}</p>
            </CardContent>
          </Card>
        )}

        {imovel.diferenciais && imovel.diferenciais.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Diferenciais</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {imovel.diferenciais.map((diferencial, index) => (
                  <li key={index}>{diferencial}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
