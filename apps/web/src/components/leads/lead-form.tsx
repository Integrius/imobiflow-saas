'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateLead, useUpdateLead } from '@/hooks/use-leads'
import { useRouter } from 'next/navigation'

const leadSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (10 ou 11 dígitos)'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido (11 dígitos)').optional().or(z.literal('')),
  origem: z.enum(['SITE', 'PORTAL', 'INDICACAO', 'TELEFONE', 'WHATSAPP', 'REDES_SOCIAIS']),
  corretor_id: z.string().optional().or(z.literal('')),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  initialData?: any
  leadId?: string
}

export function LeadForm({ initialData, leadId }: LeadFormProps) {
  const router = useRouter()
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      email: initialData?.email || '',
      telefone: initialData?.telefone || '',
      cpf: initialData?.cpf || '',
      origem: initialData?.origem || 'SITE',
      corretor_id: initialData?.corretor_id || '',
    },
  })

  const onSubmit = async (data: LeadFormData) => {
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        cpf: data.cpf || undefined,
        corretor_id: data.corretor_id || undefined,
      }

      if (leadId) {
        await updateLead.mutateAsync({ id: leadId, data: payload })
      } else {
        await createLead.mutateAsync(payload)
      }

      router.push('/leads')
    } catch (error) {
      console.error('Erro ao salvar lead:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <Input placeholder="11999999999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="12345678900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="origem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SITE">Site</SelectItem>
                    <SelectItem value="PORTAL">Portal</SelectItem>
                    <SelectItem value="INDICACAO">Indicação</SelectItem>
                    <SelectItem value="TELEFONE">Telefone</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="REDES_SOCIAIS">Redes Sociais</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/leads')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createLead.isPending || updateLead.isPending}>
            {leadId ? 'Atualizar' : 'Criar'} Lead
          </Button>
        </div>
      </form>
    </Form>
  )
}
