import { CorretoresRepository } from './corretores.repository'
import { CreateCorretorDTO, UpdateCorretorDTO, ListCorretoresQuery } from './corretores.schema'
import { AppError } from '../../shared/errors/app-error'
import { sendGridService } from '../../shared/services/sendgrid.service'
import { twilioService } from '../../shared/services/twilio.service'

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

  async bulkUpdateStatus(
    corretorIds: string[],
    status: 'ATIVO' | 'SUSPENSO' | 'CANCELADO',
    ativo: boolean,
    tenantId: string
  ) {
    const updated = await this.corretoresRepository.bulkUpdateStatus(
      corretorIds,
      status,
      ativo,
      tenantId
    )

    return {
      success: true,
      updated,
      message: `${updated} corretor(es) atualizado(s) com sucesso`
    }
  }

  async bulkResendCredentials(corretorIds: string[], tenantId: string) {
    const corretores = await this.corretoresRepository.findByIds(corretorIds, tenantId)

    if (corretores.length === 0) {
      throw new AppError('Nenhum corretor encontrado', 404, 'CORRETORES_NOT_FOUND')
    }

    let emailsSent = 0
    let whatsappSent = 0

    // Buscar tenant para pegar informações
    const tenant = await this.corretoresRepository.getTenantInfo(tenantId)

    for (const corretor of corretores) {
      // Gerar nova senha temporária
      const senhaTemporaria = Math.random().toString(36).slice(-8).toUpperCase()

      // Atualizar senha do usuário
      await this.corretoresRepository.updateUserPassword(corretor.userId, senhaTemporaria)

      // Resetar primeiro_acesso
      await this.corretoresRepository.resetPrimeiroAcesso(corretor.userId)

      // Enviar email
      try {
        await sendGridService.enviarSenhaTemporariaCorretor({
          nome: corretor.nome,
          email: corretor.email,
          senhaTemporaria,
          tenantUrl: `https://${tenant.slug}.integrius.com.br`,
          nomeTenant: tenant.nome,
          horasValidade: 12
        })
        emailsSent++
      } catch (error) {
        console.error(`Erro ao enviar email para ${corretor.email}:`, error)
      }

      // Enviar WhatsApp
      try {
        await twilioService.enviarSenhaTemporaria({
          telefone: corretor.telefone,
          nome: corretor.nome,
          senhaTemporaria,
          tenantUrl: `https://${tenant.slug}.integrius.com.br`,
          nomeTenant: tenant.nome,
          horasValidade: 12
        })
        whatsappSent++
      } catch (error) {
        console.error(`Erro ao enviar WhatsApp para ${corretor.telefone}:`, error)
      }
    }

    return {
      success: true,
      total: corretores.length,
      emailsSent,
      whatsappSent,
      message: `Credenciais reenviadas para ${corretores.length} corretor(es)`
    }
  }
}
