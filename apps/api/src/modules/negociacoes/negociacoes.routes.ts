import { FastifyInstance } from 'fastify'
import { NegociacoesController } from './negociacoes.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

export async function negociacoesRoutes(server: FastifyInstance) {
  const controller = new NegociacoesController(server.prisma)

  // Todas as rotas requerem autenticação
  server.addHook('preHandler', authMiddleware)

  // Listar negociações com filtros
  server.get('/', async (request, reply) => {
    return controller.list(request, reply)
  })

  // Estatísticas
  server.get('/stats', async (request, reply) => {
    return controller.getStats(request, reply)
  })

  // Buscar por ID
  server.get('/:id', async (request, reply) => {
    return controller.getById(request, reply)
  })

  // Criar nova negociação
  server.post('/', async (request, reply) => {
    return controller.create(request, reply)
  })

  // Atualizar negociação
  server.put('/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  // Mudar status (pipeline)
  server.patch('/:id/status', async (request, reply) => {
    return controller.changeStatus(request, reply)
  })

  // Adicionar comissão
  server.post('/:id/comissoes', async (request, reply) => {
    return controller.addComissao(request, reply)
  })

  // Adicionar documento
  server.post('/:id/documentos', async (request, reply) => {
    return controller.addDocumento(request, reply)
  })

  // Excluir negociação
  server.delete('/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })
}
