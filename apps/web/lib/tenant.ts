/**
 * Utilitário para gerenciamento de tenant no frontend
 *
 * Extrai o tenant_id do subdomínio ou query params (desenvolvimento)
 */

export interface TenantInfo {
  tenantId: string | null;
  subdomain: string | null;
  isDevelopment: boolean;
  isMarketplace?: boolean;
}

/**
 * Extrai informações do tenant da URL atual
 *
 * Ordem de prioridade:
 * 1. Query param ?tenant_id=xxx (desenvolvimento)
 * 2. Subdomínio (produção)
 */
export function getTenantInfo(): TenantInfo {
  if (typeof window === 'undefined') {
    return {
      tenantId: null,
      subdomain: null,
      isDevelopment: false
    };
  }

  // 1. Tentar extrair do query param (desenvolvimento)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantIdFromQuery = urlParams.get('tenant_id');

  if (tenantIdFromQuery) {
    return {
      tenantId: tenantIdFromQuery,
      subdomain: null,
      isDevelopment: true
    };
  }

  // 2. Extrair do subdomínio (produção)
  const hostname = window.location.hostname;

  // Ignorar localhost e IPs
  if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return {
      tenantId: null,
      subdomain: null,
      isDevelopment: true
    };
  }

  // Extrair subdomínio (ex: vivoly.integrius.com.br → vivoly)
  const parts = hostname.split('.');

  // Lista de domínios base que NÃO são tenants
  const baseDomains = ['integrius.com.br', 'integrius.com'];
  const marketplaceDomains = ['vivoly.com.br', 'vivoly.com'];

  const isBaseDomain = baseDomains.some(domain => hostname === domain || hostname === `www.${domain}`);
  const isMarketplace = marketplaceDomains.some(domain => hostname === domain || hostname === `www.${domain}`);

  // vivoly.com.br = Marketplace (landing page de produtos)
  if (isMarketplace) {
    return {
      tenantId: null,
      subdomain: null,
      isDevelopment: false,
      isMarketplace: true
    };
  }

  // integrius.com.br = Domínio base do SaaS (sem landing page própria)
  if (isBaseDomain) {
    return {
      tenantId: null,
      subdomain: null,
      isDevelopment: false,
      isMarketplace: false
    };
  }

  // Se tem 3+ partes (subdominio.dominio.com.br)
  if (parts.length >= 3) {
    const subdomain = parts[0];

    // Ignorar subdomínios reservados (não são tenants)
    if (!['www', 'api', 'admin', 'integrius'].includes(subdomain)) {
      return {
        tenantId: null, // Será resolvido pelo backend via slug
        subdomain,
        isDevelopment: false
      };
    }
  }

  return {
    tenantId: null,
    subdomain: null,
    isDevelopment: false
  };
}

/**
 * Retorna o tenant_id se disponível
 *
 * Ordem de prioridade:
 * 1. localStorage (armazenado durante login)
 * 2. URL (query param ou subdomínio)
 */
export function getTenantId(): string | null {
  // Primeiro verifica localStorage (armazenado durante login)
  if (typeof window !== 'undefined') {
    const storedTenantId = localStorage.getItem('tenant_id');
    if (storedTenantId) {
      return storedTenantId;
    }
  }

  // Fallback para detecção via URL
  const info = getTenantInfo();
  return info.tenantId;
}

/**
 * Retorna o subdomínio se disponível
 */
export function getSubdomain(): string | null {
  const info = getTenantInfo();
  return info.subdomain;
}

/**
 * Verifica se está em modo desenvolvimento
 */
export function isDevelopment(): boolean {
  const info = getTenantInfo();
  return info.isDevelopment;
}

/**
 * Gera URL completa com tenant (para redirects)
 */
export function getTenantUrl(path: string): string {
  const info = getTenantInfo();

  if (info.isDevelopment && info.tenantId) {
    // Modo desenvolvimento: usar query param
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}tenant_id=${info.tenantId}`;
  }

  // Produção: URL normal
  return path;
}
