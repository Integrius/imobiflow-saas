'use client'

import { Imovel } from '@/lib/api/imoveis'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ImoveisTableProps {
  imoveis: Imovel[]
  onEdit: (imovel: Imovel) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
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

export function ImoveisTable({ imoveis, onEdit, onDelete, onView }: ImoveisTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (imoveis.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum imóvel encontrado.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Localização</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {imoveis.map((imovel) => (
          <TableRow key={imovel.id}>
            <TableCell className="font-medium">{imovel.codigo}</TableCell>
            <TableCell className="max-w-xs truncate">{imovel.titulo}</TableCell>
            <TableCell>{tipoLabels[imovel.tipo]}</TableCell>
            <TableCell>{categoriaLabels[imovel.categoria]}</TableCell>
            <TableCell>
              {imovel.endereco.bairro && imovel.endereco.cidade
                ? `${imovel.endereco.bairro}, ${imovel.endereco.cidade}`
                : imovel.endereco.cidade || '-'}
            </TableCell>
            <TableCell>{formatCurrency(imovel.preco)}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[imovel.status]}`}>
                {statusLabels[imovel.status]}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(imovel.id)}
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(imovel)}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(imovel.id)}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
