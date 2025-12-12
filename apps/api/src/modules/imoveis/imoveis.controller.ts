import { FastifyRequest, FastifyReply } from 'fastify'
import { ImoveisService } from './imoveis.service'
import {
  createImovelSchema,
  updateImovelSchema,
  filterImoveisSchema,
  proximidadeSchema
} from './imoveis.schema'
import { uploadService } from '../../services/upload.service'

export class ImoveisController {
  constructor(private imoveisService: ImoveisService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = createImovelSchema.parse(request.body)
    const imovel = await this.imoveisService.create(data, tenantId)
    return reply.status(201).send(imovel)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const filters = filterImoveisSchema.parse(request.query)
    const result = await this.imoveisService.findAll(filters, tenantId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const imovel = await this.imoveisService.findById(id, tenantId)
    return reply.send(imovel)
  }

  async findByProximidade(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = proximidadeSchema.parse(request.query)
    const imoveis = await this.imoveisService.findByProximidade(data, tenantId)
    return reply.send(imoveis)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const data = updateImovelSchema.parse(request.body)
    console.log('=== UPDATE PAYLOAD ===', JSON.stringify(data, null, 2))
    const imovel = await this.imoveisService.update(id, data, tenantId)
    console.log('=== IMOVEL AFTER UPDATE ===', JSON.stringify({ id: imovel.id, fotos: imovel.fotos }, null, 2))
    return reply.send(imovel)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    await this.imoveisService.delete(id, tenantId)
    return reply.status(204).send()
  }

  async uploadFoto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }

      // Verifica se o imóvel existe
      const imovel = await this.imoveisService.findById(id, tenantId)
      if (!imovel) {
        return reply.status(404).send({ error: 'Imóvel não encontrado' })
      }

      // Recebe o arquivo via multipart
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ error: 'Nenhum arquivo enviado' })
      }

      // Valida tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP' })
      }

      // Valida tamanho (max 5MB)
      const buffer = await data.toBuffer()
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (buffer.length > maxSize) {
        return reply.status(400).send({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' })
      }

      // Upload para Cloudinary
      const url = await uploadService.uploadImage(
        buffer,
        tenantId,
        id,
        data.filename
      )

      // Adiciona URL ao array de fotos do imóvel
      const updatedImovel = await this.imoveisService.addFoto(id, url, tenantId)

      return reply.status(200).send({
        message: 'Foto enviada com sucesso',
        url,
        imovel: updatedImovel
      })
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error)
      return reply.status(500).send({ error: 'Erro ao fazer upload da foto' })
    }
  }

  async deleteFoto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id, fotoIndex } = request.params as { id: string; fotoIndex: string }

      const index = parseInt(fotoIndex, 10)
      if (isNaN(index)) {
        return reply.status(400).send({ error: 'Índice de foto inválido' })
      }

      // Busca o imóvel
      const imovel = await this.imoveisService.findById(id, tenantId)
      if (!imovel) {
        return reply.status(404).send({ error: 'Imóvel não encontrado' })
      }

      if (!imovel.fotos || imovel.fotos.length === 0) {
        return reply.status(404).send({ error: 'Imóvel não possui fotos' })
      }

      if (index < 0 || index >= imovel.fotos.length) {
        return reply.status(404).send({ error: 'Foto não encontrada' })
      }

      const fotoUrl = imovel.fotos[index]

      // Remove da Cloudinary
      const publicId = uploadService.extractPublicIdFromUrl(fotoUrl)
      if (publicId) {
        await uploadService.deleteImage(publicId)
      }

      // Remove do array de fotos
      const updatedImovel = await this.imoveisService.removeFoto(id, index, tenantId)

      return reply.status(200).send({
        message: 'Foto removida com sucesso',
        imovel: updatedImovel
      })
    } catch (error: any) {
      console.error('Erro ao excluir foto:', error)
      return reply.status(500).send({ error: 'Erro ao excluir foto' })
    }
  }

  async reorderFotos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }
      const { fotos } = request.body as { fotos: string[] }

      if (!fotos || !Array.isArray(fotos)) {
        return reply.status(400).send({ error: 'Array de fotos inválido' })
      }

      // Busca o imóvel para validar
      const imovel = await this.imoveisService.findById(id, tenantId)
      if (!imovel) {
        return reply.status(404).send({ error: 'Imóvel não encontrado' })
      }

      // Valida que todas as URLs no array existem no imóvel
      const fotosOriginais = imovel.fotos || []
      const todasFotosValidas = fotos.every(foto => fotosOriginais.includes(foto))

      if (!todasFotosValidas || fotos.length !== fotosOriginais.length) {
        return reply.status(400).send({ error: 'Array de fotos não corresponde ao imóvel' })
      }

      // Reordena as fotos
      const updatedImovel = await this.imoveisService.reorderFotos(id, fotos, tenantId)

      return reply.status(200).send({
        message: 'Fotos reordenadas com sucesso',
        imovel: updatedImovel
      })
    } catch (error: any) {
      console.error('Erro ao reordenar fotos:', error)
      return reply.status(500).send({ error: 'Erro ao reordenar fotos' })
    }
  }
}
