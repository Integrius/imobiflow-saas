'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FilterImoveis } from '@/lib/api/imoveis'
import { Search, X } from 'lucide-react'

interface ImoveisFiltersProps {
  filters: FilterImoveis
  onFilterChange: (filters: FilterImoveis) => void
}

export function ImoveisFilters({ filters, onFilterChange }: ImoveisFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterImoveis>(filters)

  const handleChange = (field: keyof FilterImoveis, value: string | number | undefined) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    onFilterChange(localFilters)
  }

  const handleClear = () => {
    const clearedFilters: FilterImoveis = { page: 1, limit: 20 }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={localFilters.tipo || 'all'}
              onValueChange={(value) => handleChange('tipo', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                <SelectItem value="CASA">Casa</SelectItem>
                <SelectItem value="TERRENO">Terreno</SelectItem>
                <SelectItem value="COMERCIAL">Comercial</SelectItem>
                <SelectItem value="RURAL">Rural</SelectItem>
                <SelectItem value="CHACARA">Chácara</SelectItem>
                <SelectItem value="SOBRADO">Sobrado</SelectItem>
                <SelectItem value="COBERTURA">Cobertura</SelectItem>
                <SelectItem value="LOFT">Loft</SelectItem>
                <SelectItem value="KITNET">Kitnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={localFilters.categoria || 'all'}
              onValueChange={(value) => handleChange('categoria', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="VENDA">Venda</SelectItem>
                <SelectItem value="LOCACAO">Locação</SelectItem>
                <SelectItem value="TEMPORADA">Temporada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => handleChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                <SelectItem value="RESERVADO">Reservado</SelectItem>
                <SelectItem value="VENDIDO">Vendido</SelectItem>
                <SelectItem value="ALUGADO">Alugado</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
                <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              placeholder="Ex: São Paulo"
              value={localFilters.cidade || ''}
              onChange={(e) => handleChange('cidade', e.target.value || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input
              placeholder="Ex: Centro"
              value={localFilters.bairro || ''}
              onChange={(e) => handleChange('bairro', e.target.value || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preço Mínimo</Label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={localFilters.preco_min || ''}
              onChange={(e) => handleChange('preco_min', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preço Máximo</Label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={localFilters.preco_max || ''}
              onChange={(e) => handleChange('preco_max', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Quartos Mínimo</Label>
            <Input
              type="number"
              placeholder="0"
              value={localFilters.quartos_min || ''}
              onChange={(e) => handleChange('quartos_min', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleApply} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button onClick={handleClear} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
