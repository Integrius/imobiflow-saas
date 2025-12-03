import { ProprietariosRepository } from './proprietarios.repository'
import { CreateProprietarioDTO, UpdateProprietarioDTO, FilterProprietariosDTO } from './proprietarios.schema'
import { AppError } from '../../shared/errors/AppError'

export class ProprietariosService {
  constructor(private proprietariosRepository: ProprietariosRepository) {}

  async create(data: CreateProprietarioDTO, tenantId: string) {
    const proprietarioExists = await this.proprietariosRepository.findByCpfCnpj(data.cpf_cnpj, tenantId)

    if (proprietarioExists) {
      throw new AppError('CPF/CNPJ já cadastrado', 400, 'PROPRIETARIO_DUPLICADO')
    }

    return await this.proprietariosRepository.create(data, tenantId)
  }

  async findAll(filters: FilterProprietariosDTO, tenantId: string) {
    return await this.proprietariosRepository.findAll(filters, tenantId)
  }

  async findById(id: string, tenantId: string) {
    const proprietario = await this.proprietariosRepository.findById(id, tenantId)

    if (!proprietario) {
      throw new AppError('Proprietário não encontrado', 404, 'PROPRIETARIO_NAO_ENCONTRADO')
    }

    return proprietario
  }

  async update(id: string, data: UpdateProprietarioDTO, tenantId: string) {
    await this.findById(id, tenantId)

    if (data.cpf_cnpj) {
      const proprietarioWithCpfCnpj = await this.proprietariosRepository.findByCpfCnpj(data.cpf_cnpj, tenantId)

      if (proprietarioWithCpfCnpj && proprietarioWithCpfCnpj.id !== id) {
        throw new AppError('CPF/CNPJ já cadastrado para outro proprietário', 400, 'CPF_CNPJ_DUPLICADO')
      }
    }

    return await this.proprietariosRepository.update(id, data, tenantId)
  }

  async delete(id: string, tenantId: string) {
    const proprietario = await this.findById(id, tenantId)

    if (proprietario.imoveis && proprietario.imoveis.length > 0) {
      throw new AppError(
        'Não é possível excluir proprietário com imóveis cadastrados',
        400,
        'PROPRIETARIO_COM_IMOVEIS'
      )
    }

    return await this.proprietariosRepository.delete(id, tenantId)
  }
}
