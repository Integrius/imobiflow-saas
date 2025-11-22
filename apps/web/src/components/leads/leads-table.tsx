'use client'

import { useState } from 'react'
import { useLeads, useDeleteLead } from '@/hooks/use-leads'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function LeadsTable() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useLeads(page, 20)
  const deleteLead = useDeleteLead()
  const router = useRouter()

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>
  }

  const leads = data?.leads || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const getTemperaturaColor = (temp: string) => {
    switch (temp) {
      case 'QUENTE':
        return 'bg-red-500 hover:bg-red-600'
      case 'MORNO':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'FRIO':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-gray-500'
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      await deleteLead.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead: any) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{lead.telefone}</div>
                      {lead.email && (
                        <div className="text-muted-foreground">{lead.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.origem}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{lead.score}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTemperaturaColor(lead.temperatura)}>
                      {lead.temperatura}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/leads/${lead.id}/editar`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(lead.id)}
                        disabled={deleteLead.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {leads.length} de {total} leads
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
