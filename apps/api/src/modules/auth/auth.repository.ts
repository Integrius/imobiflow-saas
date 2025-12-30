import { PrismaClient } from '@prisma/client'

interface CreateUserData {
  tenant_id: string
  nome: string
  email: string
  senha_hash?: string
  google_id?: string
  tipo: 'ADMIN' | 'GESTOR' | 'CORRETOR'
}

interface CreateCorretorData {
  tenant_id: string
  user_id: string
  creci: string
  telefone: string
  especializacoes: string[]
  comissao_padrao: number
}

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string, tenantId: string) {
    return await this.prisma.user.findUnique({
      where: {
        tenant_id_email: {
          tenant_id: tenantId,
          email: email
        }
      }
    })
  }

  async findByEmailAnyTenant(email: string) {
    return await this.prisma.user.findFirst({
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
