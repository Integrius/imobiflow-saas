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

  async register(data: RegisterDTO) {
    // Verificar se email já existe
    const userExists = await this.repository.findByEmail(data.email)
    if (userExists) {
      throw new AppError('Email já cadastrado', 400)
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(data.senha, 10)

    // Criar usuário
    const user = await this.repository.createUser({
      nome: data.nome,
      email: data.email,
      senha_hash,
      tipo: data.tipo || 'CORRETOR'
    })

    // Se tipo for CORRETOR, criar registro de corretor
    if (user.tipo === 'CORRETOR') {
      await this.repository.createCorretor({
        user_id: user.id,
        creci: data.creci || '',
        telefone: data.telefone,
        especializacoes: data.especializacoes || [],
        comissao_padrao: data.comissao_padrao || 3.0
      })
    }

    // Gerar token
    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      },
      token
    }
  }

  async login(data: LoginDTO) {
    // Buscar usuário
    const user = await this.repository.findByEmail(data.email)
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401)
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(data.senha, user.senha_hash)
    if (!passwordMatch) {
      throw new AppError('Email ou senha inválidos', 401)
    }

    // Atualizar último login
    await this.repository.updateLastLogin(user.id)

    // Gerar token
    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
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

  async googleLogin(credential: string) {
    try {
      // Verify Google token and get user info
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
      )

      const { sub: googleId, email, name } = response.data

      if (!email) {
        throw new AppError('Email não fornecido pelo Google', 400)
      }

      // Check if user exists by google_id
      let user = await this.prisma.user.findUnique({
        where: { google_id: googleId }
      })

      // If not found by google_id, check by email
      if (!user) {
        user = await this.repository.findByEmail(email)

        // If user exists with email but no google_id, link the accounts
        if (user) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { google_id: googleId }
          })
        }
      }

      // If user still doesn't exist, create new user
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            nome: name || email.split('@')[0],
            email,
            google_id: googleId,
            tipo: 'CORRETOR',
            ativo: true
          }
        })
      }

      // Update last login
      await this.repository.updateLastLogin(user.id)

      // Generate token
      const token = this.generateToken(user.id)

      return {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo
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

  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'imobiflow-secret-key'
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

    return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions)
  }

  verifyToken(token: string): { userId: string } {
    const secret = process.env.JWT_SECRET || 'imobiflow-secret-key'
    
    try {
      const decoded = jwt.verify(token, secret) as { userId: string }
      return decoded
    } catch (error) {
      throw new AppError('Token inválido', 401)
    }
  }
}
