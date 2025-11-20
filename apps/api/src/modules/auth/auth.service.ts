import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { prisma } from '../../shared/database/prisma.service'
import type { RegisterDTO, LoginDTO } from './auth.schema'

export class AuthService {
  async register(data: RegisterDTO) {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (userExists) {
      throw new Error('Email já cadastrado')
    }

    const senhaHash = await hash(data.senha, 10)

    const user = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha_hash: senhaHash,
        tipo: 'CORRETOR',
        corretor: {
          create: {
            creci: data.creci,
            telefone: data.telefone,
            especializacoes: [],
            comissao_padrao: 3.0,
          },
        },
      },
      include: {
        corretor: true,
      },
    })

    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
      token,
    }
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        corretor: true,
      },
    })

    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const senhaValida = await compare(data.senha, user.senha_hash)

    if (!senhaValida) {
      throw new Error('Credenciais inválidas')
    }

    if (!user.ativo) {
      throw new Error('Usuário inativo')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { ultimo_login: new Date() },
    })

    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
      token,
    }
  }

  private generateToken(userId: string): string {
    return sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })
  }
}
