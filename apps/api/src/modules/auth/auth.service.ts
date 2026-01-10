import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { AuthRepository } from './auth.repository'
import { RegisterDTO, LoginDTO } from './auth.schema'
import { AppError } from '../../shared/errors/AppError'
import { PasswordGeneratorService } from '../../shared/utils/password-generator.service'
import { sendGridService } from '../../shared/services/sendgrid.service'
import { twilioService } from '../../shared/services/twilio.service'

export class AuthService {
  private repository: AuthRepository

  constructor(private prisma: PrismaClient) {
    this.repository = new AuthRepository(prisma)
  }

  async register(data: RegisterDTO, tenantId: string) {
    // Verificar se email já existe no tenant
    const userExists = await this.repository.findByEmail(data.email, tenantId)
    if (userExists) {
      throw new AppError('Email já cadastrado', 400)
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(data.senha, 10)

    // Criar usuário
    const user = await this.repository.createUser({
      tenant_id: tenantId,
      nome: data.nome,
      email: data.email,
      senha_hash,
      tipo: data.tipo || 'CORRETOR'
    })

    // Se tipo for CORRETOR, criar registro de corretor
    if (user.tipo === 'CORRETOR') {
      await this.repository.createCorretor({
        tenant_id: tenantId,
        user_id: user.id,
        creci: data.creci || '',
        telefone: data.telefone,
        especializacoes: data.especializacoes || [],
        comissao_padrao: data.comissao_padrao || 3.0
      })
    }

    // Gerar token com tenant_id e tipo
    const token = this.generateToken(user.id, tenantId, user.tipo)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        tenant_id: user.tenant_id
      },
      token
    }
  }

  async login(data: LoginDTO, tenantId: string | null) {
    // Buscar usuário no tenant (se fornecido) ou em qualquer tenant
    const user = tenantId
      ? await this.repository.findByEmail(data.email, tenantId)
      : await this.repository.findByEmailAnyTenant(data.email)

    if (!user) {
      throw new AppError('Email ou senha inválidos', 401)
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      throw new AppError('Usuário inativo. Entre em contato com o administrador.', 403)
    }

    // Verificar status da conta
    if (user.status_conta === 'SUSPENSO') {
      throw new AppError('Conta suspensa. Entre em contato com o administrador para reativação.', 403)
    }

    if (user.status_conta === 'CANCELADO') {
      throw new AppError('Conta cancelada. Entre em contato com o administrador.', 403)
    }

    // Verificar se usuário tem senha (não é OAuth)
    if (!user.senha_hash) {
      throw new AppError('Use o login com Google para esta conta', 401)
    }

    // NOVIDADE: Verificar se é primeiro acesso com senha temporária
    if (user.primeiro_acesso && user.senha_temporaria && user.senha_temp_expira_em) {
      // Validar senha temporária
      if (data.senha !== user.senha_temporaria) {
        throw new AppError('Senha temporária inválida', 401)
      }

      // Verificar se senha temporária expirou
      if (PasswordGeneratorService.isExpired(user.senha_temp_expira_em)) {
        throw new AppError(
          'Senha temporária expirada. Entre em contato com o administrador para gerar uma nova.',
          403
        )
      }

      // Marcar senha temporária como usada
      await this.prisma.user.update({
        where: { id: user.id },
        data: { senha_temp_usada: true }
      })

      // Atualizar último login
      await this.repository.updateLastLogin(user.id)

      // Gerar token com tenant_id e tipo
      const token = this.generateToken(user.id, user.tenant_id, user.tipo)

      // Retornar com flag de primeiro acesso
      return {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          tenant_id: user.tenant_id,
          primeiro_acesso: true // Flag para frontend redirecionar
        },
        token
      }
    }

    // Login normal com senha permanente
    const passwordMatch = await bcrypt.compare(data.senha, user.senha_hash)
    if (!passwordMatch) {
      throw new AppError('Email ou senha inválidos', 401)
    }

    // Atualizar último login
    await this.repository.updateLastLogin(user.id)

    // Gerar token com tenant_id e tipo
    const token = this.generateToken(user.id, user.tenant_id, user.tipo)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        tenant_id: user.tenant_id,
        primeiro_acesso: false
      },
      token
    }
  }

  async me(userId: string) {
    const user = await this.repository.findById(userId)
    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      ativo: user.ativo
    }
  }

  async googleLogin(credential: string, tenantId: string | null) {
    try {
      // Verify Google token and get user info
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
      )

      const { sub: googleId, email, name } = response.data

      if (!email) {
        throw new AppError('Email não fornecido pelo Google', 400)
      }

      // Buscar usuário no tenant (se fornecido) ou em qualquer tenant
      let user = tenantId
        ? await this.repository.findByEmail(email, tenantId)
        : await this.repository.findByEmailAnyTenant(email)

      if (user) {
        // Usuário já existe no tenant

        // Verificar se está ativo
        if (!user.ativo) {
          throw new AppError('Usuário inativo. Entre em contato com o administrador.', 403)
        }

        // Se ainda não tem google_id vinculado, vincular agora
        if (!user.google_id) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { google_id: googleId }
          })
        } else if (user.google_id !== googleId) {
          // Email existe mas com outro google_id - possível tentativa de invasão
          throw new AppError('Este email já está vinculado a outra conta Google', 403)
        }
      } else {
        // Usuário não existe

        // Se não há tenant, não pode criar novo usuário via Google
        // (criação de usuário requer tenant)
        if (!tenantId) {
          throw new AppError('Usuário não encontrado. Faça login em um tenant específico para criar uma conta.', 404)
        }

        // Criar novo usuário no tenant
        // NOTA: Por padrão, novos usuários via Google são criados como CORRETOR
        // ADMIN deve ser criado manualmente via /setup ou /users
        user = await this.prisma.user.create({
          data: {
            tenant_id: tenantId,
            nome: name || email.split('@')[0],
            email,
            google_id: googleId,
            tipo: 'CORRETOR',
            ativo: true
          }
        })

        // Se criar CORRETOR, criar registro de corretor também
        await this.repository.createCorretor({
          tenant_id: tenantId,
          user_id: user.id,
          creci: '',
          telefone: '',
          especializacoes: [],
          comissao_padrao: 3.0
        })
      }

      // Update last login
      await this.repository.updateLastLogin(user.id)

      // Generate token com tenant_id e tipo
      const token = this.generateToken(user.id, user.tenant_id, user.tipo)

      return {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          tenant_id: user.tenant_id
        },
        token
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Erro ao autenticar com Google', 401)
    }
  }

  private generateToken(userId: string, tenantId: string, tipo: string): string {
    const secret = process.env.JWT_SECRET || 'imobiflow-secret-key'
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

    return jwt.sign(
      {
        userId,
        tenantId,
        tipo
      },
      secret,
      { expiresIn } as jwt.SignOptions
    )
  }

  verifyToken(token: string): { userId: string; tenantId: string; tipo: string } {
    const secret = process.env.JWT_SECRET || 'imobiflow-secret-key'

    try {
      const decoded = jwt.verify(token, secret) as { userId: string; tenantId: string; tipo: string }
      return decoded
    } catch (error) {
      throw new AppError('Token inválido', 401)
    }
  }

  async definirSenhaPrimeiroAcesso(userId: string, senha: string) {
    // Buscar usuário com corretor (se existir) e tenant
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        corretor: true,
        tenant: {
          select: {
            slug: true,
            nome: true
          }
        }
      }
    })

    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    // Verificar se é realmente primeiro acesso
    if (!user.primeiro_acesso) {
      throw new AppError('Senha já foi definida anteriormente', 400)
    }

    // Verificar se senha temporária foi usada
    if (!user.senha_temp_usada) {
      throw new AppError('Faça login com a senha temporária antes de definir uma nova senha', 400)
    }

    // Hash da nova senha
    const senha_hash = await bcrypt.hash(senha, 10)

    // Atualizar usuário: nova senha permanente + limpar dados temporários
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        senha_hash,
        primeiro_acesso: false,
        senha_temporaria: null,
        senha_temp_expira_em: null,
        senha_temp_usada: false,
        updated_at: new Date()
      }
    })

    // 🔔 Enviar notificações assíncronas (não bloqueantes)
    setImmediate(async () => {
      try {
        console.log(`📧 [PrimeiroAcesso] Enviando confirmação para ${user.email}...`)

        // 📧 Email de confirmação
        await sendGridService.send({
          to: user.email,
          from: {
            email: 'noreply@integrius.com.br',
            name: user.tenant?.nome || 'Integrius'
          },
          subject: '✅ Senha Definida com Sucesso - Integrius',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">✅ Senha Definida!</h1>
              </div>

              <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #2C2C2C;">
                  Olá, <strong>${user.nome.split(' ')[0]}</strong>! 👋
                </p>

                <p style="font-size: 14px; color: #8B7F76; line-height: 1.6;">
                  Sua senha foi definida com <strong>sucesso</strong>! ✨
                </p>

                <p style="font-size: 14px; color: #8B7F76; line-height: 1.6;">
                  A partir de agora, você pode acessar o sistema usando:
                </p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #2C2C2C;">
                    <strong>📧 Email:</strong> ${user.email}<br>
                    <strong>🔒 Senha:</strong> A senha que você acabou de definir
                  </p>
                </div>

                <p style="font-size: 14px; color: #8B7F76; line-height: 1.6;">
                  🌐 <strong>Acesse:</strong>
                  <a href="https://${user.tenant?.slug}.integrius.com.br/login"
                     style="color: #8FD14F; text-decoration: none;">
                    ${user.tenant?.slug}.integrius.com.br/login
                  </a>
                </p>

                <div style="background: #D1F2EB; border-left: 4px solid #00C48C; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; color: #00695C;">
                    💡 <strong>Dica:</strong> Guarde sua senha em um local seguro e nunca compartilhe com outras pessoas.
                  </p>
                </div>

                <p style="font-size: 12px; color: #8B7F76; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
                  Qualquer dúvida, entre em contato com o administrador.<br>
                  <em>Integrius - Gestão Imobiliária Inteligente</em>
                </p>
              </div>
            </div>
          `
        })

        console.log(`✅ [PrimeiroAcesso] Email enviado com sucesso`)

        // 📱 WhatsApp de confirmação (se corretor e tiver telefone)
        if (user.corretor?.telefone && twilioService.isEnabled()) {
          console.log(`📱 [PrimeiroAcesso] Enviando WhatsApp para ${user.corretor.telefone}...`)

          const primeiroNome = user.nome.split(' ')[0]

          await twilioService.sendWhatsApp({
            to: user.corretor.telefone,
            message: `✅ *Senha Definida - ${user.tenant?.nome}*

Olá, ${primeiroNome}! 👋

Sua senha foi definida com *sucesso*! ✨

Agora você pode acessar o sistema usando:

📧 *Email:* ${user.email}
🔒 *Senha:* A que você acabou de definir

🌐 *Acesse:* https://${user.tenant?.slug}.integrius.com.br/login

💡 *Importante:* Guarde sua senha em local seguro e nunca compartilhe com outras pessoas.

---
Integrius - Gestão Imobiliária Inteligente`.trim()
          })

          console.log(`✅ [PrimeiroAcesso] WhatsApp enviado com sucesso`)
        }

      } catch (error: any) {
        console.error(`❌ [PrimeiroAcesso] Erro ao enviar notificações:`, error.message || error)
      }
    })

    // Gerar novo token
    const token = this.generateToken(user.id, user.tenant_id, user.tipo)

    return {
      message: 'Senha definida com sucesso! Você já pode usar o sistema normalmente.',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        primeiro_acesso: false
      },
      token
    }
  }
}
