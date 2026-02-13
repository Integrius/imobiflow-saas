import { FastifyInstance } from 'fastify'

/**
 * Rotas públicas da Landing Page
 *
 * Não requer autenticação - acessível publicamente
 */
export async function landingRoutes(server: FastifyInstance) {

  /**
   * GET /api/v1/public/landing/config
   *
   * Retorna configuração pública da landing page
   *
   * Inclui:
   * - URL da imagem hero (Cloudinary ou fallback)
   * - CTAs
   * - Informações de contato
   *
   * Acesso: Público (sem autenticação)
   */
  server.get('/config', async (request, reply) => {
    try {
      // Tentar buscar imagem hero do Cloudinary
      let heroImageUrl = '/Emoticon.png' // Fallback padrão
      let heroImageSource: 'cloudinary' | 'local' | 'env' = 'local'

      // Prioridade 1: Variável de ambiente
      if (process.env.LANDING_HERO_IMAGE_URL) {
        heroImageUrl = process.env.LANDING_HERO_IMAGE_URL
        heroImageSource = 'env'
      } else {
        // Prioridade 2: Cloudinary (se configurado)
        try {
          const cloudinary = (await import('../../config/cloudinary')).default
          const result = await cloudinary.api.resource('vivoly/landing/hero-image', {
            resource_type: 'image'
          })
          heroImageUrl = result.secure_url
          heroImageSource = 'cloudinary'
        } catch (error: any) {
          // Imagem não existe no Cloudinary ou Cloudinary não configurado
          // Usar fallback local
        }
      }

      return reply.send({
        success: true,
        data: {
          hero: {
            imagePath: heroImageUrl,
            imageSource: heroImageSource,
            imageAlt: 'Vivoly - Gestão Imobiliária Inteligente',
            imageWidth: 520,
            imageHeight: 520,
          },
          cta: {
            primary: 'Começar Grátis',
            secondary: 'Ver Demo',
          },
          contact: {
            email: process.env.LANDING_CONTACT_EMAIL || 'contato@vivoly.com.br',
            whatsapp: process.env.LANDING_CONTACT_WHATSAPP || '5511999999999',
          },
          // Metadados úteis
          _meta: {
            cached: false,
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      })
    } catch (error: any) {
      server.log.error({ error }, 'Erro ao buscar configuração da landing page')

      // Em caso de erro, retornar configuração padrão
      return reply.send({
        success: true,
        data: {
          hero: {
            imagePath: '/Emoticon.png',
            imageSource: 'local' as const,
            imageAlt: 'Vivoly - Gestão Imobiliária Inteligente',
            imageWidth: 520,
            imageHeight: 520,
          },
          cta: {
            primary: 'Começar Grátis',
            secondary: 'Ver Demo',
          },
          contact: {
            email: 'contato@vivoly.com.br',
            whatsapp: '5511999999999',
          },
          _meta: {
            cached: false,
            timestamp: new Date().toISOString(),
            version: '1.0',
            fallback: true
          }
        }
      })
    }
  })

  /**
   * GET /api/v1/public/landing/hero-image-url
   *
   * Retorna apenas a URL da imagem hero (endpoint simplificado)
   *
   * Acesso: Público (sem autenticação)
   */
  server.get('/hero-image-url', async (request, reply) => {
    try {
      // Prioridade 1: Variável de ambiente
      if (process.env.LANDING_HERO_IMAGE_URL) {
        return reply.send({
          success: true,
          url: process.env.LANDING_HERO_IMAGE_URL,
          source: 'env'
        })
      }

      // Prioridade 2: Cloudinary
      try {
        const cloudinary = (await import('../../config/cloudinary')).default
        const result = await cloudinary.api.resource('vivoly/landing/hero-image', {
          resource_type: 'image'
        })
        return reply.send({
          success: true,
          url: result.secure_url,
          source: 'cloudinary'
        })
      } catch (cloudinaryError: any) {
        // Fallback: imagem local
        return reply.send({
          success: true,
          url: '/Emoticon.png',
          source: 'local'
        })
      }
    } catch (error: any) {
      server.log.error({ error }, 'Erro ao buscar URL da hero image')
      return reply.send({
        success: true,
        url: '/Emoticon.png',
        source: 'local',
        fallback: true
      })
    }
  })
}
