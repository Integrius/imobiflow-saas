'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Imovel, CreateImovelData } from '@/lib/api/imoveis'
import { useProprietarios } from '@/hooks/use-proprietarios'
import { useState } from 'react'

const imovelFormSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  status: z.string().optional(),
  titulo: z.string().min(10, 'Título deve ter pelo menos 10 caracteres'),
  descricao: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres'),
  preco: z.number().min(0, 'Preço deve ser positivo'),
  condominio: z.number().min(0).optional().nullable(),
  iptu: z.number().min(0).optional().nullable(),
  proprietario_id: z.string().uuid('Selecione um proprietário'),
  endereco_cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  endereco_logradouro: z.string().optional(),
  endereco_numero: z.string().min(1, 'Número é obrigatório'),
  endereco_complemento: z.string().optional(),
  endereco_bairro: z.string().optional(),
  endereco_cidade: z.string().optional(),
  endereco_estado: z.string().length(2).optional(),
  quartos: z.number().int().min(0).optional(),
  suites: z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),
  area_total: z.number().min(0).optional(),
  area_construida: z.number().min(0).optional(),
  mobiliado: z.boolean().optional(),
  aceita_pets: z.boolean().optional(),
})

type ImovelFormData = z.infer<typeof imovelFormSchema>

interface ImovelFormProps {
  imovel?: Imovel
  onSubmit: (data: CreateImovelData) => Promise<void>
  onCancel: () => void
}

export function ImovelForm({ imovel, onSubmit, onCancel }: ImovelFormProps) {
  const { proprietarios, isLoading: loadingProprietarios } = useProprietarios({ limit: 100 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ImovelFormData>({
    resolver: zodResolver(imovelFormSchema),
    defaultValues: imovel
      ? {
          tipo: imovel.tipo,
          categoria: imovel.categoria,
          status: imovel.status,
          titulo: imovel.titulo,
          descricao: imovel.descricao,
          preco: imovel.preco,
          condominio: imovel.condominio,
          iptu: imovel.iptu,
          proprietario_id: imovel.proprietario_id,
          endereco_cep: imovel.endereco.cep,
          endereco_logradouro: imovel.endereco.logradouro,
          endereco_numero: imovel.endereco.numero,
          endereco_complemento: imovel.endereco.complemento,
          endereco_bairro: imovel.endereco.bairro,
          endereco_cidade: imovel.endereco.cidade,
          endereco_estado: imovel.endereco.estado,
          quartos: imovel.caracteristicas.quartos,
          suites: imovel.caracteristicas.suites,
          banheiros: imovel.caracteristicas.banheiros,
          vagas: imovel.caracteristicas.vagas,
          area_total: imovel.caracteristicas.area_total,
          area_construida: imovel.caracteristicas.area_construida,
          mobiliado: imovel.caracteristicas.mobiliado,
          aceita_pets: imovel.caracteristicas.aceita_pets,
        }
      : {
          status: 'DISPONIVEL',
          mobiliado: false,
          aceita_pets: false,
        },
  })

  const handleFormSubmit = async (data: ImovelFormData) => {
    setIsSubmitting(true)
    try {
      const payload: CreateImovelData = {
        tipo: data.tipo,
        categoria: data.categoria,
        status: data.status,
        titulo: data.titulo,
        descricao: data.descricao,
        preco: data.preco,
        condominio: data.condominio,
        iptu: data.iptu,
        proprietario_id: data.proprietario_id,
        endereco: {
          cep: data.endereco_cep,
          logradouro: data.endereco_logradouro,
          numero: data.endereco_numero,
          complemento: data.endereco_complemento,
          bairro: data.endereco_bairro,
          cidade: data.endereco_cidade,
          estado: data.endereco_estado,
        },
        caracteristicas: {
          quartos: data.quartos,
          suites: data.suites,
          banheiros: data.banheiros,
          vagas: data.vagas,
          area_total: data.area_total,
          area_construida: data.area_construida,
          mobiliado: data.mobiliado,
          aceita_pets: data.aceita_pets,
        },
      }
      await onSubmit(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Básicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={watch('tipo')}
              onValueChange={(value) => setValue('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
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
            {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              value={watch('categoria')}
              onValueChange={(value) => setValue('categoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VENDA">Venda</SelectItem>
                <SelectItem value="LOCACAO">Locação</SelectItem>
                <SelectItem value="TEMPORADA">Temporada</SelectItem>
              </SelectContent>
            </Select>
            {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="proprietario_id">Proprietário *</Label>
            <Select
              value={watch('proprietario_id')}
              onValueChange={(value) => setValue('proprietario_id', value)}
              disabled={loadingProprietarios}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o proprietário" />
              </SelectTrigger>
              <SelectContent>
                {proprietarios.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.proprietario_id && <p className="text-sm text-red-600">{errors.proprietario_id.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            placeholder="Ex: Apartamento 3 quartos com vista para o mar"
            {...register('titulo')}
          />
          {errors.titulo && <p className="text-sm text-red-600">{errors.titulo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <textarea
            id="descricao"
            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
            placeholder="Descreva o imóvel detalhadamente..."
            {...register('descricao')}
          />
          {errors.descricao && <p className="text-sm text-red-600">{errors.descricao.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Valores</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preco">Preço *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              {...register('preco', { valueAsNumber: true })}
            />
            {errors.preco && <p className="text-sm text-red-600">{errors.preco.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="condominio">Condomínio</Label>
            <Input
              id="condominio"
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              {...register('condominio', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iptu">IPTU</Label>
            <Input
              id="iptu"
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              {...register('iptu', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Endereço</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endereco_cep">CEP *</Label>
            <Input
              id="endereco_cep"
              placeholder="00000000"
              maxLength={8}
              {...register('endereco_cep')}
            />
            {errors.endereco_cep && <p className="text-sm text-red-600">{errors.endereco_cep.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco_logradouro">Logradouro</Label>
            <Input
              id="endereco_logradouro"
              placeholder="Ex: Rua das Flores"
              {...register('endereco_logradouro')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_numero">Número *</Label>
            <Input
              id="endereco_numero"
              placeholder="123"
              {...register('endereco_numero')}
            />
            {errors.endereco_numero && <p className="text-sm text-red-600">{errors.endereco_numero.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco_complemento">Complemento</Label>
            <Input
              id="endereco_complemento"
              placeholder="Ex: Apto 101"
              {...register('endereco_complemento')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_bairro">Bairro</Label>
            <Input
              id="endereco_bairro"
              placeholder="Ex: Centro"
              {...register('endereco_bairro')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_cidade">Cidade</Label>
            <Input
              id="endereco_cidade"
              placeholder="Ex: São Paulo"
              {...register('endereco_cidade')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_estado">Estado</Label>
            <Input
              id="endereco_estado"
              placeholder="SP"
              maxLength={2}
              {...register('endereco_estado')}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Características</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quartos">Quartos</Label>
            <Input
              id="quartos"
              type="number"
              min="0"
              {...register('quartos', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suites">Suítes</Label>
            <Input
              id="suites"
              type="number"
              min="0"
              {...register('suites', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banheiros">Banheiros</Label>
            <Input
              id="banheiros"
              type="number"
              min="0"
              {...register('banheiros', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vagas">Vagas</Label>
            <Input
              id="vagas"
              type="number"
              min="0"
              {...register('vagas', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area_total">Área Total (m²)</Label>
            <Input
              id="area_total"
              type="number"
              step="0.01"
              min="0"
              {...register('area_total', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area_construida">Área Construída (m²)</Label>
            <Input
              id="area_construida"
              type="number"
              step="0.01"
              min="0"
              {...register('area_construida', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 pt-8">
              <input
                id="mobiliado"
                type="checkbox"
                className="h-4 w-4"
                {...register('mobiliado')}
              />
              <Label htmlFor="mobiliado" className="cursor-pointer">Mobiliado</Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 pt-8">
              <input
                id="aceita_pets"
                type="checkbox"
                className="h-4 w-4"
                {...register('aceita_pets')}
              />
              <Label htmlFor="aceita_pets" className="cursor-pointer">Aceita Pets</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : imovel ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  )
}
