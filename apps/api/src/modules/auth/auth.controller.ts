import type { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from './auth.service'
import { registerSchema, loginSchema } from './auth.schema'

const authService = new AuthService()

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body)
      const result = await authService.register(data)
      return reply.status(201).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body)
      const result = await authService.login(data)
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }
}
