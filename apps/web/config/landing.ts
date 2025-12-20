/**
 * Configurações da Landing Page
 *
 * Este arquivo centraliza as configurações visuais da landing page,
 * incluindo a imagem hero que pode ser substituída futuramente
 * via dashboard administrativo.
 */

export interface LandingConfig {
  hero: {
    /**
     * Caminho da imagem principal da landing page
     * Por padrão: /Emoticon.png
     *
     * Para substituir via dashboard:
     * 1. Fazer upload da nova imagem para /public/
     * 2. Atualizar este valor via API
     * 3. Rebuild do frontend para aplicar mudanças
     *
     * Futuramente será gerenciável via painel administrativo
     */
    imagePath: string;
    imageAlt: string;
    imageWidth: number;
    imageHeight: number;
  };

  cta: {
    primary: string;
    secondary: string;
  };

  contact: {
    email: string;
    whatsapp: string;
  };
}

export const landingConfig: LandingConfig = {
  hero: {
    imagePath: '/Emoticon.png',
    imageAlt: 'Vivoly - Gestão Imobiliária Inteligente',
    imageWidth: 400,
    imageHeight: 400,
  },

  cta: {
    primary: 'Começar Grátis',
    secondary: 'Ver Demo',
  },

  contact: {
    email: 'contato@vivoly.com.br',
    whatsapp: '5511999999999',
  },
};

/**
 * TODO: Implementar endpoint de API para atualização dinâmica
 *
 * POST /api/v1/admin/landing/hero-image
 * - Upload de nova imagem
 * - Validação (formato, tamanho)
 * - Otimização automática
 * - Atualização do arquivo de configuração
 * - Invalidação de cache
 */
