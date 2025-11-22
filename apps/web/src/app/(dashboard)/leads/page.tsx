'use client'

import { LeadsTable } from '@/components/leads/leads-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LeadsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus leads em um só lugar
          </p>
        </div>
        <Button onClick={() => router.push('/leads/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <LeadsTable />
    </div>
  )
}
