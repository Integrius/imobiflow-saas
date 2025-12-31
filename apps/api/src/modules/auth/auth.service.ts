import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { AuthRepository } from './auth.repository'
import { RegisterDTO, LoginDTO } from './auth.schema'
import { AppError } from '../../shared/errors/AppError'

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

    // Verificar se usuário tem senha (não é OAuth)
    if (!user.senha_hash) {
      throw new AppError('Use o login com Google para esta conta', 401)
    }

    // Verificar senha
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
        tenant_id: user.tenant_id
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
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    if (!user.primeiro_acesso) {
      throw new AppError('Senha já foi definida anteriormente', 400)
    }

    // Hash da nova senha
    const senha_hash = await bcrypt.hash(senha, 10)

    // Atualizar usuário
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        senha_hash,
        primeiro_acesso: false,
        updated_at: new Date()
      }
    })

    // Gerar novo token
    const token = this.generateToken(user.id, user.tenant_id, user.tipo)

    return {
      message: 'Senha definida com sucesso',
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
