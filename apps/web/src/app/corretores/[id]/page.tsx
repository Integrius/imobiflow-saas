'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCorretor, useCorretorStats } from '@/hooks/use-corretores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Phone,
  Award,
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
} from 'lucide-react'

export default function CorretorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: corretor, isLoading: loadingCorretor } = useCorretor(id)
  const { data: stats, isLoading: loadingStats } = useCorretorStats(id)

  if (loadingCorretor) {
    return <div className="p-6">Carregando...</div>
  }

  if (!corretor) {
    return (
      <div className="p-6">
        <p>Corretor não encontrado</p>
        <Button onClick={() => router.push('/corretores')} className="mt-4">
          Voltar
        </Button>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (score: number) => {
    const stars = Math.round((score / 100) * 5)
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/corretores')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Corretor</h1>
          <p className="text-gray-600 mt-1">Informações e estatísticas de desempenho</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={corretor.foto_url || undefined} alt={corretor.user?.nome} />
                <AvatarFallback className="text-lg">
                  {corretor.user?.nome ? getInitials(corretor.user.nome) : 'CR'}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-bold">{corretor.user?.nome || 'Nome não disponível'}</h3>
              <p className="text-sm text-gray-600">{corretor.user?.email || 'Email não disponível'}</p>
              <div className="mt-2">
                {corretor.user?.ativo ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Ativo
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    Inativo
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Award className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">CRECI:</span>
                <span className="font-medium">{corretor.creci}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Telefone:</span>
                <span className="font-medium">{corretor.telefone}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Performance:</span>
                <span className="font-medium">{corretor.performance_score}%</span>
              </div>

              <div className="pt-2">
                {renderStars(corretor.performance_score || 0)}
              </div>
            </div>

            {corretor.especializacoes && corretor.especializacoes.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-sm font-semibold">Especializações</h4>
                <div className="flex flex-wrap gap-2">
                  {corretor.especializacoes.map((espec) => (
                    <span
                      key={espec}
                      className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800"
                    >
                      {espec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
                <Target className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {corretor.meta_mensal
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(corretor.meta_mensal)
                    : 'Não definida'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Meta Anual</CardTitle>
                <Calendar className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {corretor.meta_anual
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(corretor.meta_anual)
                    : 'Não definida'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Comissão Padrão</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{corretor.comissao_padrao}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{corretor.performance_score || 0}%</div>
              </CardContent>
            </Card>
          </div>

          {!loadingStats && stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Negociações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalNegociacoes || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Em Andamento</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.negociacoesEmAndamento || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Fechadas</p>
                      <p className="text-2xl font-bold text-green-600">{stats.negociacoesFechadas || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Taxa de Conversão</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.taxaConversao ? `${stats.taxaConversao.toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total de Leads</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalLeads || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Leads Ativos</p>
                      <p className="text-2xl font-bold text-green-600">{stats.leadsAtivos || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Leads Convertidos</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.leadsConvertidos || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {stats.valorTotalVendas && stats.valorTotalVendas > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Total em Vendas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                          }).format(stats.valorTotalVendas)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Comissões Estimadas</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                          }).format((stats.valorTotalVendas * corretor.comissao_padrao) / 100)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {loadingStats && (
            <Card>
              <CardContent className="py-8 text-center">Carregando estatísticas...</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
