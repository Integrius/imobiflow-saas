'use client'

import { Lead } from '@/lib/api/leads'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface LeadsTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
}

export function LeadsTable({ leads, onEdit, onDelete }: LeadsTableProps) {
  const getTemperaturaColor = (temp: string) => {
    switch (temp) {
      case 'QUENTE': return 'text-red-600 bg-red-50'
      case 'MORNO': return 'text-yellow-600 bg-yellow-50'
      case 'FRIO': return 'text-blue-600 bg-blue-50'
      default: return ''
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Temperatura</TableHead>
          <TableHead>Corretor</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.nome}</TableCell>
            <TableCell>{lead.telefone}</TableCell>
            <TableCell>{lead.email || '-'}</TableCell>
            <TableCell>{lead.origem}</TableCell>
            <TableCell>{lead.score}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTemperaturaColor(lead.temperatura)}`}>
                {lead.temperatura}
              </span>
            </TableCell>
            <TableCell>{lead.corretor?.user.name || '-'}</TableCell>
            <TableCell>{format(new Date(lead.created_at), 'dd/MM/yyyy')}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(lead)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(lead.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
