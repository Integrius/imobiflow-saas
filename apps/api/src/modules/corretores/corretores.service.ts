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
    console.log(`🔄 [BulkResendCredentials] Iniciando para ${corretorIds.length} corretor(es)`)

    const corretores = await this.corretoresRepository.findByIds(corretorIds, tenantId)

    if (corretores.length === 0) {
      throw new AppError('Nenhum corretor encontrado', 404, 'CORRETORES_NOT_FOUND')
    }

    console.log(`✅ [BulkResendCredentials] ${corretores.length} corretor(es) encontrado(s)`)

    let emailsSent = 0
    let whatsappSent = 0
    const errors: any[] = []

    // Buscar tenant para pegar informações
    const tenant = await this.corretoresRepository.getTenantInfo(tenantId)
    console.log(`🏢 [BulkResendCredentials] Tenant: ${tenant.nome} (${tenant.slug})`)

    for (const corretor of corretores) {
      console.log(`\n👤 [BulkResendCredentials] Processando: ${corretor.nome} (${corretor.email})`)

      // Gerar nova senha temporária
      const senhaTemporaria = Math.random().toString(36).slice(-8).toUpperCase()
      console.log(`🔐 [BulkResendCredentials] Senha temporária gerada: ${senhaTemporaria}`)

      // Atualizar senha do usuário
      await this.corretoresRepository.updateUserPassword(corretor.userId, senhaTemporaria)
      console.log(`✅ [BulkResendCredentials] Senha atualizada no banco`)

      // Resetar primeiro_acesso
      await this.corretoresRepository.resetPrimeiroAcesso(corretor.userId)
      console.log(`✅ [BulkResendCredentials] primeiro_acesso resetado`)

      // Enviar email
      try {
        console.log(`📧 [BulkResendCredentials] Enviando email para ${corretor.email}...`)
        await sendGridService.enviarSenhaTemporariaCorretor({
          nome: corretor.nome,
          email: corretor.email,
          senhaTemporaria,
          tenantUrl: `https://${tenant.slug}.integrius.com.br`,
          nomeTenant: tenant.nome,
          horasValidade: 12
        })
        emailsSent++
        console.log(`✅ [BulkResendCredentials] Email enviado com sucesso`)
      } catch (error: any) {
        console.error(`❌ [BulkResendCredentials] Erro ao enviar email para ${corretor.email}:`, error.message || error)
        errors.push({ corretor: corretor.email, tipo: 'email', erro: error.message })
      }

      // Enviar WhatsApp
      try {
        console.log(`📱 [BulkResendCredentials] Enviando WhatsApp para ${corretor.telefone}...`)
        console.log(`📱 [BulkResendCredentials] Dados WhatsApp:`, {
          telefone: corretor.telefone,
          nome: corretor.nome,
          email: corretor.email,
          tenantUrl: `${tenant.slug}.integrius.com.br`,
          nomeTenant: tenant.nome
        })

        const whatsappResult = await twilioService.enviarSenhaTemporaria({
          telefone: corretor.telefone,
          nome: corretor.nome,
          email: corretor.email,
          senhaTemporaria,
          tenantUrl: `${tenant.slug}.integrius.com.br`,
          nomeTenant: tenant.nome
        })

        if (whatsappResult) {
          whatsappSent++
          console.log(`✅ [BulkResendCredentials] WhatsApp enviado com sucesso`)
        } else {
          console.warn(`⚠️  [BulkResendCredentials] WhatsApp não enviado (Twilio não configurado ou retornou false)`)
        }
      } catch (error: any) {
        console.error(`❌ [BulkResendCredentials] Erro ao enviar WhatsApp para ${corretor.telefone}:`, error.message || error)
        errors.push({ corretor: corretor.telefone, tipo: 'whatsapp', erro: error.message })
      }
    }

    console.log(`\n📊 [BulkResendCredentials] Resumo Final:`)
    console.log(`   Total de corretores: ${corretores.length}`)
    console.log(`   Emails enviados: ${emailsSent}`)
    console.log(`   WhatsApps enviados: ${whatsappSent}`)
    console.log(`   Erros: ${errors.length}`)
    if (errors.length > 0) {
      console.log(`   Detalhes dos erros:`, JSON.stringify(errors, null, 2))
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
