import { CorretoresRepository } from './corretores.repository'
import { CreateCorretorDTO, UpdateCorretorDTO, ListCorretoresQuery } from './corretores.schema'
import { AppError } from '../../shared/errors/app-error'

export class CorretoresService {
  constructor(private corretoresRepository: CorretoresRepository) {}

  async create(data: CreateCorretorDTO, tenantId: string) {
    const corretor = await this.corretoresRepository.create(data, tenantId)
    return corretor
  }

  async findAll(query: ListCorretoresQuery, tenantId: string) {
    return await this.corretoresRepository.findAll(query, tenantId)
  }

  async findById(id: string, tenantId: string) {
    const corretor = await this.corretoresRepository.findById(id, tenantId)
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404, 'CORRETOR_NOT_FOUND')
    }
    return corretor
  }

  async update(id: string, data: UpdateCorretorDTO, tenantId: string) {
    await this.findById(id, tenantId)
    const corretor = await this.corretoresRepository.update(id, data, tenantId)
    return corretor
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId)
    await this.corretoresRepository.delete(id, tenantId)
  }

  async getImoveis(id: string, tenantId: string) {
    await this.findById(id, tenantId)
    return await this.corretoresRepository.getImoveis(id, tenantId)
  }
}
