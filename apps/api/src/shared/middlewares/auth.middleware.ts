import type { FastifyRequest, FastifyReply } from 'fastify'
import { verify } from 'jsonwebtoken'
import { prisma } from '../database/prisma.service'

interface TokenPayload {
  sub: string
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return reply.status(401).send({ error: 'Token não fornecido' })
  }

  const [, token] = authHeader.split(' ')

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    })

    if (!user || !user.ativo) {
      return reply.status(401).send({ error: 'Token inválido' })
    }

    request.user = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
    }
  } catch {
    return reply.status(401).send({ error: 'Token inválido' })
  }
}
