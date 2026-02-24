import { PrismaClient } from '@prisma/client'
import { TenantRepository } from './tenant.repository'
import { CreateTenantDTO, UpdateTenantDTO } from './tenant.schema'
import { AppError } from '../../shared/errors/AppError'
import bcrypt from 'bcryptjs'
import { ActivityLogService } from '../../shared/services/activity-log.service'
import { sendGridService } from '../../shared/services/sendgrid.service'
import { DataExportService } from '../../shared/services/data-export.service'

export class TenantService {
  private repository: TenantRepository

  constructor(private prisma: PrismaClient) {
    this.repository = new TenantRepository(prisma)
  }

  async create(data: CreateTenantDTO) {
    // DEBUG: Log dos dados recebidos
    console.log('🔍 TenantService.create - Dados recebidos:', {
      nome: data.nome,
      slug: data.slug,
      adminNome: data.adminNome,
      adminEmail: data.adminEmail,
      adminSenhaPresente: !!data.adminSenha,
      hasAdminData: !!(data.adminNome && data.adminEmail && data.adminSenha)
    })

    // Verificar se slug já existe
    const slugExists = await this.repository.findBySlug(data.slug)
    if (slugExists) {
      throw new AppError('Slug já está em uso', 400)
    }

    // Verificar se email já existe
    const emailExists = await this.repository.findByEmail(data.email)
    if (emailExists) {
      throw new AppError('Email já está em uso', 400)
    }

    // Criar subdomínio baseado no slug
    const subdominio = data.slug

    // Se dados do admin foram fornecidos, criar tenant + admin em uma transação
    if (data.adminNome && data.adminEmail && data.adminSenha) {
      console.log('✅ Iniciando transação para criar tenant + admin')
      const adminNome = data.adminNome
      const adminEmail = data.adminEmail
      const adminSenha = data.adminSenha

      return await this.prisma.$transaction(async (tx) => {
        // Verificar campanha de lançamento: 60 dias grátis para os 20 primeiros
        // Campanha válida até 15/04/2026
        const CAMPANHA_FIM = new Date('2026-04-15T00:00:00-03:00')
        const totalTenants = await tx.tenant.count()
        const isCampanhaLancamento = totalTenants < 20 && new Date() < CAMPANHA_FIM

        // Campanha: 60 dias | Normal: 14 dias
        const trialDays = isCampanhaLancamento ? 60 : 14
        const dataExpiracao = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

        // Usar limites corretos baseados no plano selecionado
        const limites = this.getPlanLimits(data.plano || 'BASICO')

        // Configurações do tenant (inclui flag de campanha)
        const configuracoes = isCampanhaLancamento
          ? { campanha_lancamento: true, whatsapp_habilitado: false, trial_days: 60, campanha_inicio: new Date().toISOString() }
          : { campanha_lancamento: false, whatsapp_habilitado: true, trial_days: 14 }

        // 1. Criar tenant
        const tenant = await tx.tenant.create({
          data: {
            nome: data.nome,
            slug: data.slug,
            subdominio,
            email: data.email,
            telefone: data.telefone,
            plano: data.plano,
            logo_url: data.logo_url || null,
            status: 'TRIAL',
            data_expiracao: dataExpiracao,
            configuracoes,
            ...limites
          }
        })

        // 2. Hash da senha
        const senha_hash = bcrypt.hashSync(adminSenha, 10)

        // 3. Criar usuário admin
        const user = await tx.user.create({
          data: {
            nome: adminNome,
            email: adminEmail,
            senha_hash,
            tipo: 'ADMIN',
            ativo: true,
            tenant_id: tenant.id
          }
        })

        // 4. Criar registro Corretor (obrigatório para ADMIN/GESTOR/CORRETOR)
        await tx.corretor.create({
          data: {
            user_id: user.id,
            tenant_id: tenant.id,
            creci: 'ADMIN-' + tenant.id.substring(0, 8), // CRECI temporário para admin
            telefone: data.telefone || '(00) 00000-0000' // Telefone padrão se não fornecido
          }
        })

        // 5. Atualizar contador de usuários do tenant
        await tx.tenant.update({
          where: { id: tenant.id },
          data: { total_usuarios: 1 }
        })

        // 6. ✅ Log de criação do tenant
        await ActivityLogService.logTenantCriado(tenant.id)

        // 7. 📧 Enviar email de boas-vindas (assíncrono, não bloqueia)
        setImmediate(async () => {
          try {
            await sendGridService.enviarEmailBoasVindasRegistro({
              nomeUsuario: adminNome,
              emailUsuario: adminEmail,
              nomeTenant: tenant.nome,
              dataExpiracao: dataExpiracao
            })
            console.log(`✅ Email de boas-vindas enviado para ${adminEmail}`)
          } catch (error) {
            console.error('❌ Erro ao enviar email de boas-vindas:', error)
            // Não propaga erro - email é não-crítico
          }
        })

        return tenant
      })
    }

    // Criar apenas tenant (compatibilidade com código antigo)
    const tenant = await this.repository.create({
      ...data,
      subdominio
    })

    return tenant
  }

  async findById(id: string) {
    const tenant = await this.repository.findById(id)

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    return tenant
  }

  async findBySlug(slug: string) {
    const tenant = await this.repository.findBySlug(slug)

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    return tenant
  }

  async findBySubdominio(subdominio: string) {
    const tenant = await this.repository.findBySubdominio(subdominio)

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    return tenant
  }

  async update(id: string, data: UpdateTenantDTO) {
    // Verificar se tenant existe
    await this.findById(id)

    // Se está atualizando o plano, atualizar os limites também
    if (data.plano) {
      const limites = this.getPlanLimits(data.plano)
      Object.assign(data, limites)
    }

    const tenant = await this.repository.update(id, data)

    return tenant
  }

  async list(filters?: {
    status?: string
    plano?: string
    search?: string
  }) {
    return this.repository.list(filters)
  }

  async checkLimits(tenantId: string, type: 'usuarios' | 'imoveis') {
    const tenant = await this.findById(tenantId)

    if (type === 'usuarios') {
      if (tenant.total_usuarios >= tenant.limite_usuarios) {
        throw new AppError(
          `Limite de usuários atingido (${tenant.limite_usuarios}). Faça upgrade do seu plano.`,
          403
        )
      }
    }

    if (type === 'imoveis') {
      if (tenant.total_imoveis >= tenant.limite_imoveis) {
        throw new AppError(
          `Limite de imóveis atingido (${tenant.limite_imoveis}). Faça upgrade do seu plano.`,
          403
        )
      }
    }

    return true
  }

  async suspendTenant(tenantId: string, reason?: string) {
    return this.repository.update(tenantId, {
      status: 'SUSPENSO'
    })
  }

  async activateTenant(tenantId: string) {
    return this.repository.update(tenantId, {
      status: 'ATIVO'
    })
  }

  async cancelTenant(tenantId: string) {
    return this.repository.update(tenantId, {
      status: 'CANCELADO'
    })
  }

  async cancelAssinatura(tenantId: string, userId: string, motivo: string, request: any) {
    // Buscar tenant e usuário
    const tenant = await this.findById(tenantId)
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    // Atualizar status do tenant para CANCELADO
    await this.repository.update(tenantId, {
      status: 'CANCELADO',
      data_exportacao_dados: new Date() // Marcar que dados foram exportados
    })

    // Registrar log de cancelamento
    await ActivityLogService.log({
      tenant_id: tenantId,
      user_id: userId,
      tipo: 'TENANT_CANCELADO' as any,
      acao: `Assinatura cancelada por ${user.nome}`,
      detalhes: { motivo },
      request
    })

    // Exportar dados automaticamente e enviar por email (assíncrono)
    setImmediate(async () => {
      try {
        // Exportar dados para CSV
        const exportedData = await DataExportService.exportTenantData(tenantId)

        // Preparar stats para o email
        const stats = {
          leads: exportedData.leads.totalRecords,
          imoveis: exportedData.imoveis.totalRecords,
          proprietarios: exportedData.proprietarios.totalRecords,
          negociacoes: exportedData.negociacoes.totalRecords,
          agendamentos: exportedData.agendamentos.totalRecords
        }

        // Enviar email com os CSVs anexados
        await sendGridService.sendDataExportEmail(
          user.email,
          user.nome,
          tenant.nome,
          stats,
          0, // diasRestantes: 0 pois a assinatura foi cancelada
          [
            { filename: exportedData.leads.fileName, content: exportedData.leads.csvContent },
            { filename: exportedData.imoveis.fileName, content: exportedData.imoveis.csvContent },
            { filename: exportedData.proprietarios.fileName, content: exportedData.proprietarios.csvContent },
            { filename: exportedData.negociacoes.fileName, content: exportedData.negociacoes.csvContent },
            { filename: exportedData.agendamentos.fileName, content: exportedData.agendamentos.csvContent }
          ]
        )

        console.log(`✅ Dados exportados automaticamente para ${user.email} no cancelamento`)
      } catch (error) {
        console.error('❌ Erro ao exportar dados no cancelamento:', error)
      }
    })

    // Enviar email de confirmação de cancelamento (assíncrono)
    setImmediate(async () => {
      try {
        const primeiroNome = user.nome.split(' ')[0]
        await sendGridService.sendEmail({
          to: user.email,
          subject: `Confirmação de Cancelamento - ${tenant.nome}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C2C2C;
      background-color: #FAF8F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
    }
    .content {
      padding: 40px 30px;
    }
    .info-box {
      background: #FEF2F2;
      border-left: 4px solid #DC2626;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .footer {
      background: #F8F9FA;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6C757D;
      border-top: 1px solid #E9ECEF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚫 Assinatura Cancelada</h1>
    </div>

    <div class="content">
      <p style="font-size: 18px; font-weight: 600;">
        Olá, ${primeiroNome}!
      </p>

      <p>
        Confirmamos o cancelamento da sua assinatura do <strong>ImobiFlow</strong> para <strong>${tenant.nome}</strong>.
      </p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #DC2626;">📋 Próximos Passos:</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Seu acesso ao sistema será bloqueado imediatamente</li>
          <li>Todos os seus dados serão mantidos por <strong>30 dias</strong></li>
          <li><strong>✅ Seus dados foram exportados automaticamente e enviados para este email em formato CSV</strong></li>
          <li>Após 30 dias, todos os dados serão excluídos permanentemente</li>
        </ul>
      </div>

      <p>
        <strong>Motivo do cancelamento:</strong><br>
        <em>"${motivo}"</em>
      </p>

      <p>
        Lamentamos vê-lo partir! Seu feedback é muito importante para nós e nos ajudará a melhorar nosso serviço.
      </p>

      <p style="margin-top: 30px;">
        Se tiver alguma dúvida ou quiser reverter o cancelamento, entre em contato conosco em até 30 dias: <strong>contato@integrius.com.br</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ImobiFlow</strong> - Gestão Imobiliária Inteligente
      </p>
      <p style="margin: 0; font-size: 12px;">
        © 2025-2026 ImobiFlow. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
          `.trim()
        })
        console.log(`✅ Email de confirmação de cancelamento enviado para ${user.email}`)
      } catch (error) {
        console.error('❌ Erro ao enviar email de cancelamento:', error)
      }
    })

    return {
      tenant_id: tenantId,
      status: 'CANCELADO',
      data_cancelamento: new Date()
    }
  }

  private getPlanLimits(plano: string) {
    switch (plano) {
      case 'BASICO':
        return {
          limite_usuarios: 3,
          limite_imoveis: 100,
          limite_storage_mb: 1000
        }
      case 'PRO':
        return {
          limite_usuarios: 10,
          limite_imoveis: 500,
          limite_storage_mb: 5000
        }
      case 'ENTERPRISE':
        return {
          limite_usuarios: 999,
          limite_imoveis: 99999,
          limite_storage_mb: 50000
        }
      case 'CUSTOM':
        return {
          limite_usuarios: 999,
          limite_imoveis: 99999,
          limite_storage_mb: 100000
        }
      default:
        return {
          limite_usuarios: 3,
          limite_imoveis: 100,
          limite_storage_mb: 1000
        }
    }
  }
}
