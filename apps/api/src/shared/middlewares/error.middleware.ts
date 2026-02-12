import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors/AppError'
import { ZodError } from 'zod'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
      code: error.code,
    })
  }

  // Handle Zod validation errors
  const zodError = error as unknown as ZodError
  if (zodError.issues !== undefined && Array.isArray(zodError.issues)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Dados inválidos',
      errors: zodError.issues,
    })
  }

  console.error(error)

  return reply.status(500).send({
    status: 'error',
    message: 'Erro interno do servidor',
  })
}
