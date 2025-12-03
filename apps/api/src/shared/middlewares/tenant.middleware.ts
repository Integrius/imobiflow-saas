import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../errors/AppError'

// Estende o tipo FastifyRequest para incluir tenantId
declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string
  }
}

/**
 * Middleware para extrair e validar o tenant_id do request
 *
 * O tenant pode ser identificado de 3 formas (em ordem de prioridade):
 * 1. Header X-Tenant-ID (para APIs)
 * 2. Subdomínio (ex: cliente.imobiflow.com)
 * 3. Query param ?tenant=slug (para testes)
 */
export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const prisma = new PrismaClient()

  try {
    let tenantId: string | null = null

    // 1. Tentar obter do header X-Tenant-ID
    const headerTenantId = request.headers['x-tenant-id'] as string
    if (headerTenantId) {
      tenantId = headerTenantId
    }

    // 2. Tentar obter do subdomínio
    if (!tenantId) {
      const host = request.headers.host || ''
      const subdomain = extractSubdomain(host)

      if (subdomain) {
        const tenant = await prisma.tenant.findUnique({
          where: { subdominio: subdomain },
          select: { id: true, status: true }
        })

        if (tenant) {
          if (tenant.status !== 'ATIVO' && tenant.status !== 'TRIAL') {
            throw new AppError('Tenant inativo ou suspenso', 403)
          }
          tenantId = tenant.id
        }
      }
    }

    // 3. Tentar obter do query param (para testes)
    if (!tenantId && request.query && typeof request.query === 'object') {
      const queryTenant = (request.query as any).tenant
      if (queryTenant) {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: queryTenant },
          select: { id: true, status: true }
        })

        if (tenant) {
          if (tenant.status !== 'ATIVO' && tenant.status !== 'TRIAL') {
            throw new AppError('Tenant inativo ou suspenso', 403)
          }
          tenantId = tenant.id
        }
      }
    }

    // Se não encontrou tenant_id, usar o default (para single-tenant)
    if (!tenantId) {
      tenantId = 'default-tenant-id'
    }

    // Validar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        status: true,
        plano: true,
        limite_usuarios: true,
        limite_imoveis: true,
        total_usuarios: true,
        total_imoveis: true
      }
    })

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    // Verificar status do tenant
    if (tenant.status !== 'ATIVO' && tenant.status !== 'TRIAL') {
      throw new AppError('Tenant inativo ou suspenso', 403)
    }

    // Adicionar tenant_id ao request
    request.tenantId = tenantId

    await prisma.$disconnect()
  } catch (error) {
    await prisma.$disconnect()

    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Erro ao validar tenant', 500)
  }
}

/**
 * Extrai o subdomínio do host
 * Ex: cliente.imobiflow.com -> cliente
 */
function extractSubdomain(host: string): string | null {
  // Remove porta se houver
  const hostname = host.split(':')[0]

  // Lista de domínios principais
  const mainDomains = [
    'imobiflow.com',
    'localhost',
    '127.0.0.1'
  ]

  // Verifica se é um dos domínios principais
  const isMainDomain = mainDomains.some(domain => hostname === domain || hostname === `www.${domain}`)
  if (isMainDomain) {
    return null
  }

  // Extrai o subdomínio
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    // Remove 'www' se for o primeiro
    if (parts[0] === 'www') {
      parts.shift()
    }
    // Retorna o primeiro segmento como subdomínio
    return parts[0]
  }

  return null
}

/**
 * Middleware opcional para verificar limites do plano
 */
export async function checkTenantLimits(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const tenantId = request.tenantId

  if (!tenantId) {
    throw new AppError('Tenant não identificado', 401)
  }

  const prisma = new PrismaClient()

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        plano: true,
        limite_usuarios: true,
        limite_imoveis: true,
        total_usuarios: true,
        total_imoveis: true
      }
    })

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    // Adicionar informações do tenant ao request para uso posterior
    (request as any).tenant = tenant

    await prisma.$disconnect()
  } catch (error) {
    await prisma.$disconnect()

    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Erro ao verificar limites do tenant', 500)
  }
}
