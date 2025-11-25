'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCorretores } from '@/hooks/use-corretores'
import { CorretoresTable } from '@/components/corretores/corretores-table'
import { CorretorForm } from '@/components/corretores/corretor-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Corretor, CreateCorretorData, UpdateCorretorData } from '@/lib/api/corretores'
import { Plus, Search, Users, TrendingUp, Target } from 'lucide-react'

export default function CorretoresPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [especializacao, setEspecializacao] = useState<string>()
  const [ativo, setAtivo] = useState<boolean>()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null)

  const { corretores, total, isLoading, createCorretor, updateCorretor, deleteCorretor } = useCorretores({
    search: search || undefined,
    especializacao: especializacao || undefined,
    ativo: ativo,
  })

  const handleCreate = async (data: CreateCorretorData) => {
    await createCorretor.mutateAsync(data)
    setIsCreateOpen(false)
  }

  const handleUpdate = async (data: UpdateCorretorData) => {
    if (editingCorretor) {
      await updateCorretor.mutateAsync({ id: editingCorretor.id, data })
      setEditingCorretor(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este corretor?')) {
      await deleteCorretor.mutateAsync(id)
    }
  }

  const ativos = corretores.filter((c) => c.user?.ativo).length
  const inativos = corretores.filter((c) => !c.user?.ativo).length
  const performanceMedia = corretores.length > 0
    ? corretores.reduce((acc, c) => acc + (c.performance_score || 0), 0) / corretores.length
    : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Corretores</h1>
          <p className="text-gray-600 mt-1">Gerencie sua equipe de corretores</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Corretor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Corretores</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-gray-600 mt-1">
              {ativos} ativos, {inativos} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMedia.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Baseado em todos os corretores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
            <Target className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
              }).format(
                corretores.reduce((acc, c) => acc + (c.meta_mensal || 0), 0)
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">Soma das metas mensais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou CRECI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={especializacao || 'all'} onValueChange={(v) => setEspecializacao(v === 'all' ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas especializações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas especializações</SelectItem>
                <SelectItem value="Apartamentos">Apartamentos</SelectItem>
                <SelectItem value="Casas">Casas</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Rural">Rural</SelectItem>
                <SelectItem value="Alto Padrão">Alto Padrão</SelectItem>
                <SelectItem value="Locação">Locação</SelectItem>
                <SelectItem value="Temporada">Temporada</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={ativo === undefined ? 'all' : ativo ? 'true' : 'false'}
              onValueChange={(v) => setAtivo(v === 'all' ? undefined : v === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Corretores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : corretores.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>Nenhum corretor encontrado</p>
            </div>
          ) : (
            <CorretoresTable
              corretores={corretores}
              onEdit={setEditingCorretor}
              onDelete={handleDelete}
              onView={(id) => router.push(`/corretores/${id}`)}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Corretor</DialogTitle>
          </DialogHeader>
          <CorretorForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCorretor} onOpenChange={(open) => !open && setEditingCorretor(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Corretor</DialogTitle>
          </DialogHeader>
          {editingCorretor && (
            <CorretorForm
              corretor={editingCorretor}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCorretor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
