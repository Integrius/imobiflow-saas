import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      tipo: string
    }
  }
}
