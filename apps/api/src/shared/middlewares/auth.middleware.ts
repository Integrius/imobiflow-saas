import type { FastifyRequest, FastifyReply } from 'fastify'
import { verify } from 'jsonwebtoken'
import { prisma } from '../database/prisma.service'

interface TokenPayload {
  userId: string
  tenantId: string
  tipo: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      tipo: string
      tenant_id: string
    }
  }
}

/**
 * Middleware de autenticação JWT
 *
 * Valida o token JWT e carrega informações do usuário no request
 * IMPORTANTE: Este middleware assume que tenantMiddleware já foi executado
 *
 * Prioridade de leitura do token:
 * 1. Cookie httpOnly (seguro, protegido contra XSS)
 * 2. Header Authorization (fallback para compatibilidade)
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Tentar ler token do cookie httpOnly (prioridade)
  let token = request.cookies?.token

  // Fallback: Ler do header Authorization (compatibilidade)
  if (!token) {
    const authHeader = request.headers.authorization
    if (authHeader) {
      const parts = authHeader.split(' ')
      token = parts[1]  // Bearer TOKEN
    }
  }

  if (!token) {
    return reply.status(401).send({ error: 'Token não fornecido' })
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        tipo: true,
        tenant_id: true,
        ativo: true
      }
    })

    if (!user || !user.ativo) {
      return reply.status(401).send({ error: 'Token inválido ou usuário inativo' })
    }

    // Verificar se o tenant do token corresponde ao tenant do usuário
    if (user.tenant_id !== decoded.tenantId) {
      return reply.status(403).send({ error: 'Token não pertence a este tenant' })
    }

    // Verificar se o tenant do request (do middleware) corresponde ao do token
    if (request.tenantId && request.tenantId !== decoded.tenantId) {
      return reply.status(403).send({ error: 'Token não corresponde ao tenant da requisição' })
    }

    request.user = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
      tenant_id: user.tenant_id
    }
  } catch (error: any) {
    console.error('Erro no auth middleware:', error.message)
    return reply.status(401).send({ error: 'Token inválido' })
  }
}
