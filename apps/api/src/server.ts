import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

const server = Fastify({
  logger: true
})

server.register(cors)
server.register(helmet)

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3333')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
