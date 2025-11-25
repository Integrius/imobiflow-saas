'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useImoveis } from '@/hooks/use-imoveis'
import { ImoveisTable } from '@/components/imoveis/imoveis-table'
import { ImoveisFilters } from '@/components/imoveis/imoveis-filters'
import { ImovelForm } from '@/components/imoveis/imovel-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Imovel, FilterImoveis } from '@/lib/api/imoveis'

export default function ImoveisPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterImoveis>({ page: 1, limit: 20 })
  const { imoveis, total, page, limit, isLoading, createImovel, updateImovel, deleteImovel } = useImoveis(filters)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedImovel, setSelectedImovel] = useState<Imovel | undefined>()

  const totalPages = Math.ceil(total / limit)

  const handleCreate = () => {
    setSelectedImovel(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (imovel: Imovel) => {
    setSelectedImovel(imovel)
    setDialogOpen(true)
  }

  const handleView = (id: string) => {
    router.push(`/imoveis/${id}`)
  }

  const handleSubmit = async (data: unknown) => {
    if (selectedImovel) {
      await updateImovel.mutateAsync({ id: selectedImovel.id, data: data as Partial<Imovel> })
    } else {
      await createImovel.mutateAsync(data as Imovel)
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      await deleteImovel.mutateAsync(id)
    }
  }

  const handleFilterChange = (newFilters: FilterImoveis) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando imóveis...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Imóveis</h1>
          <p className="text-gray-600 mt-1">
            {total} {total === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Imóvel
        </Button>
      </div>

      <ImoveisFilters filters={filters} onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Imóveis</CardTitle>
        </CardHeader>
        <CardContent>
          <ImoveisTable
            imoveis={imoveis}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Página {page} de {totalPages} ({total} {total === 1 ? 'resultado' : 'resultados'})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedImovel ? 'Editar Imóvel' : 'Novo Imóvel'}
            </DialogTitle>
          </DialogHeader>
          <ImovelForm
            imovel={selectedImovel}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
