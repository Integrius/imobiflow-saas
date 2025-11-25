import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
