import { ImoveisRepository } from './imoveis.repository'
import { CreateImovelDTO, UpdateImovelDTO, FilterImoveisDTO, ProximidadeDTO } from './imoveis.schema'
import { AppError } from '../../shared/errors/AppError'
import { prisma } from '../../shared/database/prisma.service'
import axios from 'axios'

export class ImoveisService {
  constructor(private imoveisRepository: ImoveisRepository) {}

  async create(data: CreateImovelDTO, tenantId: string) {
    if (data.codigo) {
      const imovelExists = await this.imoveisRepository.findByCodigo(data.codigo, tenantId)
      if (imovelExists) {
        throw new AppError('Código já cadastrado', 400, 'CODIGO_DUPLICADO')
      }
    }

    const endereco = await this.enrichEndereco(data.endereco)

    return await this.imoveisRepository.create({
      ...data,
      endereco,
    }, tenantId)
  }

  async findAll(filters: FilterImoveisDTO, tenantId: string, userType?: string, userId?: string) {
    // Se o usuário é CORRETOR, filtrar automaticamente por corretor_id
    if (userType === 'CORRETOR' && userId) {
      const corretor = await prisma.corretor.findUnique({
        where: { user_id: userId }
      })

      if (corretor) {
        // Forçar filtro por corretor_id
        filters.corretor_id = corretor.id
      }
    }

    return await this.imoveisRepository.findAll(filters, tenantId)
  }

  async findById(id: string, tenantId: string, userType?: string, userId?: string) {
    const imovel = await this.imoveisRepository.findById(id, tenantId)

    if (!imovel) {
      throw new AppError('Imóvel não encontrado', 404, 'IMOVEL_NAO_ENCONTRADO')
    }

    // Se o usuário é CORRETOR, verificar se o imóvel pertence a ele
    if (userType === 'CORRETOR' && userId) {
      const corretor = await prisma.corretor.findUnique({
        where: { user_id: userId }
      })

      if (corretor && imovel.corretor_id !== corretor.id) {
        throw new AppError('Você não tem permissão para acessar este imóvel', 403, 'FORBIDDEN')
      }
    }

    return imovel
  }

  async findByProximidade(data: ProximidadeDTO, tenantId: string) {
    return await this.imoveisRepository.findByProximidade(data, tenantId)
  }

  async update(id: string, data: UpdateImovelDTO, tenantId: string, userType?: string, userId?: string) {
    // Verificar permissão de acesso ao imóvel
    await this.findById(id, tenantId, userType, userId)

    if (data.codigo) {
      const imovelWithCodigo = await this.imoveisRepository.findByCodigo(data.codigo, tenantId)
      if (imovelWithCodigo && imovelWithCodigo.id !== id) {
        throw new AppError('Código já cadastrado para outro imóvel', 400, 'CODIGO_DUPLICADO')
      }
    }

    if (data.endereco) {
      data.endereco = await this.enrichEndereco(data.endereco)
    }

    return await this.imoveisRepository.update(id, data, tenantId)
  }

  async delete(id: string, tenantId: string) {
    const imovel = await this.findById(id, tenantId)

    if (imovel.negociacoes && imovel.negociacoes.length > 0) {
      const negociacoesAtivas = imovel.negociacoes.filter(
        n => !['FECHADO', 'PERDIDO'].includes(n.status)
      )

      if (negociacoesAtivas.length > 0) {
        throw new AppError(
          'Não é possível excluir imóvel com negociações ativas',
          400,
          'IMOVEL_COM_NEGOCIACOES'
        )
      }
    }

    return await this.imoveisRepository.delete(id, tenantId)
  }

  private async enrichEndereco(endereco: any) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${endereco.cep}/json/`)
      
      if (response.data.erro) {
        throw new AppError('CEP não encontrado', 400, 'CEP_INVALIDO')
      }

      const enrichedEndereco = {
        ...endereco,
        logradouro: endereco.logradouro || response.data.logradouro,
        bairro: endereco.bairro || response.data.bairro,
        cidade: endereco.cidade || response.data.localidade,
        estado: endereco.estado || response.data.uf,
      }

      if (!enrichedEndereco.latitude || !enrichedEndereco.longitude) {
        const coords = await this.getCoordinates(
          `${enrichedEndereco.logradouro}, ${enrichedEndereco.numero}, ${enrichedEndereco.cidade}, ${enrichedEndereco.estado}`
        )
        enrichedEndereco.latitude = coords.latitude
        enrichedEndereco.longitude = coords.longitude
      }

      return enrichedEndereco
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      return endereco
    }
  }

  private async getCoordinates(address: string) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'ImobiFlow/1.0',
          },
        }
      )

      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        }
      }

      return { latitude: null, longitude: null }
    } catch (error) {
      return { latitude: null, longitude: null }
    }
  }

  async addFoto(id: string, url: string, tenantId: string) {
    const imovel = await this.findById(id, tenantId)
    const fotos = imovel.fotos || []
    fotos.push(url)

    return await this.imoveisRepository.updateFotos(id, fotos, tenantId)
  }

  async removeFoto(id: string, index: number, tenantId: string) {
    const imovel = await this.findById(id, tenantId)
    const fotos = imovel.fotos || []
    fotos.splice(index, 1)

    return await this.imoveisRepository.updateFotos(id, fotos, tenantId)
  }

  async reorderFotos(id: string, fotos: string[], tenantId: string) {
    await this.findById(id, tenantId)
    return await this.imoveisRepository.updateFotos(id, fotos, tenantId)
  }

  async changeCorretor(id: string, corretorId: string, tenantId: string, userId: string) {
    await this.findById(id, tenantId)
    return await this.imoveisRepository.changeCorretor(id, corretorId, tenantId, userId)
  }
}
