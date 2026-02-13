/**
 * Configurações da Landing Page
 *
 * ✅ IMPLEMENTADO: API dinâmica para configuração da landing page
 *
 * Endpoints disponíveis:
 * - POST /api/v1/admin/landing/hero-image (upload - apenas admin)
 * - GET /api/v1/public/landing/config (buscar config - público)
 *
 * A configuração agora é buscada da API, permitindo atualizações
 * sem rebuild do frontend.
 */

export interface LandingConfig {
  hero: {
    imagePath: string;
    imageSource?: 'cloudinary' | 'local' | 'env';
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

/**
 * Configuração padrão (fallback se API falhar)
 */
const DEFAULT_CONFIG: LandingConfig = {
  hero: {
    imagePath: '/Emoticon.png',
    imageSource: 'local',
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
};

/**
 * Busca configuração da landing page da API
 *
 * Faz cache em memória por 5 minutos para performance
 */
let cachedConfig: LandingConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function getLandingConfig(): Promise<LandingConfig> {
  // Verificar cache
  const now = Date.now();
  if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    // Determinar URL da API
    const API_BASE_URL =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'))
        ? 'http://localhost:3333/api/v1'
        : 'https://imobiflow-saas-1.onrender.com/api/v1';

    const response = await fetch(`${API_BASE_URL}/public/landing/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 3 segundos
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      cachedConfig = data.data as LandingConfig;
      cacheTimestamp = now;
      return cachedConfig;
    }

    throw new Error('Formato de resposta inválido');
  } catch (error) {
    console.warn('Erro ao buscar configuração da landing page, usando fallback:', error);
    // Retornar configuração padrão em caso de erro
    return DEFAULT_CONFIG;
  }
}

/**
 * Exportação síncrona para compatibilidade com código existente
 * Usa configuração padrão - componentes devem usar getLandingConfig() para versão dinâmica
 */
export const landingConfig: LandingConfig = DEFAULT_CONFIG;

/**
 * Limpar cache (útil para forçar refresh)
 */
export function clearLandingCache() {
  cachedConfig = null;
  cacheTimestamp = 0;
}
