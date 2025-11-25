'use client'

import { Corretor } from '@/lib/api/corretores'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Eye, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CorretoresTableProps {
  corretores: Corretor[]
  onEdit: (corretor: Corretor) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export function CorretoresTable({ corretores, onEdit, onDelete, onView }: CorretoresTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }


  if (corretores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum corretor encontrado.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Corretor</TableHead>
          <TableHead>CRECI</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Especializações</TableHead>
          <TableHead>Comissão</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {corretores.map((corretor) => (
          <TableRow key={corretor.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={corretor.foto_url} alt={corretor.user?.nome} />
                  <AvatarFallback>{corretor.user?.nome ? getInitials(corretor.user.nome) : 'CR'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{corretor.user?.nome || 'Sem nome'}</p>
                  <p className="text-sm text-gray-600">{corretor.user?.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">{corretor.creci}</TableCell>
            <TableCell>{corretor.telefone}</TableCell>
            <TableCell>
              {corretor.especializacoes && corretor.especializacoes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {corretor.especializacoes.slice(0, 2).map((esp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {esp}
                    </span>
                  ))}
                  {corretor.especializacoes.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{corretor.especializacoes.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>{corretor.comissao_padrao}%</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(corretor.performance_score / 20)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{corretor.performance_score}</span>
              </div>
            </TableCell>
            <TableCell>
              {corretor.user?.ativo ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Ativo
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inativo
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(corretor.id)}
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(corretor)}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(corretor.id)}
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
