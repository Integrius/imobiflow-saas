import { PrismaClient } from '@prisma/client'

interface CreateUserData {
  nome: string
  email: string
  senha_hash: string
  tipo: 'ADMIN' | 'GESTOR' | 'CORRETOR'
}

interface CreateCorretorData {
  user_id: string
  creci: string
  telefone: string
  especializacoes: string[]
  comissao_padrao: number
}

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email }
    })
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id }
    })
  }

  async createUser(data: CreateUserData) {
    return await this.prisma.user.create({
      data
    })
  }

  async createCorretor(data: CreateCorretorData) {
    return await this.prisma.corretor.create({
      data
    })
  }

  async updateLastLogin(userId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { ultimo_login: new Date() }
    })
  }
}
