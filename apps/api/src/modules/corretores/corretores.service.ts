import { CorretoresRepository } from './corretores.repository'
import { CreateCorretorDTO, UpdateCorretorDTO, ListCorretoresQuery } from './corretores.schema'
import { AppError } from '../../shared/errors/app-error'

export class CorretoresService {
  constructor(private corretoresRepository: CorretoresRepository) {}

  async create(data: CreateCorretorDTO) {
    const corretor = await this.corretoresRepository.create(data)
    return corretor
  }

  async findAll(query: ListCorretoresQuery) {
    return await this.corretoresRepository.findAll(query)
  }

  async findById(id: string) {
    const corretor = await this.corretoresRepository.findById(id)
    if (!corretor) {
      throw new AppError('Corretor não encontrado', 404, 'CORRETOR_NOT_FOUND')
    }
    return corretor
  }

  async update(id: string, data: UpdateCorretorDTO) {
    await this.findById(id)
    const corretor = await this.corretoresRepository.update(id, data)
    return corretor
  }

  async delete(id: string) {
    await this.findById(id)
    await this.corretoresRepository.delete(id)
  }

  async getStats(id: string) {
    await this.findById(id)
    return await this.corretoresRepository.getStats(id)
  }
}
